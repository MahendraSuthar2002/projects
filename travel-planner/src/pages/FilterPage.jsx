// src/pages/FilterPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FilterPage = () => {
  const [country, setCountry] = useState("");
  const [destinationType, setDestinationType] = useState("");
  const [distance, setDistance] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    // In a real app, this would filter destinations and redirect to a results page
    alert(`Filtering for: ${country}, ${destinationType}, within ${distance}`);
    navigate("/map"); // Redirect to map view after filtering
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Destination Filter</h1>
      <div className="mb-4">
        <label className="block mb-1">Country</label>
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="e.g., Spain"
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Destination Type</label>
        <select
          value={destinationType}
          onChange={(e) => setDestinationType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select type</option>
          <option value="Beach">Beach</option>
          <option value="City">City</option>
          <option value="Mountain">Mountain</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Distance</label>
        <input
          type="text"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="e.g., Within 50km"
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            setCountry("");
            setDestinationType("");
            setDistance("");
          }}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Clear All
        </button>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default FilterPage;
