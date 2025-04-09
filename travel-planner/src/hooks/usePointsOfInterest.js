// src/hooks/usePointsOfInterest.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const usePointsOfInterest = (destinations, showPointsOfInterest) => {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPointsOfInterest = async () => {
      if (!showPointsOfInterest || !destinations || destinations.length === 0) {
        setPois([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const poiPromises = destinations.map(async (destination) => {
          try {
            const response = await axios.get(
              `https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=${
                destination.position[1]
              }&lat=${
                destination.position[0]
              }&kinds=interesting_places&apikey=${
                import.meta.env.VITE_OPENTRIPMAP_API_KEY
              }`
            );

            if (response.data && response.data.features) {
              return response.data.features.map((feature) => ({
                name: feature.properties.name,
                position: [
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0],
                ],
                relatedDestination: destination.name,
              }));
            }
            return [];
          } catch (error) {
            console.error(
              `Error fetching POIs for ${destination.name}:`,
              error
            );
            return [];
          }
        });

        const results = await Promise.all(poiPromises);
        setPois(results.flat());
      } catch (error) {
        console.error("Error fetching points of interest:", error);
        setError("Failed to load points of interest. Please try again.");
        setPois([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPointsOfInterest();
  }, [destinations, showPointsOfInterest]);

  return { pois, loading, error };
};

export default usePointsOfInterest;
