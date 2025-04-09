// src/components/collaboration/UserAvatars.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import { doc, onSnapshot } from "firebase/firestore";

// Utility function to generate a color based on the email
const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
};

// Utility function to get initials from an email
const getInitials = (email) => {
  if (!email) return "??";
  const namePart = email.split("@")[0];
  const parts = namePart.split(/[._]/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return namePart.slice(0, 2).toUpperCase();
};

const UserAvatars = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [error, setError] = useState(null);

  // Fetch collaborators in real-time
  useEffect(() => {
    if (!tripId || !user) {
      setError("Please select a trip and log in to view collaborators.");
      return;
    }

    const tripRef = doc(db, `trips/${tripId}`);

    const unsubscribe = onSnapshot(
      tripRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const collaboratorsList = data.collaborators || [];
          setCollaborators(collaboratorsList);
        } else {
          setError("Trip not found.");
        }
      },
      (err) => {
        console.error("Error fetching collaborators:", err);
        setError("Failed to load collaborators. Please try again later.");
      }
    );

    return () => unsubscribe();
  }, [tripId, user]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Collaborators {tripId ? `(Trip ID: ${tripId})` : ""}
      </h3>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Avatars List */}
      <div className="flex items-center">
        {collaborators.length === 0 && !error ? (
          <p className="text-gray-500">No collaborators yet.</p>
        ) : (
          <div className="flex -space-x-4">
            {collaborators.map((email, index) => (
              <div
                key={email}
                className="relative group"
                style={{ zIndex: collaborators.length - index }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-white"
                  style={{ backgroundColor: stringToColor(email) }}
                  title={email} // Tooltip on hover
                >
                  {getInitials(email)}
                </div>
              </div>
            ))}
          </div>
        )}
        {collaborators.length > 0 && (
          <span className="ml-4 text-gray-600 text-sm">
            {collaborators.length} collaborator
            {collaborators.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </div>
  );
};

export default UserAvatars;
