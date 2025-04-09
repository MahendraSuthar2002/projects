// src/components/collaboration/RecentActivities.jsx
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const RecentActivities = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const activitiesEndRef = useRef(null);

  // Scroll to the bottom of the activities list when new activities are added
  const scrollToBottom = () => {
    activitiesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch activities in real-time
  useEffect(() => {
    if (!tripId || !user) {
      setError("Please select a trip and log in to view recent activities.");
      return;
    }

    const activitiesRef = collection(db, `trips/${tripId}/activities`);
    const q = query(activitiesRef, orderBy("timestamp", "desc")); // Most recent first

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedActivities = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActivities(fetchedActivities);
        scrollToBottom();
      },
      (err) => {
        console.error("Error fetching activities:", err);
        setError("Failed to load recent activities. Please try again later.");
      }
    );

    return () => unsubscribe();
  }, [tripId, user]);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }
    return date.toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full h-80 flex flex-col">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Activities {tripId ? `(Trip ID: ${tripId})` : ""}
      </h3>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Activities List */}
      <div className="flex-1 overflow-y-auto p-2 border rounded-lg bg-gray-50">
        {activities.length === 0 && !error && (
          <p className="text-gray-500 text-center">No recent activities yet.</p>
        )}
        {activities.map((activity) => (
          <div key={activity.id} className="mb-3 flex items-start gap-2">
            <div className="flex-1">
              <p className="text-sm text-gray-800">
                <span className="font-semibold">{activity.userEmail}</span>{" "}
                {activity.action}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={activitiesEndRef} />
      </div>
    </div>
  );
};

export default RecentActivities;
