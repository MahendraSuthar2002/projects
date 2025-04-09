// src/pages/FilterPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { filterDestinations } from "../services/destinations";
import { useTrip } from "../context/TripContext";

const FilterPage = () => {
  const navigate = useNavigate();
  const { updateFilteredDestinations } = useTrip();
  const [filters, setFilters] = useState({
    country: "",
    type: "",
    distance: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearchAttempted(true);

    try {
      // Convert distance to number if provided
      const searchFilters = {
        ...filters,
        distance: filters.distance ? Number(filters.distance) : undefined,
      };

      const results = await filterDestinations(searchFilters);

      if (results.length === 0) {
        setError("No destinations found matching your criteria");
        return;
      }

      updateFilteredDestinations(results);
      navigate("/map", {
        state: {
          filteredDestinations: results,
          filters: searchFilters,
        },
      });
    } catch (error) {
      console.error("Search error:", error);
      setError(
        error.message || "Failed to search destinations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Filter Destinations
        </h2>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={filters.country}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter country name"
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Destination Type
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="City">City</option>
              <option value="Beach">Beach</option>
              <option value="Mountain">Mountain</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="distance"
              className="block text-sm font-medium text-gray-700"
            >
              Maximum Distance (km)
            </label>
            <input
              type="number"
              id="distance"
              name="distance"
              value={filters.distance}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter maximum distance"
              min="0"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {searchAttempted && !loading && !error && (
          <div className="mt-4 text-sm text-gray-600">
            No results found. Try adjusting your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPage;
