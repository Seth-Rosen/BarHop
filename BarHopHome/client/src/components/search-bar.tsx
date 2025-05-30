import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, MapPin } from 'lucide-react';
import { googlePlacesService } from '@/lib/google-places';
import type { LocationSuggestion } from '@/types';

interface SearchBarProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  onSearchChange: (query: string) => void;
}

export default function SearchBar({ onLocationSelect, onSearchChange }: SearchBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.length > 2) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const fetchSuggestions = async (query: string) => {
    try {
      setIsLoading(true);
      const results = await googlePlacesService.getLocationSuggestions(query);
      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await googlePlacesService.getCurrentLocation();
      const address = await googlePlacesService.reverseGeocode(location.latitude, location.longitude);
      
      onLocationSelect({
        ...location,
        address
      });
      
      setSearchQuery('Current Location');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    try {
      setIsLoading(true);
      const placeDetails = await googlePlacesService.getPlaceDetails(suggestion.place_id);
      
      if (placeDetails.geometry?.location) {
        const location = {
          latitude: placeDetails.geometry.location.lat(),
          longitude: placeDetails.geometry.location.lng(),
          address: placeDetails.formatted_address || suggestion.description
        };
        
        onLocationSelect(location);
        setSearchQuery(suggestion.structured_formatting?.main_text || suggestion.description);
        setIsDropdownOpen(false);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      // Fallback to using the suggestion description
      setSearchQuery(suggestion.structured_formatting?.main_text || suggestion.description);
      setIsDropdownOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
    
    if (value.length > 0) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="relative">
      <div
        className="flex items-center app-black rounded-xl px-4 py-3 border border-gray-700 cursor-pointer"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <Search className="text-gray-400 mr-3" size={20} />
        <input
          type="text"
          placeholder="Search for bars, locations..."
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="bg-transparent flex-1 text-white placeholder-gray-400 outline-none"
        />
        <ChevronDown 
          className={`text-gray-400 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
          size={16} 
        />
      </div>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 app-charcoal rounded-xl mt-2 border border-gray-700 shadow-xl z-10">
          <div className="p-2">
            <div
              className="flex items-center px-3 py-3 hover:app-black rounded-lg cursor-pointer border-b border-gray-700"
              onClick={handleCurrentLocation}
            >
              <MapPin className="text-app-orange mr-3" size={20} />
              <span className="text-white font-medium">
                {isLoading ? 'Getting location...' : 'Use Current Location'}
              </span>
            </div>

            {suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                className="flex items-center px-3 py-3 hover:app-black rounded-lg cursor-pointer"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <MapPin className="text-gray-400 mr-3" size={20} />
                <div>
                  <div className="text-white">{suggestion.structured_formatting?.main_text}</div>
                  <div className="text-gray-400 text-sm">{suggestion.structured_formatting?.secondary_text}</div>
                </div>
              </div>
            ))}

            {isLoading && suggestions.length === 0 && (
              <div className="px-3 py-3 text-gray-400 text-center">
                Loading suggestions...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
