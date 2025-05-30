import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import SearchBar from '@/components/search-bar';
import SponsoredCarousel from '@/components/sponsored-carousel';
import NearbyBars from '@/components/nearby-bars';
import SlidingMap from '@/components/sliding-map';
import BottomNavigation from '@/components/bottom-navigation';
import BarDetailModal from '@/components/bar-detail-modal';
import type { Bar } from '@shared/schema';
import type { UserLocation } from '@/types';

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [isBarModalOpen, setIsBarModalOpen] = useState(false);
  const [detailedBar, setDetailedBar] = useState<any>(null);
  const [selectedFromMap, setSelectedFromMap] = useState(false);

  // Fetch sponsored bars
  const { data: sponsoredBars = [], isLoading: sponsoredLoading } = useQuery<Bar[]>({
    queryKey: ['/api/bars/sponsored'],
  });

  // Fetch nearby bars when location is available
  const { data: nearbyBars = [], isLoading: nearbyLoading } = useQuery<Bar[]>({
    queryKey: ['/api/bars/nearby', userLocation?.latitude, userLocation?.longitude],
    enabled: !!userLocation,
    queryFn: async () => {
      if (!userLocation) return [];
      const response = await fetch(
        `/api/bars/nearby?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=5`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch nearby bars');
      return response.json();
    },
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isBarModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [isBarModalOpen]);

  // Get user's current location automatically
  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Get address from coordinates
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${await fetch('/api/config').then(r => r.json()).then(c => c.googleApiKey)}`
            );
            const data = await response.json();
            const address = data.results?.[0]?.formatted_address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            
            setUserLocation({ latitude, longitude, address });
          } catch (error) {
            setUserLocation({ 
              latitude, 
              longitude, 
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
            });
          }
        },
        (error) => {
          // Fallback to Portland if location access denied
          setUserLocation({
            latitude: 45.5152,
            longitude: -122.6784,
            address: 'Portland, OR'
          });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
      );
    }
    // Show map initially in retracted state
    setIsMapVisible(true);
  }, []);

  const handleLocationSelect = (location: { latitude: number; longitude: number; address: string }) => {
    setUserLocation(location);
    setIsMapVisible(true); // Automatically show map when location is selected
    // Close modal when search is performed
    if (isBarModalOpen) {
      setIsBarModalOpen(false);
      setSelectedBar(null);
      setDetailedBar(null);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Close modal when search query changes
    if (isBarModalOpen && query.trim()) {
      setIsBarModalOpen(false);
      setSelectedBar(null);
      setDetailedBar(null);
    }
  };

  const handleBarClick = async (bar: Bar, fromMap: boolean = false) => {
    console.log('Bar clicked:', bar);
    setSelectedBar(bar);
    setIsBarModalOpen(true);
    setSelectedFromMap(fromMap);
    
    // Show map and orient it to the selected bar when selected from list
    if (!fromMap && userLocation) {
      setIsMapVisible(true);
    }
    
    // If bar has a placeId, fetch detailed information
    if (bar.placeId) {
      try {
        const response = await fetch(`/api/bars/${bar.placeId}/details`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const detailedData = await response.json();
          setDetailedBar({
            ...bar,
            ...detailedData,
            hours: detailedData.hours || bar.hours
          });
        } else {
          setDetailedBar(bar);
        }
      } catch (error) {
        console.error('Error fetching bar details:', error);
        setDetailedBar(bar);
      }
    } else {
      setDetailedBar(bar);
    }
  };

  const handleMapToggle = () => {
    setIsMapVisible(!isMapVisible);
  };

  const handleModalClose = () => {
    setIsBarModalOpen(false);
    setSelectedBar(null);
    setDetailedBar(null);
  };

  const handleMapClose = () => {
    setIsMapVisible(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Navigate to different pages based on tab
    if (tab === 'profile') {
      setLocation('/profile');
    } else if (tab === 'barhop') {
      setLocation('/barhop');
    } else if (tab === 'social') {
      // TODO: Navigate to Social page when created
      console.log('Social functionality coming soon');
    }
    // Stay on home for 'home' tab
  };

  const mapCenter = userLocation
    ? { lat: userLocation.latitude, lng: userLocation.longitude }
    : { lat: 45.5152, lng: -122.6784 };

  return (
    <div className="app-black min-h-screen relative overflow-hidden">
      {/* Status Bar Simulation */}
      <div className="flex justify-between items-center px-4 pt-3 pb-1 text-xs text-gray-400 app-charcoal">
        <span>9:41</span>
        <div className="flex items-center space-x-1">
          <span>📶</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header with Search */}
      <header className="app-charcoal px-4 py-3 sticky top-0 z-50">
        <SearchBar
          onLocationSelect={handleLocationSelect}
          onSearchChange={handleSearchChange}
        />
      </header>

      {/* Main Content */}
      <main className="pb-28">
        <div className="space-y-4">
          {/* Sponsored Section */}
          {sponsoredLoading ? (
            <div className="px-4 py-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-2 w-1/3"></div>
                <div className="h-4 bg-gray-700 rounded mb-4 w-1/2"></div>
                <div className="flex space-x-4">
                  <div className="w-32 h-24 bg-gray-700 rounded-lg"></div>
                  <div className="w-32 h-24 bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            </div>
          ) : (
            <SponsoredCarousel bars={sponsoredBars} onBarClick={handleBarClick} />
          )}
        </div>

        <div className="pt-4">
          {/* Nearby Bars Section */}
          {nearbyLoading ? (
            <div className="px-4 py-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <NearbyBars
              bars={nearbyBars}
              onBarClick={handleBarClick}
              onMapToggle={handleMapToggle}
              userLocation={userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : undefined}
            />
          )}
        </div>
      </main>

      {/* Sliding Map Overlay */}
      <SlidingMap
        isVisible={isMapVisible}
        onClose={handleMapClose}
        bars={nearbyBars}
        center={mapCenter}
        selectedBar={selectedBar}
        onBarClick={(bar) => handleBarClick(bar, true)}
      />

      {/* Bar Detail Modal */}
      <BarDetailModal
        bar={detailedBar}
        isOpen={isBarModalOpen}
        onClose={handleModalClose}
        selectedFromMap={selectedFromMap}
      />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
