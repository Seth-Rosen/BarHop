import { X, Star, Clock, Phone, Globe, MapPin, ExternalLink } from 'lucide-react';
import { Bar } from '@shared/schema';
import { getOpenStatusMessage } from '@/lib/time-utils';

interface BarDetailModalProps {
  bar: Bar | null;
  isOpen: boolean;
  onClose: () => void;
  selectedFromMap?: boolean;
}

export default function BarDetailModal({ bar, isOpen, onClose, selectedFromMap = false }: BarDetailModalProps) {
  if (!isOpen || !bar) return null;

  const handleCallClick = () => {
    if (bar.phoneNumber) {
      window.open(`tel:${bar.phoneNumber}`, '_self');
    }
  };

  const handleDirectionsClick = () => {
    const address = encodeURIComponent(bar.address);
    window.open(`https://maps.google.com/?q=${address}`, '_blank');
  };

  const handleWebsiteClick = () => {
    if (bar.website) {
      window.open(bar.website, '_blank');
    }
  };

  const handleMenuClick = () => {
    if (bar.website) {
      window.open(bar.website, '_blank');
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 ${selectedFromMap ? 'z-50' : 'z-20'} flex flex-col`}>
      <div className="flex-1 flex items-start justify-center px-4 pt-28 pb-36">
        <div className="app-charcoal border border-gray-700 w-full max-w-sm rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
          {/* Header */}
          <div className="relative flex-shrink-0">
            <img
              src={bar.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'}
              alt={bar.name}
              className="w-full h-48 object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{bar.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Star className="text-yellow-400 fill-current mr-1" size={16} />
                    <span>{bar.rating}</span>
                  </div>
                  <span>{bar.priceRange}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bar.isOpen ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {getOpenStatusMessage(bar.hours)}
                  </span>
                </div>
                <p className="text-gray-300 mt-3">{bar.address}</p>
              </div>

              {/* Features */}
              {bar.features && bar.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {bar.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm capitalize"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {bar.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                  <p className="text-gray-300 leading-relaxed">{bar.description}</p>
                </div>
              )}

              {/* Contact Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleDirectionsClick}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                >
                  <MapPin size={18} />
                  <span>Get Directions</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  {bar.phoneNumber && (
                    <button
                      onClick={handleCallClick}
                      className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                    >
                      <Phone size={16} />
                      <span>Call</span>
                    </button>
                  )}

                  {bar.website && (
                    <button
                      onClick={handleWebsiteClick}
                      className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                    >
                      <Globe size={16} />
                      <span>Website</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Menu Button */}
              {bar.website && (
                <button
                  onClick={handleMenuClick}
                  className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg transition-colors"
                >
                  <span>View Menu</span>
                  <ExternalLink size={16} />
                </button>
              )}

              {/* Hours - Last Section */}
              {bar.hours && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Clock className="mr-2" size={18} />
                    Hours
                  </h3>
                  <div className="space-y-1 text-sm">
                    {Object.entries(bar.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-300 capitalize">{day}</span>
                        <span className="text-gray-300">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}