import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { locationSearchSchema } from "@shared/schema";
import { z } from "zod";

async function searchGooglePlaces(latitude: number, longitude: number, radius: number = 5000, maxResults: number = 20) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Google API key not configured");
  }

  console.log(`Searching for bars near ${latitude}, ${longitude} within ${radius}m`);
  
  // Try multiple search strategies
  const searchUrls = [
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=bar&key=${apiKey}`,
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=night_club&key=${apiKey}`,
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=bar&key=${apiKey}`,
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=pub&key=${apiKey}`,
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=restaurant&key=${apiKey}`
  ];
  
  for (const url of searchUrls) {
    try {
      console.log(`Trying search: ${url.split('&key=')[0]}`);
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`Search result status: ${data.status}, results count: ${data.results?.length || 0}`);
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        console.log(`Found ${data.results.length} places`);
        const limitedResults = data.results.slice(0, maxResults);
        return limitedResults.map((place: any) => ({
          placeId: place.place_id,
          name: place.name,
          address: place.vicinity || place.formatted_address || 'Address not available',
          latitude: place.geometry.location.lat.toString(),
          longitude: place.geometry.location.lng.toString(),
          type: place.types?.includes('night_club') ? 'Nightclub' : 
                place.types?.includes('restaurant') ? 'Bar & Restaurant' : 'Bar',
          description: `${place.types?.includes('night_club') ? 'Nightclub' : 'Bar'} • ${place.business_status === 'OPERATIONAL' ? 'Open' : 'Closed'}`,
          rating: place.rating?.toString() || '0.0',
          hours: place.opening_hours?.open_now ? 'Open now' : 'Hours vary',
          phoneNumber: null,
          website: null,
          imageUrl: place.photos?.[0] ? 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}` : 
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          features: place.types?.filter((type: string) => 
            ['bar', 'night_club', 'restaurant', 'food'].includes(type)
          ) || [],
          isSponsored: false,
          promotion: null,
          isOpen: place.business_status === 'OPERATIONAL',
          priceRange: place.price_level ? '$'.repeat(place.price_level) : '$$',
          createdAt: new Date()
        }));
      }
    } catch (error) {
      console.error('Error with search URL:', error);
      continue;
    }
  }
  
  console.log('No results found with any search strategy');
  return []; // Return empty array if no search strategy works
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve configuration including API keys
  app.get("/api/config", (req, res) => {
    res.json({
      googleApiKey: process.env.GOOGLE_API_KEY
    });
  });

  // Get all bars
  app.get("/api/bars", async (req, res) => {
    try {
      const bars = await storage.getAllBars();
      res.json(bars);
    } catch (error) {
      console.error("Error fetching bars:", error);
      res.status(500).json({ error: "Failed to fetch bars" });
    }
  });

  // Get sponsored bars
  app.get("/api/bars/sponsored", async (req, res) => {
    try {
      const sponsoredBars = await storage.getSponsoredBars();
      res.json(sponsoredBars);
    } catch (error) {
      console.error("Error fetching sponsored bars:", error);
      res.status(500).json({ error: "Failed to fetch sponsored bars" });
    }
  });

  // Get nearby bars using Google Places API
  app.get("/api/bars/nearby", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string) || 5000;
      const radiusMeters = Math.min(radius * 1000, 50000); // Convert km to meters, max 50km

      if (isNaN(lat) || isNaN(lng) || isNaN(radiusMeters)) {
        return res.status(400).json({ error: "Invalid coordinates or radius" });
      }

      const nearbyBars = await searchGooglePlaces(lat, lng, radiusMeters, 1);
      res.json(nearbyBars);
    } catch (error) {
      console.error('Error fetching nearby bars:', error);
      // Return empty array instead of error to allow map to show user location
      res.json([]);
    }
  });

  // Search bars using Google Places API
  app.post("/api/bars/search", async (req, res) => {
    try {
      const body = locationSearchSchema.parse(req.body);
      
      const nearbyBars = await searchGooglePlaces(
        body.latitude, 
        body.longitude, 
        body.radius ? body.radius * 1000 : 5000, // Convert km to meters
        20 // maxResults
      );
      
      // Filter results based on query if provided
      let filteredBars = nearbyBars;
      if (body.query && body.query.trim()) {
        const query = body.query.toLowerCase();
        filteredBars = nearbyBars.filter((bar: any) => 
          bar.name.toLowerCase().includes(query) ||
          bar.description?.toLowerCase().includes(query) ||
          bar.address.toLowerCase().includes(query)
        );
      }
      
      res.json(filteredBars);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      console.error("Error searching bars:", error);
      res.status(500).json({ error: "Failed to search bars" });
    }
  });

  // Get detailed bar information with web scraping
  app.get("/api/bars/:placeId/details", async (req, res) => {
    try {
      const { placeId } = req.params;
      const apiKey = process.env.GOOGLE_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "Google API key not configured" });
      }

      // Get comprehensive details from Google Places API
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,user_ratings_total,photos,price_level,types,reviews,business_status&key=${apiKey}`;
      
      const response = await fetch(detailsUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        const details = data.result;
        
        // Parse opening hours into structured format
        const parseOpeningHours = (openingHours: any) => {
          if (!openingHours?.weekday_text) return null;
          
          const hours: {[key: string]: string} = {};
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          
          openingHours.weekday_text.forEach((dayText: string, index: number) => {
            const day = days[index];
            const timeMatch = dayText.match(/: (.+)/);
            hours[day] = timeMatch ? timeMatch[1] : 'Closed';
          });
          
          return hours;
        };

        // Build comprehensive bar object
        const barDetails = {
          placeId: details.place_id,
          name: details.name,
          address: details.formatted_address,
          phoneNumber: details.formatted_phone_number,
          website: details.website,
          rating: details.rating?.toString() || '0.0',
          userRatingsTotal: details.user_ratings_total,
          hours: parseOpeningHours(details.opening_hours),
          photos: details.photos?.slice(0, 5).map((photo: any) => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photo.photo_reference}&key=${apiKey}`
          ) || [],
          priceLevel: details.price_level,
          priceRange: details.price_level ? '$'.repeat(details.price_level) : '$$',
          businessStatus: details.business_status,
          isOpen: details.business_status === 'OPERATIONAL',
          types: details.types || [],
          imageUrl: details.photos?.[0] ? 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${details.photos[0].photo_reference}&key=${apiKey}` : 
            null
        };
        
        res.json(barDetails);
      } else {
        res.status(404).json({ error: "Bar details not found" });
      }
    } catch (error) {
      console.error('Error fetching bar details:', error);
      res.status(500).json({ error: 'Failed to fetch bar details' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}