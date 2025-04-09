// src/components/collaboration/ChatBox.jsx
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import Button from "../common/Button";
import Input from "../common/Input";
import logActivity from "../../services/logActivity"; // Import the utility

const ChatBox = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!tripId || !user) {
      setError("Please select a trip and log in to view the chat.");
      return;
    }

    const messagesRef = collection(db, `trips/${tripId}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(fetchedMessages);
        scrollToBottom();
      },
      (err) => {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again later.");
      }
    );

    return () => unsubscribe();
  }, [tripId, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!user) {
      setError("You must be logged in to send messages.");
      return;
    }
    if (!tripId) {
      setError("No trip selected. Please select a trip to chat.");
      return;
    }

    try {
      const messagesRef = collection(db, `trips/${tripId}/messages`);
      await addDoc(messagesRef, {
        message: newMessage.trim(),
        senderId: user.uid,
        senderEmail: user.email,
        timestamp: serverTimestamp(),
      });
      // Log the activity
      await logActivity(
        tripId,
        user.email,
        `sent a chat message: "${newMessage.trim()}"`
      );
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate();
    return (
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }) +
      " " +
      date.toLocaleDateString()
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Trip Chat {tripId ? `(Trip ID: ${tripId})` : ""}
      </h3>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <div className="flex-1 overflow-y-auto mb-4 p-2 border rounded-lg bg-gray-50">
        {messages.length === 0 && !error && (
          <p className="text-gray-500 text-center">
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
              msg.senderId === user?.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.senderId === user?.uid
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm font-semibold">
                {msg.senderId === user?.uid ? "You" : msg.senderEmail}
              </p>
              <p className="text-sm mt-1">{msg.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatTimestamp(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={!user || !tripId}
        />
        <Button
          type="submit"
          className="bg-blue-500 text-white hover:bg-blue-600"
          disabled={!user || !tripId || !newMessage.trim()}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatBox;
