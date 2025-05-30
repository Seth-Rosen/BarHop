import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  User,
  Share2,
  Heart,
  Music,
  PartyPopper,
  Star,
  DollarSign,
  MessageCircle
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'live_music' | 'birthday' | 'celebration' | 'happy_hour' | 'karaoke' | 'trivia';
  organizer: {
    type: 'bar' | 'user';
    name: string;
    profileImage?: string;
  };
  venue: {
    name: string;
    address: string;
    distance?: number;
  };
  datetime: string;
  duration?: number;
  attendeeCount: number;
  maxAttendees?: number;
  isSponsored: boolean;
  isFeatured: boolean;
  tags: string[];
  price?: number;
}

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  if (!isOpen || !event) return null;

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'live_music': return <Music size={20} className="text-app-orange" />;
      case 'birthday': return <PartyPopper size={20} className="text-pink-400" />;
      case 'celebration': return <PartyPopper size={20} className="text-purple-400" />;
      case 'happy_hour': return <Clock size={20} className="text-green-400" />;
      case 'karaoke': return <Music size={20} className="text-blue-400" />;
      case 'trivia': return <Star size={20} className="text-yellow-400" />;
      default: return <Calendar size={20} className="text-gray-400" />;
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString([], { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit' 
      })
    };
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const { date, time } = formatDateTime(event.datetime);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto bg-app-charcoal rounded-t-3xl max-h-[85vh] overflow-hidden">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center space-x-3">
            {getEventIcon(event.type)}
            <div>
              <h2 className="text-xl font-bold text-white">{event.title}</h2>
              <p className="text-gray-400 text-sm">
                by {event.organizer.name}
                {event.organizer.type === 'bar' && (
                  <span className="ml-1 px-2 py-0.5 bg-app-orange/20 text-app-orange rounded text-xs">
                    Venue
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {event.isSponsored && (
              <span className="px-2 py-1 bg-app-orange/20 text-app-orange rounded-full text-xs">
                Sponsored
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-4 pb-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Event Details */}
          <div className="space-y-4">
            {/* Description */}
            <div>
              <p className="text-gray-300 leading-relaxed">{event.description}</p>
            </div>

            {/* Date & Time */}
            <div className="app-black rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Calendar size={20} className="text-app-orange mt-0.5" />
                <div>
                  <p className="text-white font-medium">{date}</p>
                  <p className="text-gray-400">{time}</p>
                  {event.duration && (
                    <p className="text-gray-400 text-sm">Duration: {formatDuration(event.duration)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="app-black rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <MapPin size={20} className="text-app-orange mt-0.5" />
                <div>
                  <p className="text-white font-medium">{event.venue.name}</p>
                  <p className="text-gray-400">{event.venue.address}</p>
                  {event.venue.distance && (
                    <p className="text-gray-400 text-sm">{event.venue.distance} miles away</p>
                  )}
                </div>
              </div>
            </div>

            {/* Attendees */}
            <div className="app-black rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Users size={20} className="text-app-orange" />
                  <span className="text-white font-medium">
                    {event.attendeeCount} attending
                    {event.maxAttendees && ` / ${event.maxAttendees}`}
                  </span>
                </div>
                {event.maxAttendees && (
                  <div className="text-sm text-gray-400">
                    {Math.round((event.attendeeCount / event.maxAttendees) * 100)}% full
                  </div>
                )}
              </div>
              
              {/* Progress bar if max attendees */}
              {event.maxAttendees && (
                <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div 
                    className="bg-app-orange h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((event.attendeeCount / event.maxAttendees) * 100, 100)}%` }}
                  />
                </div>
              )}

              {/* Mock attendee avatars */}
              <div className="flex -space-x-2">
                {[...Array(Math.min(event.attendeeCount, 8))].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-br from-app-orange to-purple-600 rounded-full border-2 border-app-charcoal flex items-center justify-center"
                  >
                    <User size={12} className="text-white" />
                  </div>
                ))}
                {event.attendeeCount > 8 && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-app-charcoal flex items-center justify-center">
                    <span className="text-white text-xs">+{event.attendeeCount - 8}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            {event.price && (
              <div className="app-black rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <DollarSign size={20} className="text-app-orange" />
                  <div>
                    <p className="text-white font-medium">${event.price}</p>
                    <p className="text-gray-400 text-sm">Entry fee</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <h4 className="text-white font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 app-black text-gray-300 rounded-full text-sm border border-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="app-black rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <MessageCircle size={20} className="text-app-orange" />
                <h4 className="text-white font-medium">Comments</h4>
              </div>
              <p className="text-gray-400 text-sm text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-app-charcoal border-t border-gray-700 p-4">
          <div className="flex space-x-3">
            <button className="flex items-center justify-center p-3 app-black border border-gray-700 rounded-lg hover:border-app-orange transition-colors">
              <Heart size={20} className="text-gray-400" />
            </button>
            <button className="flex items-center justify-center p-3 app-black border border-gray-700 rounded-lg hover:border-app-orange transition-colors">
              <Share2 size={20} className="text-gray-400" />
            </button>
            <button className="flex-1 bg-app-orange text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors">
              RSVP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}