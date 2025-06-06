import React from 'react';

const Rating = ({ rating, onRatingChange }) => {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-center mb-8">Berikan Rating Anda!</h2>
      <div className="flex justify-center gap-10">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none mb-8 hover:cursor-pointer"
          >
            <img
              src={star <= rating ? "/icons/star-filled.png" : "/icons/star-unfilled.png"} 
              alt={star <= rating ? "Filled Star" : "Unfilled Star"}
              className="w-14 h-14"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Rating;