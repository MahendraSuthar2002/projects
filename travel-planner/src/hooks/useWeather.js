// src/hooks/useWeather.js
import { useState, useEffect } from "react";
import axios from "axios";

const useWeather = (lat, lng) => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${
            import.meta.env.VITE_OPENWEATHERMAP_API_KEY
          }`
        );
        setWeather(response.data);
        setError(null);
      } catch (error) {
        setError("Failed to fetch weather data: " + error.message);
        console.error("Error fetching weather:", error);
      }
    };

    if (lat && lng) {
      fetchWeather();
    }
  }, [lat, lng]);

  return weather;
};

export default useWeather;
