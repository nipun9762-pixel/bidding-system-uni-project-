import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

export default function ReviewModal({ order, onClose, onSubmitReview }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Excellent transaction! Vehicle delivered as described.');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitReview(order.orderId, rating, comment);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          Submit Feedback & Ratings
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-0.5 font-['Outfit']">
          Review Order #{order.orderId}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-2">Rating Score</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl border transition-colors ${star <= rating
                      ? 'bg-amber-50 border-amber-300 text-amber-500'
                      : 'bg-slate-100 border-slate-200 text-slate-300'
                    }`}
                >
                  <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-500' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Feedback Comments</label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-colors"
            >
              Submit Rating & Review
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
