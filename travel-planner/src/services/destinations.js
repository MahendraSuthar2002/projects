// src/services/destinations.js
import axios from "axios";

const NOMINATIM_API = "https://nominatim.openstreetmap.org/search";
const OVERPASS_API = "https://overpass-api.de/api/interpreter";

// Cache for storing fetched data
let destinationsCache = {};

// Helper function to handle API errors
const handleApiError = (error, context) => {
  console.error(`Error in ${context}:`, error);
  if (error.response) {
    throw new Error(
      `API Error: ${error.response.status} - ${
        error.response.data?.message || error.response.data || "Unknown error"
      }`
    );
  } else if (error.request) {
    throw new Error("Network Error: Could not reach the server");
  } else {
    throw new Error(`Error: ${error.message}`);
  }
};
// Helper function to validate and format bounding box coordinates
export const formatBoundingBox = (bbox) => {
  if (!bbox || bbox.length !== 4) {
    throw new Error("Invalid bounding box format");
  }

  // Nominatim returns [south, north, west, east]
  // Overpass expects [south, west, north, east]
  const [south, north, west, east] = bbox.map((coord) => parseFloat(coord));

  // Validate coordinates
  if (isNaN(south) || isNaN(north) || isNaN(west) || isNaN(east)) {
    throw new Error("Invalid coordinate values in bounding box");
  }

  if (south < -90 || south > 90 || north < -90 || north > 90) {
    throw new Error("Latitude values must be between -90 and 90");
  }

  if (west < -180 || west > 180 || east < -180 || east > 180) {
    throw new Error("Longitude values must be between -180 and 180");
  }

  return [south, west, north, east].join(",");
};

// Helper function to validate coordinates
const validateCoordinates = (element) => {
  if (element.type === "node") {
    if (!element.lat || !element.lon) {
      return null;
    }
    return [element.lat, element.lon];
  } else if (element.type === "way" && element.center) {
    if (!element.center.lat || !element.center.lon) {
      return null;
    }
    return [element.center.lat, element.center.lon];
  }
  return null;
};

