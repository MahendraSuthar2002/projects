// src/pages/MapView.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { useTrip } from "../context/TripContext";
import useDestinationsWeather from "../hooks/useDestinationsWeather";
import usePointsOfInterest from "../hooks/usePointsOfInterest";
import ChatBox from "../components/collaboration/ChatBox";
import RecentActivities from "../components/collaboration/RecentActivities";
import UserAvatars from "../components/collaboration/UserAvatars";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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
  const location = useLocation();
  const { filteredDestinations, filters } = location.state || {};
  const { currentTrip } = useTrip();
  const [destinations, setDestinations] = useState([]);
  const [mapCenter, setMapCenter] = useState([35.6762, 139.6503]); // Default to Tokyo
  const [showWeather, setShowWeather] = useState(false);
  const [showPois, setShowPois] = useState(false);

  const {
    weatherData = {},
    loading: weatherLoading,
    error: weatherError,
  } = useDestinationsWeather(destinations, showWeather);

  const {
    pois = [],
    loading: poiLoading,
    error: poiError,
  } = usePointsOfInterest(destinations, showPois);

  // Initialize destinations and map center
  useEffect(() => {
    if (filteredDestinations && filteredDestinations.length > 0) {
      setDestinations(filteredDestinations);
      setMapCenter([
        filteredDestinations[0].position[0],
        filteredDestinations[0].position[1],
      ]);
    } else if (
      currentTrip?.destinations &&
      currentTrip.destinations.length > 0
    ) {
      setDestinations(currentTrip.destinations);
      setMapCenter([
        currentTrip.destinations[0].position[0],
        currentTrip.destinations[0].position[1],
      ]);
    } else {
      // Set default destinations if no filtered or trip destinations
      setDestinations([
        {
          name: "Tokyo",
          country: "Japan",
          type: "City",
          position: [35.6762, 139.6503],
          distance: 0,
          description: "Capital city of Japan",
          wikipedia: "https://en.wikipedia.org/wiki/Tokyo",
        },
        {
          name: "Mount Fuji",
          country: "Japan",
          type: "Mountain",
          position: [35.3606, 138.7278],
          distance: 100,
          description: "Japan's highest mountain",
          wikipedia: "https://en.wikipedia.org/wiki/Mount_Fuji",
        },
        {
          name: "Kamakura Beach",
          country: "Japan",
          type: "Beach",
          position: [35.3125, 139.55],
          distance: 50,
          description: "Popular beach near Tokyo",
          wikipedia: "https://en.wikipedia.org/wiki/Kamakura",
        },
      ]);
    }
  }, [filteredDestinations, currentTrip]);

  const isLoading = weatherLoading || poiLoading;
  const hasError = weatherError || poiError;

  if (!destinations || destinations.length === 0) {
    return <div>No destinations to display</div>;
  }

  return (
    <div className="h-screen w-full relative">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setShowWeather(!showWeather)}
          className={`px-4 py-2 rounded-lg ${
            showWeather ? "bg-blue-500 text-white" : "bg-white text-blue-500"
          } ${weatherLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={weatherLoading}
        >
          {weatherLoading ? "Loading Weather..." : "Toggle Weather"}
        </button>
        <button
          onClick={() => setShowPois(!showPois)}
          className={`px-4 py-2 rounded-lg ${
            showPois ? "bg-green-500 text-white" : "bg-white text-green-500"
          } ${poiLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={poiLoading}
        >
          {poiLoading ? "Loading POIs..." : "Toggle POIs"}
        </button>
      </div>

      {/* Filter Info */}
      {filters && (
        <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
          <h3 className="font-bold mb-2">Current Filters:</h3>
          <p>Country: {filters.country || "Any"}</p>
          <p>Type: {filters.type || "Any"}</p>
          <p>Distance: {filters.distance || "Any"} km</p>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute top-20 right-4 z-[1000] bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          Loading data...
        </div>
      )}

      {/* Error Messages */}
      {hasError && (
        <div className="absolute top-20 right-4 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {weatherError && <p>Weather Error: {weatherError}</p>}
          {poiError && <p>POI Error: {poiError}</p>}
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Destination Markers */}
        {destinations.map((destination) => (
          <Marker
            key={`${destination.name}-${destination.type}`}
            position={[destination.position[0], destination.position[1]]}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg">{destination.name}</h3>
                <p className="text-gray-600">{destination.country}</p>
                <p className="text-gray-600">Type: {destination.type}</p>
                {destination.description && (
                  <p className="mt-2 text-sm">{destination.description}</p>
                )}
                {destination.wikipedia && (
                  <a
                    href={destination.wikipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Learn more on Wikipedia
                  </a>
                )}
                {showWeather && weatherData[destination.name] && (
                  <div className="mt-2 pt-2 border-t">
                    <h4 className="font-semibold">Weather</h4>
                    <p>Temperature: {weatherData[destination.name].temp}°C</p>
                    <p>
                      Condition: {weatherData[destination.name].description}
                    </p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* POI Markers */}
        {showPois &&
          pois.map((poi, index) => (
            <Marker
              key={`${poi.name}-${index}`}
              position={[poi.position[0], poi.position[1]]}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-lg">{poi.name}</h3>
                  <p className="text-gray-600">
                    Near: {poi.relatedDestination}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
