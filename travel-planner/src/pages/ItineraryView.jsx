// src/pages/ItineraryView.jsx
import { useTrip } from "../context/TripContext";
import TripStats from "../components/itinerary/TripStats";
import InteractiveMap from "../components/map/InteractiveMap";
import Button from "../components/common/Button";

const ItineraryView = () => {
  const { trips } = useTrip();
  const trip = trips[0] || {
    name: "Japan Adventure 2024",
    itinerary: [
      {
        day: 1,
        date: "Mar 13",
        location: "Tokyo",
        position: [35.6762, 139.6503],
        activities: [
          "Arrive at Narita Airport, Check-in at Hotel, Evening in Shibuya",
        ],
      },
      {
        day: 2,
        date: "Mar 13-17",
        location: "Kyoto",
        position: [35.0116, 135.7681],
        activities: ["Temple visits, Traditional tea ceremony, Bamboo Forest"],
      },
      {
        day: 3,
        date: "Mar 18-19",
        location: "Osaka",
        position: [34.6937, 135.5023],
        activities: ["Street food tour, Osaka Castle, Shopping at Dotonbori"],
      },
    ],
  };

  const destinations = trip.itinerary.map((day) => ({
    name: day.location,
    position: day.position,
  }));

  const stats = {
    days: "5 Days",
    places: "3 Places",
    distance: "450 km",
    activities: "8 Total",
  };

  const notes = [
    "Exchange currency at the airport",
    "Purchase JR Pass before departure",
    "Book temple visits in advance",
    "Check weather forecast before packing",
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{trip.name}</h1>
        <div className="flex gap-2">
          <Button className="bg-black text-white">Download PDF</Button>
          <Button className="border border-black">Share Trip</Button>
        </div>
      </div>

      <TripStats
        days={stats.days}
        places={stats.places}
        distance={stats.distance}
        activities={stats.activities}
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">Trip Timeline</h2>
          {trip.itinerary.map((day) => (
            <div key={day.day} className="mb-4 p-4 border rounded">
              <h3 className="text-lg font-semibold">
                Day {day.day} - {day.location}
              </h3>
              <p className="text-gray-600">{day.date}</p>
              <ul className="mt-2">
                {day.activities.map((activity, index) => (
                  <li key={index} className="text-gray-800">
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <h2 className="text-xl font-bold mb-2">Trip Notes</h2>
          <ul className="list-disc pl-5">
            {notes.map((note, index) => (
              <li key={index} className="text-gray-800">
                {note}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-1/3">
          <InteractiveMap
            destinations={destinations}
            center={[35.6762, 139.6503]}
            zoom={5}
            height="300px"
          />
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <Button className="border border-black">Back to Editor</Button>
        <Button className="border border-black">View All Trips</Button>
      </div>
    </div>
  );
};

export default ItineraryView;
