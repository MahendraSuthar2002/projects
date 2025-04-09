// src/context/ChatContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { realtimeDb } from "../services/firebase";
import { ref, push, onValue } from "firebase/database";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait until the authentication state is loaded and the user is authenticated
    if (loading || !user) {
      setMessages([]);
      return;
    }

    const messagesRef = ref(realtimeDb, "chat");
    const unsubscribe = onValue(
      messagesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageList = Object.values(data)
            .map((msg) => ({
              sender: msg.userEmail,
              text: msg.text,
              timestamp: msg.timestamp,
            }))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          setMessages(messageList);
        } else {
          setMessages([]);
        }
      },
      (err) => {
        setError("Failed to fetch chat messages: " + err.message);
        console.error("Chat fetch error:", err);
      }
    );

    return () => unsubscribe();
  }, [user, loading]);

  const sendMessage = async (sender, text) => {
    if (!user) {
      setError("You must be logged in to send messages.");
      return;
    }
    if (!text.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    try {
      setError(null);
      const messagesRef = ref(realtimeDb, "chat");
      await push(messagesRef, {
        userEmail: sender,
        text: text.trim(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError("Failed to send message: " + err.message);
      console.error("Send message error:", err);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, error }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
