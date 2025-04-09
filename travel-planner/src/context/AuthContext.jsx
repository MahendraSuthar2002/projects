// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { authErrorMessages } from "../constants/errorMessages";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState({
    login: false,
    signup: false,
    logout: false,
    resetPassword: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        setError("Failed to fetch user state.");
        console.error("Auth state error:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setAuthLoading((prev) => ({ ...prev, login: true }));
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw err;
    } finally {
      setAuthLoading((prev) => ({ ...prev, login: false }));
    }
  };

  const signup = async (email, password) => {
    try {
      setError(null);
      setAuthLoading((prev) => ({ ...prev, signup: true }));
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw err;
    } finally {
      setAuthLoading((prev) => ({ ...prev, signup: false }));
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setAuthLoading((prev) => ({ ...prev, logout: true }));
      await signOut(auth);
      setUser(null);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw err;
    } finally {
      setAuthLoading((prev) => ({ ...prev, logout: false }));
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      setAuthLoading((prev) => ({ ...prev, resetPassword: true }));
      await sendPasswordResetEmail(auth, email);
      return "Password reset email sent successfully";
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw err;
    } finally {
      setAuthLoading((prev) => ({ ...prev, resetPassword: false }));
    }
  };

  const getAuthErrorMessage = (errorCode) => {
    return authErrorMessages[errorCode] || authErrorMessages.default;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        resetPassword,
        loading,
        authLoading,
        error,
        clearError: () => setError(null),
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
