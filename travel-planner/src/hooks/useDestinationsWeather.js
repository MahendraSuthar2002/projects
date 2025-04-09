// src/hooks/useDestinationsWeather.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const useDestinationsWeather = (destinations, fetchWeather) => {
  const [weatherData, setWeatherData] = useState(
    destinations.map((dest) => ({
      ...dest,
      weather: { loading: false, weather: null, error: null },
    }))
  );

  useEffect(() => {
    if (!fetchWeather) {
      setWeatherData(
        destinations.map((dest) => ({
          ...dest,
          weather: { loading: false, weather: null, error: null },
        }))
      );
      return;
    }

    const fetchWeatherForDestinations = async () => {
      setWeatherData(
        destinations.map((dest) => ({
          ...dest,
          weather: { loading: true, weather: null, error: null },
        }))
      );

      const updatedWeatherData = await Promise.all(
        destinations.map(async (dest) => {
          try {
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${
                dest.position[0]
              }&lon=${dest.position[1]}&units=metric&appid=${
                import.meta.env.VITE_OPENWEATHERMAP_API_KEY
              }`
            );
            return {
              ...dest,
              weather: { loading: false, weather: response.data, error: null },
            };
          } catch (error) {
            return {
              ...dest,
              weather: {
                loading: false,
                weather: null,
                error: "Failed to fetch weather: " + error.message,
              },
            };
          }
        })
      );

      setWeatherData(updatedWeatherData);
    };

    fetchWeatherForDestinations();
  }, [destinations, fetchWeather]);

  return weatherData;
};

export default useDestinationsWeather;
