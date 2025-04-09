// src/routes.jsx
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import MapView from "./pages/MapView";
import ItineraryView from "./pages/ItineraryView";
import ItineraryBuilder from "./pages/ItineraryBuilder";
import CollaborativeDashboard from "./pages/CollaborativeDashboard";
import FilterPage from "./pages/FilterPage";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/map", element: <MapView /> },
  { path: "/itinerary", element: <ItineraryView /> },
  { path: "/builder", element: <ItineraryBuilder /> },
  { path: "/dashboard", element: <CollaborativeDashboard /> },
  { path: "/filter", element: <FilterPage /> },
]);

export default router;
