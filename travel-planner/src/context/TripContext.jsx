// src/context/TripContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [showWeather, setShowWeather] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showPointsOfInterest, setShowPointsOfInterest] = useState(false);

  // Fetch trips from Firestore
  useEffect(() => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    const tripsQuery = query(
      collection(db, "trips"),
      where("collaborators", "array-contains", user.email)
    );

    const unsubscribe = onSnapshot(
      tripsQuery,
      (snapshot) => {
        const tripsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort trips by createdAt in memory
        tripsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        });
        setTrips(tripsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching trips:", error);
        setError("Failed to load trips. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Create a new trip
  const createTrip = async (tripData) => {
    try {
      setLoading(true);
      setError(null);

      const tripWithUser = {
        ...tripData,
        collaborators: [user.email],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "trips"), tripWithUser);
      return { id: docRef.id, ...tripWithUser };
    } catch (error) {
      console.error("Error creating trip:", error);
      setError("Failed to create trip. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing trip
  const updateTrip = async (tripId, tripData) => {
    try {
      setLoading(true);
      setError(null);

      const tripRef = doc(db, "trips", tripId);
      await updateDoc(tripRef, {
        ...tripData,
        updatedAt: new Date(),
      });

      return { id: tripId, ...tripData };
    } catch (error) {
      console.error("Error updating trip:", error);
      setError("Failed to update trip. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a trip
  const deleteTrip = async (tripId) => {
    try {
      setLoading(true);
      setError(null);

      await deleteDoc(doc(db, "trips", tripId));
    } catch (error) {
      console.error("Error deleting trip:", error);
      setError("Failed to delete trip. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get a single trip by ID
  const getTripById = async (tripId) => {
    try {
      setLoading(true);
      setError(null);

      const tripDoc = await getDocs(doc(db, "trips", tripId));
      if (!tripDoc.exists()) {
        throw new Error("Trip not found");
      }

      return { id: tripDoc.id, ...tripDoc.data() };
    } catch (error) {
      console.error("Error fetching trip:", error);
      setError("Failed to load trip. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update filtered destinations
  const updateFilteredDestinations = (newDestinations) => {
    setFilteredDestinations(newDestinations);
  };

  // Clear filtered destinations
  const clearFilteredDestinations = () => {
    setFilteredDestinations([]);
  };

  const value = {
    trips,
    loading,
    error,
    createTrip,
    updateTrip,
    deleteTrip,
    getTripById,
    filteredDestinations,
    updateFilteredDestinations,
    clearFilteredDestinations,
    showWeather,
    setShowWeather,
    showTraffic,
    setShowTraffic,
    showPointsOfInterest,
    setShowPointsOfInterest,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
};
