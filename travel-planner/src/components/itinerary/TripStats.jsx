// src/components/itinerary/TripStats.jsx
const TripStats = ({ days, places, distance, activities }) => {
  return (
    <div className="flex gap-4 mb-4">
      <div className="bg-gray-100 p-2 rounded">
        <p className="font-bold">{days}</p>
        <p className="text-sm text-gray-600">Days</p>
      </div>
      <div className="bg-gray-100 p-2 rounded">
        <p className="font-bold">{places}</p>
        <p className="text-sm text-gray-600">Places</p>
      </div>
      <div className="bg-gray-100 p-2 rounded">
        <p className="font-bold">{distance}</p>
        <p className="text-sm text-gray-600">Distance</p>
      </div>
      <div className="bg-gray-100 p-2 rounded">
        <p className="font-bold">{activities}</p>
        <p className="text-sm text-gray-600">Activities</p>
      </div>
    </div>
  );
};

export default TripStats;
