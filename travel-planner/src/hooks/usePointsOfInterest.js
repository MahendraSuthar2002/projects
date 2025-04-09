// src/hooks/usePointsOfInterest.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const usePointsOfInterest = (destinations, fetchPois) => {
  const [pois, setPois] = useState([]);
  const [poiError, setPoiError] = useState(null);
  const [poiLoading, setPoiLoading] = useState(false);

  useEffect(() => {
    if (!fetchPois) {
      setPois([]);
      setPoiError(null);
      setPoiLoading(false);
      return;
    }

    const fetchPointsOfInterest = async () => {
      setPoiLoading(true);
      setPoiError(null);
      const allPois = [];
      for (const dest of destinations) {
        try {
          const response = await axios.get(
            `https://api.opentripmap.com/0.1/en/places/radius?radius=10000&lon=${
              dest.position[1]
            }&lat=${
              dest.position[0]
            }&kinds=interesting_places,tourist_attraction&apikey=${
              import.meta.env.VITE_OPENTRIPMAP_API_KEY
            }`
          );
          const poisForDest = response.data.features.map((feature) => ({
            name: feature.properties.name,
            position: [
              feature.geometry.coordinates[1],
              feature.geometry.coordinates[0],
            ],
            relatedDestination: dest.name,
          }));
          allPois.push(...poisForDest);
        } catch (error) {
          console.error(`Error fetching POIs for ${dest.name}:`, error);
          setPoiError(
            "Failed to load points of interest. Please check your OpenTripMap API key."
          );
        }
      }
      setPois(allPois);
      setPoiLoading(false);
    };

    fetchPointsOfInterest();
  }, [destinations, fetchPois]);

  return { pois, poiError, poiLoading };
};

export default usePointsOfInterest;
