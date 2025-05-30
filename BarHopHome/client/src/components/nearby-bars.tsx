import React, { useState } from 'react';
import { Star, Clock, MapPin, Heart } from 'lucide-react';
import type { Bar } from '@shared/schema';
import { getClosingTime, calculateDistance, isOpenNow } from '@/lib/time-utils';

interface NearbyBarsProps {
  bars: Bar[];
  onBarClick: (bar: Bar) => void;
  onMapToggle: () => void;
  userLocation?: { latitude: number; longitude: number };
}

export default function NearbyBars({ bars, onBarClick, onMapToggle, userLocation }: NearbyBarsProps) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const handleFavoriteToggle = (barId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(barId)) {
        newFavorites.delete(barId);
      } else {
        newFavorites.add(barId);
      }
      return newFavorites;
    });
  };

  if (bars.length === 0) {
    return (
      <section className="px-4 py-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Nearby Bars</h2>
          <button
            onClick={onMapToggle}
            className="flex items-center text-app-orange font-medium text-sm hover:text-orange-400"
          >
            <MapPin className="mr-2" size={16} />
            Map View
          </button>
        </div>
        <div className="text-gray-400 text-center py-8">
          No bars found in your area. Try searching a different location.
        </div>
      </section>
    );
  }

  const getFeatureColor = (feature: string) => {
    const colors = [
      'bg-orange-500/20 text-orange-500',
      'bg-purple-500/20 text-purple-500',
      'bg-emerald-500/20 text-emerald-500',
      'bg-blue-500/20 text-blue-500'
    ];
    return colors[feature.length % colors.length];
  };

  return (
    <section className="px-4 py-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white">Nearby Bars</h2>
        <button
          onClick={onMapToggle}
          className="flex items-center text-app-orange font-medium text-sm hover:text-orange-400"
        >
          <MapPin className="mr-2" size={16} />
          Map View
        </button>
      </div>

      <div className="space-y-4">
        {bars.map((bar) => (
          <div
            key={bar.id}
            className="app-charcoal rounded-xl p-4 border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors"
            onClick={() => onBarClick(bar)}
          >
            <div className="flex items-start space-x-4">
              <img
                src={bar.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80'}
                alt={bar.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white">{bar.name}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="text-yellow-400 fill-current" size={14} />
                      <span className="text-sm text-gray-300 ml-1">{bar.rating}</span>
                    </div>
                    <button
                      onClick={(e) => handleFavoriteToggle(bar.id, e)}
                      className={`p-1 rounded-full transition-colors ${
                        favorites.has(bar.id) 
                          ? 'text-red-500 hover:text-red-400' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart 
                        size={16} 
                        className={favorites.has(bar.id) ? 'fill-current' : ''}
                      />
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-2">{bar.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs space-x-3">
                    <div className={`flex items-center ${isOpenNow(bar.hours) ? 'text-app-emerald' : 'text-red-400'}`}>
                      <Clock className="mr-1" size={12} />
                      <span>{getClosingTime(bar.hours)}</span>
                    </div>
                    {userLocation && (
                      <span className="text-gray-400">
                        {calculateDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          parseFloat(bar.latitude),
                          parseFloat(bar.longitude)
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {(bar.features as string[])?.slice(0, 2).map((feature, index) => (
                      <span
                        key={index}
                        className={`text-xs px-2 py-1 rounded-full ${getFeatureColor(feature)}`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
