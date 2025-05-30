import React from 'react';
import { Home, MapPin, Users, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'barhop', label: 'BarHop', icon: MapPin },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 app-charcoal border-t border-gray-700 z-30">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-around py-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                activeTab === id
                  ? 'text-app-orange'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
