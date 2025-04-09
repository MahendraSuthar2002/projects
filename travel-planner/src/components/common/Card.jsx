// src/components/common/Card.jsx
import { useState } from "react";

// Fallback image for when the provided image fails to load or is missing
const FALLBACK_IMAGE = "https://via.placeholder.com/300x200?text=No+Image";

const Card = ({ image, title, subtitle, rating, price, onClick }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasImageError, setHasImageError] = useState(false);

  // Handle image load success
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  // Handle image load error
  const handleImageError = () => {
    setIsImageLoading(false);
    setHasImageError(true);
  };

  return (
    <div
      onClick={onClick}
      className="border rounded-lg overflow-hidden shadow-lg cursor-pointer transition-transform transform hover:scale-105 hover:shadow-xl bg-white"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
      aria-label={`View details for ${title}`}
    >
      {/* Image Section with Loading Placeholder */}
      <div className="relative w-full h-40">
        {isImageLoading && !hasImageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={hasImageError || !image ? FALLBACK_IMAGE : image}
          alt={title || "Card image"}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isImageLoading && !hasImageError ? "opacity-0" : "opacity-100"
          }`}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {rating && (
          <span className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-800 shadow">
            {rating}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {title || "Untitled"}
        </h3>
        {subtitle && (
          <p className="text-gray-600 text-sm mt-1 truncate">{subtitle}</p>
        )}
        {price && (
          <p className="text-gray-800 font-bold text-base mt-2">{price}</p>
        )}
      </div>
    </div>
  );
};

export default Card;
