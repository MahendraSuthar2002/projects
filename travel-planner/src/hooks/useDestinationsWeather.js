// src/hooks/useDestinationsWeather.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const useDestinationsWeather = (destinations, showWeather) => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!showWeather || !destinations || destinations.length === 0) {
        setWeatherData(destinations || []);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const weatherPromises = destinations.map(async (destination) => {
          try {
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${
                destination.position[0]
              }&lon=${destination.position[1]}&appid=${
                import.meta.env.VITE_OPENWEATHER_API_KEY
              }&units=metric`
            );

            return {
              ...destination,
              weather: {
                loading: false,
                error: null,
                weather: response.data,
              },
            };
          } catch (error) {
            console.error(
              `Error fetching weather for ${destination.name}:`,
              error
            );
            return {
              ...destination,
              weather: {
                loading: false,
                error: "Failed to load weather data",
                weather: null,
              },
            };
          }
        });

        const results = await Promise.all(weatherPromises);
        setWeatherData(results);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setError("Failed to load weather data. Please try again.");
        setWeatherData(
          destinations.map((dest) => ({
            ...dest,
            weather: {
              loading: false,
              error: "Failed to load weather data",
              weather: null,
            },
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [destinations, showWeather]);

  return weatherData;
};

export default useDestinationsWeather;
