import { useEffect, useRef, useState } from 'react';
import { X, Layers } from 'lucide-react';
import type { Bar } from '@shared/schema';

interface SlidingMapProps {
  isVisible: boolean;
  onClose: () => void;
  bars: Bar[];
  center: { lat: number; lng: number };
  selectedBar?: Bar | null;
  onBarClick?: (bar: Bar) => void;
}

export default function SlidingMap({ isVisible, onClose, bars, center, selectedBar, onBarClick }: SlidingMapProps) {
  const [mapHeight, setMapHeight] = useState(120); // Start with minimal height
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);
  
  const minHeight = 120; // Just header and handle
  const maxHeight = window.innerHeight - 120; // Flush with search header

  // Initialize map when visible
  useEffect(() => {
    if (isVisible && mapRef.current && window.google && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [isVisible, center]);

  // Add markers when bars change
  useEffect(() => {
    if (mapInstanceRef.current && window.google) {
      // Clear existing bar markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      // Clear existing search marker
      if (searchMarkerRef.current) {
        searchMarkerRef.current.setMap(null);
        searchMarkerRef.current = null;
      }
      
      // Add search location marker if available
      if (center.lat !== 0 && center.lng !== 0) {
        searchMarkerRef.current = new google.maps.Marker({
          position: center,
          map: mapInstanceRef.current,
          title: "Search Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#f97316",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2
          }
        });
      }

      // Create clean Google-style markers
      if (bars.length > 0) {
        bars.forEach((bar) => {
          if (bar.latitude && bar.longitude) {
            const position = {
              lat: parseFloat(bar.latitude),
              lng: parseFloat(bar.longitude)
            };

            const truncatedName = bar.name.length > 18 ? bar.name.substring(0, 18) + '...' : bar.name;
            const labelWidth = Math.min(Math.max(truncatedName.length * 6.5 + 12, 70), 130);

            const marker = new google.maps.Marker({
              position,
              map: mapInstanceRef.current,
              title: bar.name,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="${labelWidth + 24}" height="32" viewBox="0 0 ${labelWidth + 24} 32">
                    <defs>
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
                      </filter>
                    </defs>
                    <circle cx="16" cy="16" r="8" fill="#1976d2" stroke="white" stroke-width="2" filter="url(#shadow)"/>
                    <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="10">🍺</text>
                    <rect x="24" y="8" width="${labelWidth}" height="16" rx="8" fill="white" stroke="#ddd" stroke-width="1" filter="url(#shadow)"/>
                    <text x="32" y="19" fill="#333" font-family="Roboto, Arial, sans-serif" font-size="11" font-weight="400">${truncatedName}</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(labelWidth + 24, 32),
                anchor: new google.maps.Point(16, 16)
              },
              optimized: false
            });

            markersRef.current.push(marker);

            // Add info window on click
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; font-family: Roboto, sans-serif;">
                  <div style="font-weight: 500; font-size: 14px; color: #333; margin-bottom: 4px;">
                    ${bar.name}
                  </div>
                  <div style="font-size: 12px; color: #666;">
                    ${bar.address || 'Address not available'}
                  </div>
                  ${bar.rating ? `
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">
                      ⭐ ${bar.rating}
                    </div>
                  ` : ''}
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstanceRef.current, marker);
            });
          }
        });
        // Optimize zoom to show most results with visible streets
        const bounds = new google.maps.LatLngBounds();
        
        // Add all bar locations to bounds
        bars.forEach(bar => {
          if (bar.latitude && bar.longitude) {
            bounds.extend({
              lat: parseFloat(bar.latitude),
              lng: parseFloat(bar.longitude)
            });
          }
        });
        
        if (bars.length > 0) {
          // Fit bounds with padding for better visibility
          mapInstanceRef.current.fitBounds(bounds, {
            top: 80,
            right: 80,
            bottom: 80,
            left: 80
          });
          
          // Ensure optimal zoom level for street visibility
          setTimeout(() => {
            const currentZoom = mapInstanceRef.current?.getZoom();
            if (currentZoom && currentZoom > 16) {
              mapInstanceRef.current.setZoom(16); // Max zoom for street detail
            } else if (currentZoom && currentZoom < 12) {
              mapInstanceRef.current.setZoom(12); // Min zoom to see streets
            }
          }, 100);
        } else {
          // No bars, center on search location with good street visibility
          mapInstanceRef.current.setCenter(center);
          mapInstanceRef.current.setZoom(14);
        }
      }
    }
  }, [bars, center]);

  // Global mouse tracking during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY; // Drag up = increase height
      const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
      setMapHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startHeight]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      styles: [
        {
          featureType: "poi",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "poi.business",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "poi.attraction",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "poi.government",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "poi.medical",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "poi.park",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "poi.place_of_worship",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "poi.school",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "poi.sports_complex",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "transit",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "all",
          elementType: "geometry.fill",
          stylers: [{ color: "#1a1a1a" }]
        },
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#e5e5e5" }]
        },
        {
          featureType: "all",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#000000" }, { weight: 1 }]
        },
        {
          featureType: "water",
          elementType: "geometry.fill",
          stylers: [{ color: "#0f172a" }]
        },
        {
          featureType: "road",
          elementType: "geometry.fill",
          stylers: [{ color: "#2d2d2d" }]
        }
      ],
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
      }
    });

    // Add user location marker
    userMarkerRef.current = new google.maps.Marker({
      position: center,
      map: mapInstanceRef.current,
      title: "Your Location",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#8b5cf6",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2
      }
    });
  };



  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(mapHeight);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaY = startY - e.touches[0].clientY;
    const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
    setMapHeight(newHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed left-1/2 transform -translate-x-1/2 bg-gray-900 rounded-t-3xl border-2 border-app-orange shadow-2xl z-30 flex flex-col"
      style={{ 
        height: `${mapHeight}px`,
        bottom: '8px', // Shows header above navigation
        width: 'calc(100% - 2rem)',
        maxWidth: '448px' // max-w-md equivalent
      }}
    >
      {/* Draggable Header */}
      <div 
        className="cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 bg-gray-500 rounded-full"></div>
        </div>

        {/* Header Content */}
        <div className="px-4 pb-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Map</h3>
            <div className="flex items-center space-x-3">
              <button className="text-app-orange hover:text-orange-400">
                <Layers size={20} />
              </button>
              <button
                onClick={onClose}
                className="text-app-orange hover:text-orange-400"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            {bars.length} bars found within 2 miles
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative min-h-0">
        <div
          ref={mapRef}
          className="w-full h-full rounded-b-3xl"
        />
        
        {!window.google && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-800 rounded-b-3xl">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <p>Interactive Map View</p>
              <p className="text-sm">Google Maps Loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}