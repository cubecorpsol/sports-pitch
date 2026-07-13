export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL?.replace(/\/api\/bookings\/?$/, '') ??
  'https://sports-pitch.onrender.com';

export const BOOKING_API_URL = `${API_BASE_URL}/api/bookings`;

export function toBackendSport(sport: string) {
  if (sport.includes('Box Cricket')) return 'Box Cricket';
  if (sport.includes('Cricket')) return 'Cricket';
  if (sport.includes('Football')) return 'Football';
  if (sport.includes('Badminton')) return 'Badminton';
  if (sport.includes('Karate')) return 'Karate';
  if (sport.includes('Kabaddi')) return 'Kabaddi';
  return sport;
}
