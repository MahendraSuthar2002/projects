// src/components/map/InteractiveMap.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const InteractiveMap = ({ destinations, center, zoom, height }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: height || "300px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {destinations.map((dest) => (
        <Marker key={dest.name} position={dest.position}>
          <Popup>{dest.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default InteractiveMap;
