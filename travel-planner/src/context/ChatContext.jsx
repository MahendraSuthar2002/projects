// src/context/ChatContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
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

    const messagesRef = collection(db, "chat");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messageList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messageList);
      },
      (err) => {
        setError("Failed to fetch chat messages: " + err.message);
        console.error("Chat fetch error:", err);
      }
    );

    return () => unsubscribe();
  }, [user, loading]);

  const sendMessage = async (text) => {
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
      const messagesRef = collection(db, "chat");
      await addDoc(messagesRef, {
        userEmail: user.email,
        text: text.trim(),
        timestamp: serverTimestamp(),
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
