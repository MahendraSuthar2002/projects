// src/services/api.js
import axios from "axios";

const OPENTRIPMAP_API_KEY = import.meta.env.VITE_OPENTRIPMAP_API_KEY;
const OPENTRIPMAP_BASE_URL = "https://api.opentripmap.com/0.1/en/places";

export const fetchPointsOfInterest = async (lat, lon, radius = 10000) => {
  try {
    const response = await axios.get(`${OPENTRIPMAP_BASE_URL}/radius`, {
      params: {
        radius, // in meters
        lon,
        lat,
        kinds: "tourist_attraction", // Filter for tourist attractions
        apikey: OPENTRIPMAP_API_KEY,
      },
    });
    return response.data.features.map((feature) => ({
      name: feature.properties.name,
      position: [
        feature.geometry.coordinates[1], // latitude
        feature.geometry.coordinates[0], // longitude
      ],
    }));
  } catch (error) {
    console.error("Error fetching points of interest:", error);
    return [];
  }
};
