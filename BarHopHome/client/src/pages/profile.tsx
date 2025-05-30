import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  User, 
  MapPin, 
  Users, 
  Heart, 
  Plus, 
  Calendar, 
  Settings,
  Edit3,
  UserPlus,
  List,
  Star,
  Navigation,
  ArrowLeft
} from 'lucide-react';
import BottomNavigation from '@/components/bottom-navigation';

export default function Profile() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState('overview');
  const [activeTab, setActiveTab] = useState('profile');

  // Mock user data - this will come from your auth system
  const currentUser = {
    id: '1',
    username: 'nightlife_explorer',
    firstName: 'Alex',
    lastName: 'Johnson',
    bio: 'Always down for a good time! Love discovering new spots and meeting new people 🍻',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    friendCount: 47,
    barHopCount: 12,
    favoriteCount: 23,
    isLocationSharingEnabled: true,
    isOnline: true,
  };

  // Mock data for demonstration
  const recentBarHops = [
    {
      id: 1,
      title: 'Downtown Pub Crawl',
      date: '2025-06-15',
      participantCount: 8,
      status: 'planned',
      stops: ['The Vintage', 'Neon Nights', 'Craft Corner']
    },
    {
      id: 2,
      title: 'Rooftop Weekend',
      date: '2025-06-08',
      participantCount: 6,
      status: 'completed',
      stops: ['Sky Bar', 'High Life Lounge']
    }
  ];

  const friendRequests = [
    {
      id: 1,
      username: 'party_sarah',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b123?w=50',
      mutualFriends: 3
    },
    {
      id: 2,
      username: 'mike_barhopper',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50',
      mutualFriends: 7
    }
  ];

  const customLists = [
    { id: 1, name: 'Date Night Spots', count: 5, isPublic: false },
    { id: 2, name: 'Best Happy Hours', count: 12, isPublic: true },
    { id: 3, name: 'Live Music Venues', count: 8, isPublic: true }
  ];

  const recentActivity = [
    { type: 'favorite', text: 'Added The Vintage to favorites', time: '2 hours ago' },
    { type: 'barhop', text: 'Created "Downtown Pub Crawl"', time: '1 day ago' },
    { type: 'friend', text: 'Became friends with @sarah_party', time: '2 days ago' },
    { type: 'review', text: 'Reviewed Neon Nights - 5 stars', time: '3 days ago' }
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'home') {
      setLocation('/');
    } else if (tab === 'barhop') {
      setLocation('/barhop');
    } else if (tab === 'social') {
      console.log('Social functionality coming soon');
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

      {/* Profile Header */}
      <div className="app-charcoal px-4 py-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={currentUser.profileImageUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-app-orange"
              />
              {currentUser.isOnline && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-app-charcoal rounded-full"></div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{currentUser.firstName} {currentUser.lastName}</h1>
              <p className="text-app-orange">@{currentUser.username}</p>
              <div className="flex items-center mt-1 text-sm text-gray-400">
                {currentUser.isLocationSharingEnabled && (
                  <>
                    <Navigation size={12} className="mr-1" />
                    <span>Location sharing on</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button className="p-2 rounded-lg app-black border border-gray-700 hover:border-app-orange transition-colors">
            <Settings size={20} className="text-gray-400" />
          </button>
        </div>

        <p className="text-gray-300 text-sm mb-4">{currentUser.bio}</p>

        {/* Stats */}
        <div className="flex justify-around py-3 app-black rounded-lg border border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{currentUser.friendCount}</div>
            <div className="text-xs text-gray-400">Friends</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{currentUser.barHopCount}</div>
            <div className="text-xs text-gray-400">BarHops</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{currentUser.favoriteCount}</div>
            <div className="text-xs text-gray-400">Favorites</div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="px-4 mb-4">
        <div className="flex space-x-1 app-charcoal rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'barhops', label: 'BarHops' },
            { id: 'friends', label: 'Friends' },
            { id: 'lists', label: 'Lists' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'app-black text-app-orange border border-app-orange'
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
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="app-charcoal rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center space-x-2 py-3 app-black rounded-lg border border-gray-700 hover:border-app-orange transition-colors">
                  <Plus size={18} className="text-app-orange" />
                  <span className="text-white text-sm">Create BarHop</span>
                </button>
                <button className="flex items-center justify-center space-x-2 py-3 app-black rounded-lg border border-gray-700 hover:border-app-orange transition-colors">
                  <UserPlus size={18} className="text-app-orange" />
                  <span className="text-white text-sm">Find Friends</span>
                </button>
              </div>
            </div>

            {/* Friend Requests */}
            {friendRequests.length > 0 && (
              <div className="app-charcoal rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Friend Requests</h3>
                <div className="space-y-3">
                  {friendRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={request.profileImage}
                          alt={request.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-white text-sm font-medium">@{request.username}</p>
                          <p className="text-gray-400 text-xs">{request.mutualFriends} mutual friends</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-app-orange text-white rounded-lg text-xs">Accept</button>
                        <button className="px-3 py-1 app-black border border-gray-700 text-gray-400 rounded-lg text-xs">Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="app-charcoal rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'favorite' ? 'bg-red-500' :
                      activity.type === 'barhop' ? 'bg-app-orange' :
                      activity.type === 'friend' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="text-gray-300 text-sm">{activity.text}</p>
                      <p className="text-gray-500 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'barhops' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">My BarHops</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-app-orange text-white rounded-lg">
                <Plus size={16} />
                <span className="text-sm">Create New</span>
              </button>
            </div>
            
            {recentBarHops.map((barhop) => (
              <div key={barhop.id} className="app-charcoal rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-medium">{barhop.title}</h4>
                    <p className="text-gray-400 text-sm">{new Date(barhop.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    barhop.status === 'planned' ? 'bg-blue-500/20 text-blue-400' :
                    barhop.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {barhop.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Users size={14} />
                    <span>{barhop.participantCount} participants</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <MapPin size={14} />
                    <span>{barhop.stops.length} stops</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-gray-400 text-xs">Stops: {barhop.stops.join(' → ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'friends' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">Friends ({currentUser.friendCount})</h3>
              <button className="flex items-center space-x-2 px-4 py-2 app-black border border-gray-700 rounded-lg hover:border-app-orange transition-colors">
                <UserPlus size={16} className="text-app-orange" />
                <span className="text-white text-sm">Add Friends</span>
              </button>
            </div>
            
            <div className="app-charcoal rounded-xl p-4">
              <p className="text-gray-400 text-center py-8">
                Friend management features coming soon!<br/>
                You'll be able to see your friends, send requests, and manage your social connections here.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'lists' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">My Lists</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-app-orange text-white rounded-lg">
                <Plus size={16} />
                <span className="text-sm">New List</span>
              </button>
            </div>
            
            {customLists.map((list) => (
              <div key={list.id} className="app-charcoal rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">{list.name}</h4>
                    <p className="text-gray-400 text-sm">{list.count} bars</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      list.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {list.isPublic ? 'Public' : 'Private'}
                    </span>
                    <button className="p-1 hover:bg-gray-700 rounded">
                      <Edit3 size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}