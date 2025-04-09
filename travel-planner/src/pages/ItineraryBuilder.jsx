// src/pages/ItineraryBuilder.jsx
import { useState } from "react";
import { useTrip } from "../context/TripContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useWeather from "../hooks/useWeather";

const ItineraryBuilder = () => {
  const { addTrip } = useTrip();
  const [tripName, setTripName] = useState("Japan Trip");
  const [itinerary, setItinerary] = useState([
    {
      day: 1,
      location: "Tokyo",
      coordinates: [35.6762, 139.6503], // Tokyo coordinates
      activities: [
        { id: "1", name: "Sensoji Temple", icon: "📍" },
        { id: "2", name: "Lunch at Tsuta Japanese Soba Noodles", icon: "🍴" },
        { id: "3", name: "Shopping at Shibuya", icon: "🛍️" },
      ],
    },
    {
      day: 2,
      location: "Mount Fuji",
      coordinates: [35.3606, 138.7274], // Mount Fuji coordinates
      activities: [
        { id: "4", name: "Mount Fuji Climb", icon: "⛰️" },
        { id: "5", name: "Photo Session at Chureito Pagoda", icon: "📸" },
      ],
    },
  ]);

  const [showWeather, setShowWeather] = useState(false);

  // Fetch weather for each day
  const itineraryWithWeather = itinerary.map((day) => ({
    ...day,
    weather: useWeather(day.coordinates[0], day.coordinates[1], showWeather),
  }));

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceDayIndex = parseInt(source.droppableId.split("-")[1]);
    const destDayIndex = parseInt(destination.droppableId.split("-")[1]);

    const newItinerary = [...itinerary];

    const sourceDay = newItinerary[sourceDayIndex];
    const destDay = newItinerary[destDayIndex];

    const [movedActivity] = sourceDay.activities.splice(source.index, 1);

    if (sourceDayIndex === destDayIndex) {
      sourceDay.activities.splice(destination.index, 0, movedActivity);
    } else {
      destDay.activities.splice(destination.index, 0, movedActivity);
    }

    setItinerary(newItinerary);
  };

  const handleSaveTrip = async () => {
    const trip = {
      name: tripName,
      itinerary,
      createdAt: new Date().toISOString(),
    };
    await addTrip(trip);
    alert("Trip saved successfully!");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{tripName}</h1>
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showWeather}
            onChange={(e) => setShowWeather(e.target.checked)}
          />
          Show Weather
        </label>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        {itineraryWithWeather.map((day, dayIndex) => (
          <Droppable droppableId={`day-${dayIndex}`} key={dayIndex}>
            {(provided) => (
              <div
                className="mb-4 p-4 border rounded"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h2 className="text-xl font-semibold">
                  Day {day.day} - {day.location}
                  {showWeather && day.weather.loading && (
                    <span className="ml-2 text-sm text-gray-500">
                      (Loading weather...)
                    </span>
                  )}
                  {showWeather && day.weather.error && (
                    <span className="ml-2 text-sm text-red-500">
                      ({day.weather.error})
                    </span>
                  )}
                  {showWeather && day.weather.weather && (
                    <span className="ml-2 text-sm text-gray-600">
                      ({day.weather.weather.main.temp}°C,{" "}
                      {day.weather.weather.weather[0].description})
                    </span>
                  )}
                </h2>
                <ul>
                  {day.activities.map((activity, index) => (
                    <Draggable
                      key={activity.id}
                      draggableId={activity.id}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center gap-2 p-2 my-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <span>{activity.icon}</span>
                          <span>{activity.name}</span>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
      <button
        onClick={handleSaveTrip}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Save Trip
      </button>
    </div>
  );
};

export default ItineraryBuilder;
