import React from 'react';
import { Star } from 'lucide-react';
import type { Bar } from '@shared/schema';

interface SponsoredCarouselProps {
  bars: Bar[];
  onBarClick: (bar: Bar) => void;
}

export default function SponsoredCarousel({ bars, onBarClick }: SponsoredCarouselProps) {
  if (bars.length === 0) {
    return (
      <section className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Sponsored Bars</h2>
            <p className="text-gray-400 text-sm">Discover our featured venues</p>
          </div>
        </div>
        <div className="text-gray-400 text-center py-8">
          No sponsored bars available at the moment
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-white">Sponsored Bars</h2>
          <p className="text-gray-400 text-sm">Discover our featured venues</p>
        </div>
        <button className="text-app-orange font-medium text-sm">
          View All
        </button>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2">
        {bars.map((bar) => (
          <div
            key={bar.id}
            className="flex-shrink-0 w-64 app-charcoal rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onBarClick(bar)}
          >
            <img
              src={bar.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'}
              alt={bar.name}
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{bar.name}</h3>
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-current" size={14} />
                  <span className="text-sm text-gray-300 ml-1">{bar.rating}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">{bar.description}</p>
              {bar.promotion && (
                <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full inline-block">
                  {bar.promotion}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
