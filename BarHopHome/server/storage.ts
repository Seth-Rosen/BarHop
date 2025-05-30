import { bars, type Bar, type InsertBar } from "@shared/schema";

export interface IStorage {
  // Bar operations
  createBar(bar: InsertBar): Promise<Bar>;
  getBar(id: number): Promise<Bar | undefined>;
  getAllBars(): Promise<Bar[]>;
  getNearbyBars(latitude: number, longitude: number, radiusKm?: number): Promise<Bar[]>;
  getSponsoredBars(): Promise<Bar[]>;
  searchBars(query: string, latitude?: number, longitude?: number): Promise<Bar[]>;
  upsertBarFromGoogle(googlePlaceData: any): Promise<Bar>;
  toggleFavorite(userId: number, barId: number): Promise<boolean>;
  isBarFavorited(userId: number, barId: number): Promise<boolean>;
  
  // User operations (keeping existing)
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private bars: Map<number, Bar>;
  private users: Map<number, any>;
  private currentBarId: number;
  private currentUserId: number;

  constructor() {
    this.bars = new Map();
    this.users = new Map();
    this.currentBarId = 1;
    this.currentUserId = 1;
    this.seedBars();
  }

  private seedBars() {
    const sampleBars: InsertBar[] = [
      {
        name: "Neon Nights",
        address: "123 Downtown Ave, Portland, OR 97201",
        latitude: "45.5152",
        longitude: "-122.6784",
        type: "Dance Club",
        description: "Dance Club • Open til 2AM",
        rating: "4.8",
        hours: {
          "Monday": "9:00 PM – 2:00 AM",
          "Tuesday": "9:00 PM – 2:00 AM", 
          "Wednesday": "9:00 PM – 2:00 AM",
          "Thursday": "9:00 PM – 2:00 AM",
          "Friday": "9:00 PM – 2:00 AM",
          "Saturday": "9:00 PM – 2:00 AM",
          "Sunday": "9:00 PM – 2:00 AM"
        },
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
        features: ["Live Music", "Dance Floor", "VIP Area"],
        isSponsored: true,
        promotion: "50% off drinks til 11PM",
        isOpen: true,
        priceRange: "$$",
      },
      {
        name: "Midnight Lounge",
        address: "456 Pearl District, Portland, OR 97209",
        latitude: "45.5235",
        longitude: "-122.6762",
        type: "Cocktail Bar",
        description: "Cocktail Bar • Open til 1AM",
        rating: "4.6",
        hours: {
          "Monday": "5:00 PM – 1:00 AM",
          "Tuesday": "5:00 PM – 1:00 AM", 
          "Wednesday": "5:00 PM – 1:00 AM",
          "Thursday": "5:00 PM – 1:00 AM",
          "Friday": "5:00 PM – 1:00 AM",
          "Saturday": "5:00 PM – 1:00 AM",
          "Sunday": "5:00 PM – 12:00 AM"
        },
        imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400",
        features: ["Craft Cocktails", "Outdoor Seating"],
        isSponsored: true,
        promotion: "Happy Hour 5-7PM",
        isOpen: true,
        priceRange: "$$$",
      },
      {
        name: "The Local Tap",
        address: "789 Sports Ave, Portland, OR 97202",
        latitude: "45.5145",
        longitude: "-122.6850",
        type: "Sports Bar",
        description: "Sports Bar • 0.3 miles away",
        rating: "4.5",
        hours: {
          "Monday": "11:00 AM – 12:00 AM",
          "Tuesday": "11:00 AM – 12:00 AM", 
          "Wednesday": "11:00 AM – 12:00 AM",
          "Thursday": "11:00 AM – 12:00 AM",
          "Friday": "11:00 AM – 1:00 AM",
          "Saturday": "11:00 AM – 1:00 AM",
          "Sunday": "11:00 AM – 11:00 PM"
        },
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
        features: ["Live Sports", "Pool Table", "Wings"],
        isSponsored: false,
        isOpen: true,
        priceRange: "$$",
      },
      {
        name: "Craft & Co.",
        address: "321 Brewery St, Portland, OR 97203",
        latitude: "45.5180",
        longitude: "-122.6790",
        type: "Craft Brewery",
        description: "Craft Brewery • 0.5 miles away",
        rating: "4.7",
        hours: {
          "Monday": "3:00 PM – 11:00 PM",
          "Tuesday": "3:00 PM – 11:00 PM", 
          "Wednesday": "3:00 PM – 11:00 PM",
          "Thursday": "3:00 PM – 11:00 PM",
          "Friday": "3:00 PM – 12:00 AM",
          "Saturday": "12:00 PM – 12:00 AM",
          "Sunday": "12:00 PM – 10:00 PM"
        },
        imageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400",
        features: ["Craft Beer", "Food Menu", "Brewery Tours"],
        isSponsored: false,
        isOpen: true,
        priceRange: "$$",
      },
      {
        name: "Sky Lounge",
        address: "654 High Rise Blvd, Portland, OR 97204",
        latitude: "45.5200",
        longitude: "-122.6820",
        type: "Rooftop Bar",
        description: "Rooftop Bar • 0.8 miles away",
        rating: "4.9",
        hours: {
          "Monday": "Closed",
          "Tuesday": "5:00 PM – 2:00 AM", 
          "Wednesday": "5:00 PM – 2:00 AM",
          "Thursday": "5:00 PM – 2:00 AM",
          "Friday": "5:00 PM – 2:00 AM",
          "Saturday": "5:00 PM – 2:00 AM",
          "Sunday": "5:00 PM – 1:00 AM"
        },
        imageUrl: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400",
        features: ["City Views", "Cocktails", "Rooftop Terrace"],
        isSponsored: false,
        isOpen: true,
        priceRange: "$$$",
      },
    ];

    sampleBars.forEach(bar => {
      const id = this.currentBarId++;
      this.bars.set(id, { 
        ...bar,
        id,
        placeId: bar.placeId || null,
        description: bar.description || null,
        rating: bar.rating || "0.0",
        userRatingsTotal: bar.userRatingsTotal || null,
        phoneNumber: bar.phoneNumber || null,
        website: bar.website || null,
        imageUrl: bar.imageUrl || null,
        photos: bar.photos || [],
        features: bar.features || [],
        promotion: bar.promotion || null,
        priceRange: bar.priceRange || null,
        priceLevel: bar.priceLevel || null,
        isVerified: bar.isVerified || false,
        businessOwnerId: bar.businessOwnerId || null,
        customization: bar.customization || null,
        lastGoogleSync: bar.lastGoogleSync || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  }

  // Bar methods
  async createBar(insertBar: InsertBar): Promise<Bar> {
    const id = this.currentBarId++;
    const bar: Bar = { 
      ...insertBar, 
      id, 
      placeId: insertBar.placeId || null,
      description: insertBar.description || null,
      rating: insertBar.rating || "0.0",
      userRatingsTotal: insertBar.userRatingsTotal || null,
      hours: insertBar.hours || null,
      phoneNumber: insertBar.phoneNumber || null,
      website: insertBar.website || null,
      imageUrl: insertBar.imageUrl || null,
      photos: insertBar.photos || [],
      features: insertBar.features || [],
      promotion: insertBar.promotion || null,
      priceRange: insertBar.priceRange || null,
      priceLevel: insertBar.priceLevel || null,
      isVerified: insertBar.isVerified || false,
      businessOwnerId: insertBar.businessOwnerId || null,
      customization: insertBar.customization || null,
      lastGoogleSync: insertBar.lastGoogleSync || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bars.set(id, bar);
    return bar;
  }

  async upsertBarFromGoogle(googlePlaceData: any): Promise<Bar> {
    // Check if bar already exists by placeId
    const existingBar = Array.from(this.bars.values()).find(bar => bar.placeId === googlePlaceData.place_id);
    
    if (existingBar) {
      // Update existing bar with fresh Google data
      const updatedBar: Bar = {
        ...existingBar,
        name: googlePlaceData.name || existingBar.name,
        rating: googlePlaceData.rating?.toString() || existingBar.rating,
        userRatingsTotal: googlePlaceData.user_ratings_total || existingBar.userRatingsTotal,
        phoneNumber: googlePlaceData.formatted_phone_number || existingBar.phoneNumber,
        website: googlePlaceData.website || existingBar.website,
        photos: googlePlaceData.photos?.map((photo: any) => photo.photo_reference) || existingBar.photos || [],
        priceLevel: googlePlaceData.price_level || existingBar.priceLevel,
        hours: this.parseGoogleHours(googlePlaceData.opening_hours) || existingBar.hours,
        lastGoogleSync: new Date(),
        updatedAt: new Date()
      };
      this.bars.set(existingBar.id, updatedBar);
      return updatedBar;
    } else {
      // Create new bar from Google data
      const newBar = await this.createBar({
        placeId: googlePlaceData.place_id,
        name: googlePlaceData.name,
        address: googlePlaceData.formatted_address || googlePlaceData.vicinity,
        latitude: googlePlaceData.geometry.location.lat.toString(),
        longitude: googlePlaceData.geometry.location.lng.toString(),
        type: googlePlaceData.types?.[0] || 'bar',
        rating: googlePlaceData.rating?.toString() || "0.0",
        userRatingsTotal: googlePlaceData.user_ratings_total,
        phoneNumber: googlePlaceData.formatted_phone_number,
        website: googlePlaceData.website,
        photos: Array.isArray(googlePlaceData.photos) ? googlePlaceData.photos.map((photo: any) => photo.photo_reference) : [],
        priceLevel: googlePlaceData.price_level,
        hours: this.parseGoogleHours(googlePlaceData.opening_hours),
        lastGoogleSync: new Date(),
        isOpen: true
      });
      return newBar;
    }
  }

  private parseGoogleHours(openingHours: any): {[key: string]: string} | null {
    if (!openingHours?.weekday_text) return null;
    
    const hours: {[key: string]: string} = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    openingHours.weekday_text.forEach((dayText: string, index: number) => {
      const day = days[index];
      const timeMatch = dayText.match(/: (.+)/);
      hours[day] = timeMatch ? timeMatch[1] : 'Closed';
    });
    
    return hours;
  }

  async toggleFavorite(userId: number, barId: number): Promise<boolean> {
    // In memory implementation - would use database in real app
    const key = `${userId}-${barId}`;
    const favorites = this.favorites || new Set();
    
    if (favorites.has(key)) {
      favorites.delete(key);
      return false;
    } else {
      favorites.add(key);
      return true;
    }
  }

  async isBarFavorited(userId: number, barId: number): Promise<boolean> {
    const key = `${userId}-${barId}`;
    return (this.favorites || new Set()).has(key);
  }

  private favorites = new Set<string>();

  async getBar(id: number): Promise<Bar | undefined> {
    return this.bars.get(id);
  }

  async getAllBars(): Promise<Bar[]> {
    return Array.from(this.bars.values());
  }

  async getNearbyBars(latitude: number, longitude: number, radiusKm: number = 5): Promise<Bar[]> {
    const allBars = Array.from(this.bars.values());
    
    // Simple distance calculation (Haversine formula would be more accurate)
    return allBars.filter(bar => {
      const barLat = parseFloat(bar.latitude);
      const barLng = parseFloat(bar.longitude);
      const distance = Math.sqrt(
        Math.pow(latitude - barLat, 2) + Math.pow(longitude - barLng, 2)
      ) * 111; // Rough conversion to km
      return distance <= radiusKm;
    }).sort((a, b) => {
      // Sort by distance (approximate)
      const distA = Math.sqrt(Math.pow(latitude - parseFloat(a.latitude), 2) + Math.pow(longitude - parseFloat(a.longitude), 2));
      const distB = Math.sqrt(Math.pow(latitude - parseFloat(b.latitude), 2) + Math.pow(longitude - parseFloat(b.longitude), 2));
      return distA - distB;
    });
  }

  async getSponsoredBars(): Promise<Bar[]> {
    return Array.from(this.bars.values()).filter(bar => bar.isSponsored);
  }

  async searchBars(query: string, latitude?: number, longitude?: number): Promise<Bar[]> {
    const allBars = Array.from(this.bars.values());
    const searchTerm = query.toLowerCase();
    
    let filteredBars = allBars.filter(bar => 
      bar.name.toLowerCase().includes(searchTerm) ||
      bar.type.toLowerCase().includes(searchTerm) ||
      bar.address.toLowerCase().includes(searchTerm) ||
      (bar.features as string[]).some(feature => feature.toLowerCase().includes(searchTerm))
    );

    // If location provided, sort by distance
    if (latitude && longitude) {
      filteredBars = filteredBars.sort((a, b) => {
        const distA = Math.sqrt(Math.pow(latitude - parseFloat(a.latitude), 2) + Math.pow(longitude - parseFloat(a.longitude), 2));
        const distB = Math.sqrt(Math.pow(latitude - parseFloat(b.latitude), 2) + Math.pow(longitude - parseFloat(b.longitude), 2));
        return distA - distB;
      });
    }

    return filteredBars;
  }

  // User methods (keeping existing interface)
  async getUser(id: number): Promise<any> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
