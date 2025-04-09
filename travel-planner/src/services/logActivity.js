// src/services/logActivity.js
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const logActivity = async (tripId, userEmail, action) => {
  if (!tripId || !userEmail || !action) {
    console.error("Missing required parameters to log activity:", {
      tripId,
      userEmail,
      action,
    });
    return;
  }

  try {
    const activitiesRef = collection(db, `trips/${tripId}/activities`);
    await addDoc(activitiesRef, {
      action,
      userEmail,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error logging activity:", err);
  }
};

export default logActivity;
