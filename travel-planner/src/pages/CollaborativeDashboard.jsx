// src/pages/CollaborativeDashboard.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTrip } from "../context/TripContext";
import { useChat } from "../context/ChatContext";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

const CollaborativeDashboard = () => {
  const { user, logout } = useAuth();
  const { trips, addTrip, updateTrip, deleteTrip } = useTrip();
  const { messages, sendMessage } = useChat();
  const [newTripDestination, setNewTripDestination] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null); // For auto-scrolling chat
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAddTrip = () => {
    if (!newTripDestination) {
      setError("Please enter a destination.");
      return;
    }
    addTrip({
      destination: newTripDestination,
      dates: { start: "TBD", end: "TBD" },
      collaborators: [user.email],
      createdAt: new Date().toISOString(),
    });
    setNewTripDestination("");
    setError("");
  };

  const handleInviteCollaborator = async (tripId) => {
    if (!collaboratorEmail) {
      setError("Please enter a collaborator's email.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(collaboratorEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const trip = trips.find((t) => t.id === tripId);
      if (trip.collaborators.includes(collaboratorEmail)) {
        setError("This collaborator is already added.");
        return;
      }
      await updateTrip(tripId, {
        collaborators: [...trip.collaborators, collaboratorEmail],
      });
      setCollaboratorEmail("");
      setSelectedTripId(null);
      setError("");
    } catch (err) {
      setError("Failed to invite collaborator.");
      console.error("Invite collaborator error:", err);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage) {
      setError("Please enter a message.");
      return;
    }
    sendMessage(user.email, newMessage);
    setNewMessage("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Collaborative Dashboard</h1>
        <div className="flex gap-2 items-center">
          <span className="text-gray-600">Welcome, {user?.email}</span>
          <Button
            onClick={logout}
            className="bg-black text-white hover:bg-gray-800"
          >
            Log Out
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trip Overview */}
        <div className="col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Your Trips</h2>
          <div className="mb-4 flex gap-2">
            <Input
              value={newTripDestination}
              onChange={(e) => setNewTripDestination(e.target.value)}
              placeholder="Add new trip destination"
              className="w-full"
            />
            <Button
              onClick={handleAddTrip}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Add Trip
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {trips.length === 0 ? (
            <p className="text-gray-600">
              No trips yet. Add a trip to get started!
            </p>
          ) : (
            <ul className="space-y-4">
              {trips.map((trip) => (
                <li key={trip.id} className="border p-4 rounded-lg">
                  <h3 className="text-lg font-semibold">{trip.destination}</h3>
                  <p className="text-gray-600">
                    Dates: {trip.dates.start} - {trip.dates.end}
                  </p>
                  <p className="text-gray-600">
                    Collaborators: {trip.collaborators.join(", ")}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      onClick={() => navigate(`/builder?tripId=${trip.id}`)}
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      Edit Itinerary
                    </Button>
                    <Button
                      onClick={() => navigate(`/map?tripId=${trip.id}`)}
                      className="bg-gray-200 hover:bg-gray-300"
                    >
                      View Map
                    </Button>
                    <Button
                      onClick={() => deleteTrip(trip.id)}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={() => setSelectedTripId(trip.id)}
                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      Invite Collaborator
                    </Button>
                  </div>
                  {selectedTripId === trip.id && (
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={collaboratorEmail}
                        onChange={(e) => setCollaboratorEmail(e.target.value)}
                        placeholder="Enter collaborator's email"
                        className="w-full"
                      />
                      <Button
                        onClick={() => handleInviteCollaborator(trip.id)}
                        className="bg-blue-500 text-white hover:bg-blue-600"
                      >
                        Invite
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chat and Recent Activities */}
        <div className="space-y-4">
          {/* Recent Activities */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
            {trips.length === 0 ? (
              <p className="text-gray-600">No recent activities.</p>
            ) : (
              <ul className="space-y-2">
                {trips.map((trip) => (
                  <li key={trip.id} className="text-gray-600">
                    {trip.collaborators[0]} added a new trip to{" "}
                    <span className="font-semibold">{trip.destination}</span> on{" "}
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </li>
                ))}
                {messages.map((msg, index) => (
                  <li key={index} className="text-gray-600">
                    {msg.sender} sent a message on{" "}
                    {new Date(msg.timestamp).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Chat Section */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Chat with Collaborators</h2>
            <div className="h-40 overflow-y-auto mb-4 p-2 border rounded">
              {messages.length === 0 ? (
                <p className="text-gray-600">No messages yet.</p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="mb-2">
                    <span className="font-semibold">{msg.sender}: </span>
                    <span>{msg.text}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeDashboard;
