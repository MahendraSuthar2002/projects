// src/constants/errorMessages.js

export const authErrorMessages = {
  "auth/email-already-in-use":
    "This email is already in use. Please use a different email.",
  "auth/invalid-email": "Invalid email address. Please check your email.",
  "auth/weak-password":
    "Password is too weak. Please use a stronger password (at least 6 characters).",
  "auth/user-not-found":
    "No account found with this email. Please sign up first.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/operation-not-allowed":
    "Email/Password authentication is not enabled. Please contact support.",
  "auth/network-request-failed":
    "Network error. Please check your internet connection and try again.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/invalid-credential":
    "Invalid credentials. Please check your email and password.",
  "auth/invalid-api-key":
    "Authentication configuration error. Please contact support.",
  "auth/app-not-authorized":
    "Authentication configuration error. Please contact support.",
  "auth/user-disabled":
    "This account has been disabled. Please contact support.",
  "auth/requires-recent-login":
    "This operation requires recent authentication. Please log in again.",
  default: "An unexpected error occurred. Please try again later.",
};

export const tripErrorMessages = {
  "permission-denied": "You don't have permission to perform this action.",
  "not-found": "The requested trip could not be found.",
  "already-exists": "A trip with this ID already exists.",
  "failed-precondition":
    "The operation was rejected because the system is not in a required state.",
  aborted: "The operation was aborted.",
  unavailable: "The service is currently unavailable. Please try again later.",
  "data-loss": "Unrecoverable data loss or corruption.",
  unauthenticated: "You must be logged in to perform this action.",
  default: "An unexpected error occurred. Please try again later.",
};
