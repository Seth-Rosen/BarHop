export class GooglePlacesService {
  private placesService: google.maps.places.PlacesService | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private isInitialized = false;

  constructor() {
    this.waitForGoogleMaps();
  }

  private async waitForGoogleMaps() {
    // Wait for Google Maps to load
    let attempts = 0;
    const maxAttempts = 50;
    
    while (!window.google && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (window.google) {
      this.initializeServices();
    }
  }

  private initializeServices() {
    if (typeof window !== 'undefined' && window.google && !this.isInitialized) {
      const div = document.createElement('div');
      this.placesService = new google.maps.places.PlacesService(div);
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.isInitialized = true;
    }
  }

  async getLocationSuggestions(input: string): Promise<google.maps.places.AutocompletePrediction[]> {
    await this.waitForGoogleMaps();
    
    return new Promise((resolve, reject) => {
      if (!this.autocompleteService) {
        reject(new Error('Google Places service not available'));
        return;
      }

      this.autocompleteService.getPlacePredictions(
        {
          input,
          types: ['(cities)'],
          componentRestrictions: { country: 'us' }
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else {
            reject(new Error(`Places service failed: ${status}`));
          }
        }
      );
    });
  }

  async getPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult> {
    await this.waitForGoogleMaps();
    
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('Google Places service not available'));
        return;
      }

      this.placesService.getDetails(
        {
          placeId,
          fields: ['geometry', 'formatted_address', 'name']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            reject(new Error(`Place details failed: ${status}`));
          }
        }
      );
    });
  }

  async searchNearbyBars(latitude: number, longitude: number, radius: number = 5000): Promise<google.maps.places.PlaceResult[]> {
    await this.waitForGoogleMaps();
    
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('Google Places service not available'));
        return;
      }

      const request = {
        location: new google.maps.LatLng(latitude, longitude),
        radius,
        type: 'bar' as google.maps.places.PlaceType
      };

      this.placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Nearby search failed: ${status}`));
        }
      });
    });
  }

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    await this.waitForGoogleMaps();
    
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Maps not available'));
        return;
      }
      
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }
}

export const googlePlacesService = new GooglePlacesService();
