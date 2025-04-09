// src/context/TripContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setTrips([]);
      return;
    }

    // Query trips where the user's email is in the collaborators array
    const tripsQuery = query(
      collection(db, "trips"),
      where("collaborators", "array-contains", user.email)
    );

    const unsubscribe = onSnapshot(
      tripsQuery,
      (snapshot) => {
        const userTrips = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrips(userTrips);
      },
      (err) => {
        setError("Failed to fetch trips.");
        console.error("Trip fetch error:", err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTrip = async (trip) => {
    if (!user) {
      setError("You must be logged in to add a trip.");
      return;
    }
    try {
      setError(null);
      await addDoc(collection(db, "trips"), {
        ...trip,
        collaborators: [user.email],
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setError("Failed to add trip.");
      console.error("Add trip error:", err);
    }
  };

  const updateTrip = async (tripId, updatedTrip) => {
    if (!user) {
      setError("You must be logged in to update a trip.");
      return;
    }
    try {
      setError(null);
      const tripRef = doc(db, "trips", tripId);
      await updateDoc(tripRef, updatedTrip);
    } catch (err) {
      setError("Failed to update trip.");
      console.error("Update trip error:", err);
    }
  };

  const deleteTrip = async (tripId) => {
    if (!user) {
      setError("You must be logged in to delete a trip.");
      return;
    }
    try {
      setError(null);
      const tripRef = doc(db, "trips", tripId);
      await deleteDoc(tripRef);
    } catch (err) {
      setError("Failed to delete trip.");
      console.error("Delete trip error:", err);
    }
  };

  return (
    <TripContext.Provider
      value={{ trips, addTrip, updateTrip, deleteTrip, error }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