// Get all destinations for a country
const fetchDestinations = async (country) => {
  try {
    console.log(`Fetching destinations for country: ${country}`);

    // First, get the country's OSM ID from Nominatim
    const searchResponse = await axios.get(NOMINATIM_API, {
      params: {
        q: country,
        format: "json",
        limit: 1,
        countrycodes: "",
        featuretype: "country",
      },
      headers: {
        "Accept-Language": "en",
      },
    });

    if (!searchResponse.data || searchResponse.data.length === 0) {
      throw new Error(`No data found for country: ${country}`);
    }

    const countryData = searchResponse.data[0];
    console.log(`Found country data:`, countryData);

    if (!countryData.boundingbox) {
      throw new Error(`No bounding box found for country: ${country}`);
    }

    // Format the bounding box for Overpass API
    const bbox = formatBoundingBox(countryData.boundingbox);
    console.log(`Using bounding box: ${bbox}`);

    // Construct Overpass query using bounding box
    const overpassQuery = `
      [out:json][timeout:90];
      (
        // Cities and towns
        node["place"~"city|town"](${bbox});
        way["place"~"city|town"](${bbox});
        
        // Beaches and coastal areas - expanded query
        node["natural"~"beach|coastline"](${bbox});
        way["natural"~"beach|coastline"](${bbox});
        node["leisure"~"beach_resort|beach"](${bbox});
        way["leisure"~"beach_resort|beach"](${bbox});
        node["tourism"~"beach"](${bbox});
        way["tourism"~"beach"](${bbox});
        node["amenity"~"beach"](${bbox});
        way["amenity"~"beach"](${bbox});
        
        // Mountains and peaks
        node["natural"~"peak|volcano|mountain"](${bbox});
        way["natural"~"peak|volcano|mountain"](${bbox});
        node["tourism"~"viewpoint"](${bbox});
        way["tourism"~"viewpoint"](${bbox});
        
        // Historic sites
        node["historic"](${bbox});
        way["historic"](${bbox});
        
        // Natural attractions
        node["natural"~"volcano|spring|waterfall"](${bbox});
        way["natural"~"volcano|spring|waterfall"](${bbox});
      );
      out body;
      >;
      out skel qt;
    `;

    console.log("Sending Overpass query...");
    const response = await axios.post(OVERPASS_API, overpassQuery, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("Received response from Overpass API");
    if (!response.data || !response.data.elements) {
      console.error("No data returned from Overpass API");
      throw new Error("No data returned from Overpass API");
    }

    console.log(`Found ${response.data.elements.length} elements`);

    // Map the elements to our destination format
    const destinations = response.data.elements
      .map((element) => {
        // Skip if no name
        if (!element.tags?.name) {
          return null;
        }

        // Get coordinates
        const position = validateCoordinates(element);
        if (!position) {
          return null;
        }

        // Determine the type based on the element's tags
        let type = "City";
        if (
          element.tags?.natural === "beach" ||
          element.tags?.leisure === "beach" ||
          element.tags?.leisure === "beach_resort" ||
          element.tags?.tourism === "beach" ||
          element.tags?.amenity === "beach" ||
          element.tags?.natural === "coastline"
        ) {
          type = "Beach";
        } else if (
          element.tags?.natural === "peak" ||
          element.tags?.natural === "mountain" ||
          element.tags?.natural === "volcano"
        ) {
          type = "Mountain";
        } else if (element.tags?.historic) {
          type = "Historic";
        } else if (element.tags?.natural) {
          type = "Natural";
        }

        return {
          name: element.tags.name,
          country: country,
          type: type,
          position: position,
          distance: 0,
          description: element.tags?.description || "",
          wikipedia: element.tags?.wikipedia
            ? `https://en.wikipedia.org/wiki/${
                element.tags.wikipedia.split(":")[1]
              }`
            : "",
        };
      })
      .filter(Boolean); // Remove any null entries

    console.log(`Mapped to ${destinations.length} destinations`);

    if (destinations.length === 0) {
      // If no destinations found, try a more specific query for major cities
      const majorCitiesQuery = `
        [out:json][timeout:90];
        (
          node["place"="city"](${bbox});
          way["place"="city"](${bbox});
        );
        out body;
        >;
        out skel qt;
      `;

      console.log("Trying major cities query...");
      const citiesResponse = await axios.post(OVERPASS_API, majorCitiesQuery, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (citiesResponse.data?.elements?.length > 0) {
        const majorCities = citiesResponse.data.elements
          .map((element) => {
            if (!element.tags?.name) {
              return null;
            }

            const position = validateCoordinates(element);
            if (!position) {
              return null;
            }

            return {
              name: element.tags.name,
              country: country,
              type: "City",
              position: position,
              distance: 0,
              description: element.tags?.description || "",
              wikipedia: element.tags?.wikipedia
                ? `https://en.wikipedia.org/wiki/${
                    element.tags.wikipedia.split(":")[1]
                  }`
                : "",
            };
          })
          .filter(Boolean);

        if (majorCities.length > 0) {
          return majorCities;
        }
      }

      throw new Error(`No destinations found for country: ${country}`);
    }

    return destinations;
  } catch (error) {
    console.error("Error in fetchDestinations:", error);
    handleApiError(error, "fetchDestinations");
    return [];
  }
};

export const getDestinationsByCountry = async (country) => {
  try {
    // Check cache first
    if (destinationsCache[country]) {
      return destinationsCache[country];
    }

    // Fetch destinations
    const destinations = await fetchDestinations(country);

    // Cache the results
    destinationsCache[country] = destinations;
    return destinations;
  } catch (error) {
    handleApiError(error, "getDestinationsByCountry");
    return [];
  }
};

export const filterDestinations = async (filters) => {
  try {
    if (!filters || !filters.country) {
      throw new Error("Country is required for filtering");
    }

    // Get all destinations for the country
    const destinations = await getDestinationsByCountry(filters.country);

    // Filter destinations based on criteria
    const filtered = destinations.filter((dest) => {
      let matches = true;

      // Type filter (case-insensitive)
      if (filters.type) {
        const searchType = filters.type.trim().toLowerCase();
        const destType = dest.type.toLowerCase();
        matches = matches && destType === searchType;
      }

      // Distance filter
      if (filters.distance) {
        matches = matches && dest.distance <= filters.distance;
      }

      return matches;
    });

    // If no destinations match the criteria, return an empty array instead of throwing an error
    return filtered;
  } catch (error) {
    console.error("Error filtering destinations:", error);
    throw error;
  }
};

export const getDestinationDetails = async (destinationName, countryName) => {
  try {
    if (!destinationName || !countryName) {
      throw new Error("Destination name and country name are required");
    }

    const destinations = await getDestinationsByCountry(countryName);
    const destination = destinations.find((d) => d.name === destinationName);

    if (!destination) {
      throw new Error(
        `Destination "${destinationName}" not found in ${countryName}`
      );
    }

    try {
      const detailsResponse = await axios.get(NOMINATIM_API, {
        params: {
          q: `${destinationName}, ${countryName}`,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "TravelPlanner/1.0",
        },
      });

      if (detailsResponse.data && detailsResponse.data.length > 0) {
        return {
          ...destination,
          address: detailsResponse.data[0].display_name,
          type: detailsResponse.data[0].type,
        };
      }
    } catch (error) {
      console.warn(
        `Could not fetch additional details for ${destinationName}:`,
        error
      );
    }

    return destination;
  } catch (error) {
    handleApiError(error, "getDestinationDetails");
  }
};
