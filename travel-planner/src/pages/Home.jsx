// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { db } from "../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";

const Home = () => {
  const { signup, login, user, logout, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [travelers, setTravelers] = useState("");
  const navigate = useNavigate();

  // State for images
  const [destinationImages, setDestinationImages] = useState({});
  const [accommodationImages, setAccommodationImages] = useState({});
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(null);

  // Arrays for destinations and accommodations (without placeholder images)
  const destinations = [
    { title: "Spain" },
    { title: "Lisbon" },
    { title: "Croatia" },
    { title: "Bratislava" },
    { title: "Copenhagen" },
  ];

  const accommodations = [
    { title: "Harborview Hotel", rating: "9.6", price: "from $130/night" },
    { title: "Riverside Retreat", rating: "9.6", price: "from $180/night" },
    { title: "Seaside Sanctuary", rating: "9.8", price: "from $210/night" },
    { title: "Mountain Manor", rating: "9.5", price: "from $130/night" },
    { title: "Coastal Cove", rating: "9.5", price: "from $70/night" },
  ];

  // Fetch images for destinations and accommodations
  useEffect(() => {
    const fetchImages = async () => {
      setImageLoading(true);
      setImageError(null);

      // Fetch images for destinations
      const destImages = {};
      for (const dest of destinations) {
        const imageDocRef = doc(db, "homeImages", `dest_${dest.title}`);
        const imageDoc = await getDoc(imageDocRef);

        if (imageDoc.exists()) {
          destImages[dest.title] = imageDoc.data().url;
        } else {
          try {
            const response = await axios.get(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                dest.title
              )}&per_page=1&client_id=${import.meta.env.VITE_UNSPLASH_API_KEY}`
            );
            const imageUrl = response.data.results[0]?.urls?.regular
              ? `${response.data.results[0].urls.regular}&w=300&h=200`
              : "https://via.placeholder.com/300x200?text=" + dest.title;
            destImages[dest.title] = imageUrl;
            await setDoc(imageDocRef, { url: imageUrl });
          } catch (error) {
            console.error(`Error fetching image for ${dest.title}:`, error);
            destImages[dest.title] =
              "https://via.placeholder.com/300x200?text=" + dest.title;
            setImageError("Failed to load some destination images.");
          }
        }
      }
      setDestinationImages(destImages);

      // Fetch images for accommodations
      const accImages = {};
      for (const acc of accommodations) {
        const imageDocRef = doc(db, "homeImages", `acc_${acc.title}`);
        const imageDoc = await getDoc(imageDocRef);

        if (imageDoc.exists()) {
          accImages[acc.title] = imageDoc.data().url;
        } else {
          try {
            // Use a generic search term for accommodations (e.g., "hotel", "resort")
            const searchTerm = acc.title.toLowerCase().includes("hotel")
              ? "hotel"
              : acc.title.toLowerCase().includes("retreat")
              ? "resort"
              : "vacation home";
            const response = await axios.get(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                searchTerm
              )}&per_page=1&client_id=${import.meta.env.VITE_UNSPLASH_API_KEY}`
            );
            const imageUrl = response.data.results[0]?.urls?.regular
              ? `${response.data.results[0].urls.regular}&w=300&h=200`
              : "https://via.placeholder.com/300x200?text=" + acc.title;
            accImages[acc.title] = imageUrl;
            await setDoc(imageDocRef, { url: imageUrl });
          } catch (error) {
            console.error(`Error fetching image for ${acc.title}:`, error);
            accImages[acc.title] =
              "https://via.placeholder.com/300x200?text=" + acc.title;
            setImageError("Failed to load some accommodation images.");
          }
        }
      }
      setAccommodationImages(accImages);

      setImageLoading(false);
    };

    fetchImages();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Auth error:", err.code, err.message);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError(
            "This email is already in use. Please use a different email."
          );
          break;
        case "auth/invalid-email":
          setError("Invalid email address. Please check your email.");
          break;
        case "auth/weak-password":
          setError(
            "Password is too weak. Please use a stronger password (at least 6 characters)."
          );
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Invalid email or password. Please try again.");
          break;
        case "auth/operation-not-allowed":
          setError(
            "Email/Password authentication is not enabled. Please contact support."
          );
          break;
        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection and try again."
          );
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        case "auth/invalid-credential":
          setError(
            "Invalid credentials. Please check your email and password."
          );
          break;
        case "auth/invalid-api-key":
        case "auth/app-not-authorized":
          setError(
            "Authentication configuration error. Please contact support."
          );
          break;
        default:
          setError(`Authentication failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email to reset your password.");
      setResetMessage("");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      setResetMessage("");
      return;
    }

    try {
      const message = await resetPassword(email);
      setResetMessage(message);
      setError("");
    } catch (err) {
      setError(err.message);
      setResetMessage("");
    }
  };

  const handleSearch = () => {
    if (!destination) {
      alert("Please enter a destination to search.");
      return;
    }
    const query = new URLSearchParams({
      destination,
      checkIn,
      checkOut,
      travelers,
    }).toString();
    navigate(`/filter?${query}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white shadow">
        <h1 className="text-2xl font-bold">Travel Planner</h1>
        <nav className="flex gap-4">
          <Link to="/filter" className="text-gray-600 hover:underline">
            Find your dream
          </Link>
          <Link to="/map" className="text-gray-600 hover:underline">
            Discover local
          </Link>
          <Link to="/itinerary" className="text-gray-600 hover:underline">
            Explore top
          </Link>
        </nav>
        <div className="flex gap-2">
          {user ? (
            <>
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-gray-200 hover:bg-gray-300"
              >
                Dashboard
              </Button>
              <Button
                onClick={logout}
                className="bg-black text-white hover:bg-gray-800"
              >
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsSignup(false)}
                className="bg-gray-200 hover:bg-gray-300"
              >
                Log In
              </Button>
              <Button
                onClick={() => setIsSignup(true)}
                className="bg-black text-white hover:bg-gray-800"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-800 text-white p-8 text-center">
        <h2 className="text-4xl font-bold mb-2">
          Start your journey with Travel Planner
        </h2>
        <p className="text-lg mb-6">
          1,480,086 accommodations worldwide await you!
        </p>
        <div className="bg-white text-black p-4 rounded-lg flex gap-4 justify-center items-center flex-wrap">
          <Input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination"
            className="w-full sm:w-1/4"
          />
          <Input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            placeholder="Check-in date"
            className="w-full sm:w-1/4"
          />
          <Input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            placeholder="Check-out date"
            className="w-full sm:w-1/4"
          />
          <Input
            type="number"
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
            placeholder="Travelers"
            className="w-full sm:w-1/4"
            min="1"
          />
          <Button
            onClick={handleSearch}
            className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
          >
            Search
          </Button>
        </div>
      </section>

      {/* Image Error Message */}
      {imageError && (
        <div className="p-4 text-center text-red-500">{imageError}</div>
      )}

      {/* Popular Destinations */}
      <section className="p-8">
        <h2 className="text-2xl font-bold mb-4">
          Explore popular destinations
        </h2>
        {imageLoading ? (
          <p className="text-center text-gray-600">Loading images...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {destinations.map((dest) => (
              <Card
                key={dest.title}
                title={dest.title}
                image={destinationImages[dest.title]}
                onClick={() => navigate(`/filter?destination=${dest.title}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Top Rated Accommodations */}
      <section className="p-8">
        <h2 className="text-2xl font-bold mb-4">Top rated accommodations</h2>
        {imageLoading ? (
          <p className="text-center text-gray-600">Loading images...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {accommodations.map((acc) => (
              <Card
                key={acc.title}
                title={acc.title}
                rating={acc.rating}
                price={acc.price}
                image={accommodationImages[acc.title]}
                onClick={() => alert(`Book ${acc.title}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Deals Section */}
      <section className="p-8 bg-gray-200 text-center">
        <h2 className="text-2xl font-bold mb-4">Exclusive deals await you!</h2>
        <p className="mb-4">
          Unlock offers and exclusive prices for your next getaway. Join the
          Travel Club now!
        </p>
        <Button className="bg-black text-white hover:bg-gray-800">
          Join now
        </Button>
      </section>

      {/* Footer */}
      <footer className="p-8 flex flex-col sm:flex-row justify-between bg-white">
        <div className="mb-4 sm:mb-0">
          <h3 className="text-lg font-bold">Travel Planner</h3>
          <p>Enhancing travel experiences since 1997</p>
          <p>Lizard © 2022</p>
        </div>
        <div>
          <h3 className="text-lg font-bold">Support</h3>
          <ul>
            <li>
              <a href="#" className="text-gray-600 hover:underline">
                Help center
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:underline">
                Customer support
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:underline">
                How it works
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:underline">
                Get in touch
              </a>
            </li>
          </ul>
        </div>
      </footer>

      {/* Auth Modal (if not logged in) */}
      {!user && (isSignup || !isSignup) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              {isSignup ? "Sign Up" : "Log In"}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full"
                required
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full"
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {resetMessage && (
                <p className="text-green-500 text-sm">{resetMessage}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? "Processing..." : isSignup ? "Sign Up" : "Log In"}
              </Button>
            </form>
            {!isSignup && (
              <button
                onClick={handlePasswordReset}
                className="mt-2 w-full text-blue-500 hover:underline text-sm"
                disabled={loading}
              >
                Forgot Password?
              </button>
            )}
            <Button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
                setResetMessage("");
              }}
              className="mt-2 w-full bg-gray-200 hover:bg-gray-300"
              disabled={loading}
            >
              {isSignup ? "Switch to Log In" : "Switch to Sign Up"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
