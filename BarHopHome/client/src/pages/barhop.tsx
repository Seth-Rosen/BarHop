import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Plus, 
  Clock,
  Star,
  Music,
  PartyPopper,
  Check,
  X,
  Filter,
  Search
} from 'lucide-react';
import BottomNavigation from '@/components/bottom-navigation';
import EventDetailModal from '@/components/event-detail-modal';

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

interface Invitation {
  id: string;
  event: Event;
  invitedBy: {
    name: string;
    profileImage: string;
  };
  invitedAt: string;
  message?: string;
}

export default function BarHop() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('barhop');
  const [activeSection, setActiveSection] = useState('discover');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [showCreateBarHop, setShowCreateBarHop] = useState(false);

  // Mock data - this will come from your API
  const featuredEvents: Event[] = [
    {
      id: '1',
      title: 'Live Jazz Night',
      description: 'Smooth jazz performances by local artists every Friday',
      type: 'live_music',
      organizer: { type: 'bar', name: 'Blue Note Lounge' },
      venue: { name: 'Blue Note Lounge', address: '123 Jazz St', distance: 0.5 },
      datetime: '2025-05-30T20:00:00',
      duration: 180,
      attendeeCount: 45,
      maxAttendees: 80,
      isSponsored: true,
      isFeatured: true,
      tags: ['jazz', 'live music', 'cocktails'],
      price: 15
    },
    {
      id: '2',
      title: "Sarah's 25th Birthday Bash",
      description: 'Join me for drinks and dancing to celebrate another year!',
      type: 'birthday',
      organizer: { type: 'user', name: 'Sarah Mitchell', profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b123?w=50' },
      venue: { name: 'Neon Nights', address: '456 Party Ave', distance: 1.2 },
      datetime: '2025-05-31T19:30:00',
      attendeeCount: 23,
      maxAttendees: 40,
      isSponsored: false,
      isFeatured: false,
      tags: ['birthday', 'dancing', 'cocktails']
    },
    {
      id: '3',
      title: 'Happy Hour Specials',
      description: '50% off all drinks and appetizers',
      type: 'happy_hour',
      organizer: { type: 'bar', name: 'The Vintage' },
      venue: { name: 'The Vintage', address: '789 Main St', distance: 0.8 },
      datetime: '2025-05-29T17:00:00',
      duration: 120,
      attendeeCount: 67,
      isSponsored: true,
      isFeatured: true,
      tags: ['happy hour', 'deals', 'food']
    }
  ];

  const myRSVPs: Event[] = [
    featuredEvents[0], // Jazz Night
    {
      id: '4',
      title: 'Trivia Tuesday',
      description: 'Test your knowledge and win prizes!',
      type: 'trivia',
      organizer: { type: 'bar', name: 'Brain Busters Bar' },
      venue: { name: 'Brain Busters Bar', address: '321 Quiz Lane', distance: 2.1 },
      datetime: '2025-06-03T19:00:00',
      duration: 120,
      attendeeCount: 32,
      isSponsored: false,
      isFeatured: false,
      tags: ['trivia', 'games', 'prizes']
    }
  ];

  const invitations: Invitation[] = [
    {
      id: '1',
      event: featuredEvents[1], // Sarah's Birthday
      invitedBy: {
        name: 'Sarah Mitchell',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b123?w=50'
      },
      invitedAt: '2025-05-28T10:30:00',
      message: "You're invited to my birthday party! Can't wait to celebrate with you! 🎉"
    },
    {
      id: '2',
      event: {
        id: '5',
        title: 'Karaoke Night Champions',
        description: 'Monthly karaoke competition with cash prizes',
        type: 'karaoke',
        organizer: { type: 'bar', name: 'Sing Sing Bar' },
        venue: { name: 'Sing Sing Bar', address: '654 Melody St', distance: 1.8 },
        datetime: '2025-06-05T21:00:00',
        duration: 180,
        attendeeCount: 28,
        maxAttendees: 50,
        isSponsored: false,
        isFeatured: false,
        tags: ['karaoke', 'competition', 'prizes'],
        price: 10
      },
      invitedBy: {
        name: 'Mike Johnson',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50'
      },
      invitedAt: '2025-05-28T14:15:00'
    }
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'home') {
      setLocation('/');
    } else if (tab === 'profile') {
      setLocation('/profile');
    } else if (tab === 'social') {
      console.log('Social functionality coming soon');
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEventModalClose = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const handleCreateBarHop = () => {
    setShowCreateBarHop(true);
  };

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'live_music': return <Music size={16} className="text-app-orange" />;
      case 'birthday': return <PartyPopper size={16} className="text-pink-400" />;
      case 'celebration': return <PartyPopper size={16} className="text-purple-400" />;
      case 'happy_hour': return <Clock size={16} className="text-green-400" />;
      case 'karaoke': return <Music size={16} className="text-blue-400" />;
      case 'trivia': return <Star size={16} className="text-yellow-400" />;
      default: return <Calendar size={16} className="text-gray-400" />;
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className="app-black min-h-screen">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 pt-3 pb-1 text-xs text-gray-400 app-charcoal">
        <span>9:41</span>
        <div className="flex items-center space-x-1">
          <span>📶</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header */}
      <div className="app-charcoal px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">BarHop</h1>
          <button 
            onClick={handleCreateBarHop}
            className="flex items-center space-x-2 px-4 py-2 bg-app-orange text-white rounded-lg"
          >
            <Plus size={16} />
            <span className="text-sm">Create</span>
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex space-x-1 app-black rounded-lg p-1">
          {[
            { id: 'discover', label: 'Discover' },
            { id: 'my-events', label: 'My Events' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'app-charcoal text-app-orange border border-app-orange'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-32">
        {activeSection === 'discover' && (
          <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2 app-charcoal border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-app-orange focus:outline-none"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 app-charcoal border border-gray-700 rounded-lg hover:border-app-orange transition-colors"
              >
                <Filter size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Featured Events */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Featured Events</h3>
              {featuredEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="app-charcoal rounded-xl p-4 border border-gray-700 hover:border-app-orange transition-colors cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start space-x-3">
                      {getEventIcon(event.type)}
                      <div>
                        <h4 className="text-white font-medium">{event.title}</h4>
                        <p className="text-gray-400 text-sm">{event.description}</p>
                      </div>
                    </div>
                    {event.isSponsored && (
                      <span className="px-2 py-1 bg-app-orange/20 text-app-orange rounded-full text-xs">
                        Sponsored
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <MapPin size={12} />
                        <span>{event.venue.name}</span>
                        {event.venue.distance && (
                          <span>• {event.venue.distance}mi</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{formatDateTime(event.datetime)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users size={12} />
                        <span>{event.attendeeCount} attending</span>
                        {event.maxAttendees && (
                          <span>/ {event.maxAttendees}</span>
                        )}
                      </div>
                      {event.price && (
                        <span className="text-app-orange">${event.price}</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-app-orange text-white rounded-lg text-xs">
                        RSVP
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {event.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 app-black text-gray-400 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'my-events' && (
          <div className="space-y-6">
            {/* My RSVPs */}
            <div>
              <h3 className="text-white font-semibold mb-3">Upcoming Events</h3>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {myRSVPs.map((event) => (
                  <div 
                    key={event.id}
                    className="min-w-64 app-charcoal rounded-xl p-4 border border-gray-700 cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start space-x-2 mb-2">
                      {getEventIcon(event.type)}
                      <div>
                        <h5 className="text-white font-medium text-sm">{event.title}</h5>
                        <p className="text-gray-400 text-xs">{event.venue.name}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{formatDateTime(event.datetime)}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Users size={10} />
                      <span>{event.attendeeCount} attending</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invitations */}
            <div>
              <h3 className="text-white font-semibold mb-3">
                Invitations ({invitations.length})
              </h3>
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div 
                    key={invitation.id}
                    className="app-charcoal rounded-xl p-4 border border-gray-700"
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      <img
                        src={invitation.invitedBy.profileImage}
                        alt={invitation.invitedBy.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-white text-sm">
                          <span className="font-medium">{invitation.invitedBy.name}</span> invited you to
                        </p>
                        <h5 className="text-app-orange font-medium">{invitation.event.title}</h5>
                        {invitation.message && (
                          <p className="text-gray-400 text-xs mt-1">"{invitation.message}"</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin size={12} />
                        <span>{invitation.event.venue.name}</span>
                      </div>
                      <span>{formatDateTime(invitation.event.datetime)}</span>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-1 app-black border border-gray-700 text-gray-400 rounded-lg text-xs">
                        <X size={12} />
                        <span>Decline</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-1 bg-app-orange text-white rounded-lg text-xs">
                        <Check size={12} />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={handleEventModalClose}
      />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}