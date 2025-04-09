// src/pages/MapView.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { db } from "../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import useDestinationsWeather from "../hooks/useDestinationsWeather";
import usePointsOfInterest from "../hooks/usePointsOfInterest";
import { useTrip } from "../context/TripContext";
import ChatBox from "../components/collaboration/ChatBox"; // Import ChatBox
import RecentActivities from "../components/collaboration/RecentActivities"; // Import RecentActivities
import UserAvatars from "../components/collaboration/UserAvatars"; 

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component to dynamically re-center the map
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const MapView = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");
  const { trips } = useTrip();

  // State for map controls
  const [showWeather, setShowWeather] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showPointsOfInterest, setShowPointsOfInterest] = useState(false);
  const [mapCenter, setMapCenter] = useState([35.6762, 139.6503]); // Default to Tokyo
  const [weatherError, setWeatherError] = useState(null);
  const [destinationImages, setDestinationImages] = useState({});
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(null);

  // Fetch trip destinations dynamically
  const [destinations, setDestinations] = useState([
    {
      name: "Tokyo",
      position: [35.6762, 139.6503],
      day: 1,
      isStartingPoint: true,
    },
    { name: "Kyoto", position: [35.0116, 135.7681], day: 2 },
    { name: "Osaka", position: [34.6937, 135.5023], day: 3 },
  ]);

  useEffect(() => {
    if (tripId && trips.length > 0) {
      const trip = trips.find((t) => t.id === tripId);
      if (trip) {
        const tripDestinations = trip.destinations || destinations;
        setDestinations(tripDestinations);
        if (tripDestinations.length > 0) {
          setMapCenter(tripDestinations[0].position);
        }
      }
    }
  }, [tripId, trips]);

  // Fetch and cache images from Unsplash
  useEffect(() => {
    const fetchImages = async () => {
      setImageLoading(true);
      setImageError(null);
      const images = {};
      for (const dest of destinations) {
        // Check Firestore for cached image
        const imageDocRef = doc(db, `trips/${tripId}/images`, dest.name);
        const imageDoc = await getDoc(imageDocRef);

        if (imageDoc.exists()) {
          images[dest.name] = imageDoc.data().url;
        } else {
          // Fetch from Unsplash if not cached
          try {
            const response = await axios.get(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                dest.name
              )}&per_page=1&client_id=${import.meta.env.VITE_UNSPLASH_API_KEY}`
            );
            const imageUrl = response.data.results[0]?.urls?.regular
              ? `${response.data.results[0].urls.regular}&w=200&h=150` // Optimize image size
              : "https://via.placeholder.com/150";
            images[dest.name] = imageUrl;

            // Cache the image in Firestore
            await setDoc(imageDocRef, { url: imageUrl });
          } catch (error) {
            console.error(`Error fetching image for ${dest.name}:`, error);
            images[dest.name] = "https://via.placeholder.com/150";
            setImageError("Failed to load some images from Unsplash.");
          }
        }
      }
      setDestinationImages(images);
      setImageLoading(false);
    };

    if (tripId) {
      fetchImages();
    }
  }, [destinations, tripId]);

  // Fetch weather data for destinations
  const weatherData = useDestinationsWeather(destinations, showWeather);

  // Check for weather errors
  useEffect(() => {
    const hasWeatherError = weatherData.some((dest) => dest.weather.error);
    if (hasWeatherError) {
      setWeatherError("Failed to load weather data for some destinations.");
    } else {
      setWeatherError(null);
    }
  }, [weatherData]);

  // Fetch points of interest
  const { pois, poiError, poiLoading } = usePointsOfInterest(
    destinations,
    showPointsOfInterest
  );

  // Filter POIs to ensure they have valid names
  const filteredPois = pois.filter((poi) => poi.name && poi.name.trim() !== "");

  // Simulate traffic by drawing a polyline between destinations
  const trafficRoute = destinations.map((dest) => dest.position);

  // Function to share the map
  const handleShareMap = () => {
    const mapUrl = window.location.href;
    navigator.clipboard.writeText(mapUrl).then(() => {
      alert("Map URL copied to clipboard!");
    });
  };

return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Map View</h1>
        <button
          onClick={handleShareMap}
          className="px-4 py-2 border border-gray-800 rounded hover:bg-gray-200 transition-colors"
        >
          Share Map
        </button>
      </div>
      {weatherError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {weatherError}
        </div>
      )}
      {imageError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {imageError}
        </div>
      )}
      {poiError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {poiError}
        </div>
      )}
      <div className="flex gap-4">
        <div className="w-3/4">
          {/* Existing MapContainer */}
          <MapContainer
            center={mapCenter}
            zoom={5}
            style={{ height: "500px", width: "100%", borderRadius: "8px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <RecenterMap center={mapCenter} />
            {/* Destination Markers */}
            {weatherData.map((dest) => (
              <Marker key={dest.name} position={dest.position}>
                <Popup>
                  <div>
                    <strong className="text-lg">
                      {dest.name} - Day {dest.day}
                      {dest.isStartingPoint && ": Starting Point"}
                    </strong>
                    {imageLoading ? (
                      <p className="text-gray-600 mt-2">Loading image...</p>
                    ) : (
                      destinationImages[dest.name] && (
                        <img
                          src={destinationImages[dest.name]}
                          alt={dest.name}
                          className="w-full h-32 object-cover mt-2 rounded"
                          loading="lazy"
                        />
                      )
                    )}
                    {showWeather && dest.weather.loading && (
                      <p className="text-gray-600 mt-2">Loading weather...</p>
                    )}
                    {showWeather && dest.weather.error && (
                      <p className="text-red-500 mt-2">{dest.weather.error}</p>
                    )}
                    {showWeather && dest.weather.weather && (
                      <p className="text-gray-600 mt-2">
                        Weather: {dest.weather.weather.main.temp}°C,{" "}
                        {dest.weather.weather.weather[0].description}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            {/* Points of Interest Markers */}
            {showPointsOfInterest && poiLoading && (
              <div className="absolute top-0 left-0 p-4 text-gray-600">
                Loading points of interest...
              </div>
            )}
            {showPointsOfInterest &&
              !poiLoading &&
              filteredPois.map((poi, index) => (
                <Marker
                  key={`poi-${index}`}
                  position={poi.position}
                  icon={L.icon({
                    iconUrl:
                      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowUrl:
                      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                    shadowSize: [41, 41],
                  })}
                >
                  <Popup>
                    <div>
                      <strong className="text-lg">{poi.name}</strong>
                      <p className="text-gray-600">
                        Near {poi.relatedDestination}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            {/* Traffic Route (Simulated) */}
            {showTraffic && (
              <Polyline
                positions={trafficRoute}
                color="red"
                weight={3}
                opacity={0.7}
              />
            )}
          </MapContainer>
        </div>
        <div className="w-1/4 flex flex-col gap-4">
          {/* User Avatars Section */}
          <UserAvatars />
          {/* Recent Activities Section */}
          <RecentActivities />
          {/* ChatBox Section */}
          <ChatBox />
          {/* Destinations Section */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Destinations
            </h2>
            <ul className="mb-4">
              {weatherData.map((dest) => (
                <li key={dest.name} className="mb-2 flex items-center">
                  <span className="text-gray-700">
                    {dest.name} - Day {dest.day}
                  </span>
                  {dest.isStartingPoint && (
                    <span className="ml-2 text-sm text-blue-600">
                      (Starting Point)
                    </span>
                  )}
                  {showWeather && dest.weather.weather && (
                    <span className="ml-2 text-sm text-gray-600">
                      ({dest.weather.weather.main.temp}°C)
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showWeather}
                  onChange={(e) => setShowWeather(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Show Weather</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showTraffic}
                  onChange={(e) => setShowTraffic(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Show Traffic</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPointsOfInterest}
                  onChange={(e) => setShowPointsOfInterest(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Show Points of Interest</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;