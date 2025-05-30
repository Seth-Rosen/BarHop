export function getClosingTime(hours: {[key: string]: string} | null): string {
  if (!hours) return "Hours unavailable";
  
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[today.getDay()];
  
  const todayHours = hours[todayName];
  if (!todayHours) return "Hours unavailable";
  
  if (todayHours.toLowerCase() === 'closed') {
    return "Closed today";
  }
  
  // Extract closing time from formats like "5:00 PM – 1:00 AM"
  const timeMatch = todayHours.match(/–\s*(.+)$/);
  if (timeMatch) {
    return `Closes ${timeMatch[1]}`;
  }
  
  return todayHours;
}

export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): string {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  if (distance < 1) {
    return `${(distance * 5280).toFixed(0)} ft`;
  } else {
    return `${distance.toFixed(1)} mi`;
  }
}

export function isOpenNow(hours: {[key: string]: string} | null): boolean {
  if (!hours) return false;
  
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
  
  const todayHours = hours[todayName];
  if (!todayHours || todayHours.toLowerCase() === 'closed') {
    return false;
  }
  
  // Parse time ranges like "5:00 PM – 1:00 AM"
  const timeRange = todayHours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*–\s*(\d{1,2}):(\d{2})\s*(AM|PM)/);
  if (!timeRange) return true; // Default to open if we can't parse
  
  const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = timeRange;
  
  let openTime = parseInt(openHour) * 60 + parseInt(openMin);
  let closeTime = parseInt(closeHour) * 60 + parseInt(closeMin);
  
  // Convert to 24-hour format
  if (openPeriod === 'PM' && parseInt(openHour) !== 12) openTime += 12 * 60;
  if (openPeriod === 'AM' && parseInt(openHour) === 12) openTime = parseInt(openMin);
  
  if (closePeriod === 'PM' && parseInt(closeHour) !== 12) closeTime += 12 * 60;
  if (closePeriod === 'AM' && parseInt(closeHour) === 12) closeTime = parseInt(closeMin);
  
  // Handle times that cross midnight
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime <= closeTime;
  }
  
  return currentTime >= openTime && currentTime <= closeTime;
}

export function getNextOpeningTime(hours: {[key: string]: string} | null): string {
  if (!hours) return 'Unknown';
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  
  // Check next 7 days for opening time
  for (let i = 1; i <= 7; i++) {
    const dayIndex = (today + i) % 7;
    const dayName = dayNames[dayIndex];
    const dayHours = hours[dayName];
    
    if (dayHours && dayHours.toLowerCase() !== 'closed') {
      const timeMatch = dayHours.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/);
      if (timeMatch) {
        const openTime = timeMatch[1];
        return i === 1 ? `tomorrow at ${openTime}` : `${dayName} at ${openTime}`;
      }
    }
  }
  
  return 'Unknown';
}

export function getOpenStatusMessage(hours: {[key: string]: string} | null): string {
  if (!hours) return 'Hours unknown';
  
  const isOpen = isOpenNow(hours);
  
  if (isOpen) {
    const closingTime = getClosingTime(hours);
    return closingTime === 'Closed today' ? 'Open' : `Open until ${closingTime.replace('Closes ', '')}`;
  } else {
    const nextOpening = getNextOpeningTime(hours);
    return nextOpening === 'Unknown' ? 'Closed' : `Closed until ${nextOpening}`;
  }
}