import { ItemDefinition, Participant } from '../types';

export const PARTICIPANTS_LIST: string[] = [
  'Cesar',
  'Fernando',
  'Lipzi',
  'Daniela',
  'Kristel',
  'Merlin',
  'Anamy',
  'Cesia',
  'Fanny',
  'Kenia',
  'Osman',
  'Leydi',
  'Heydi'
];

export const ITEMS_CATALOG: ItemDefinition[] = [
  {
    id: 'chimol',
    name: 'Chimol',
    totalSlots: 2,
    emoji: '🍅',
    color: '#EF4444', // Red
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    description: 'Tomates picados, cebolla, cilantro y limón fresco.'
  },
  {
    id: 'tortillas',
    name: 'Tortillas',
    totalSlots: 1,
    emoji: '🫓',
    color: '#F59E0B', // Amber
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Tortillitas calientes para acompañar la carne.'
  },
  {
    id: 'plastico',
    name: 'Plástico',
    totalSlots: 1,
    emoji: '🍽️',
    color: '#3B82F6', // Blue
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Platos desechables, vasos, servilletas y cubiertos.'
  },
  {
    id: 'fresco',
    name: 'Fresco',
    totalSlots: 2,
    emoji: '🥤',
    color: '#10B981', // Emerald
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Bebidas refrescantes de 2L / 3L bien heladas.'
  },
  {
    id: 'queso_crema',
    name: 'Queso crema',
    totalSlots: 2,
    emoji: '🧀',
    color: '#EC4899', // Pink
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
    description: 'Queso crema y mantequilla para el sabor tradicional.'
  },
  {
    id: 'boquitas',
    name: 'Boquitas',
    totalSlots: 4,
    emoji: '🍿',
    color: '#8B5CF6', // Purple
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Snacks, chips, platanitos o tajaditas para picar.'
  },
  {
    id: 'frijoles',
    name: 'Frijoles',
    totalSlots: 1,
    emoji: '🍲',
    color: '#92400E', // Brown
    badgeColor: 'bg-amber-950/10 text-amber-900 border-amber-300',
    description: 'Frijolitos fritos bien sazonados.'
  }
];

export const FRESCO_OPTIONS = [
  { id: 'coca', name: 'Coca-Cola', icon: '🔴', desc: 'Sabor clásico original 3L' },
  { id: 'pepsi', name: 'Pepsi', icon: '🔵', desc: 'Pepsi fría refrescante 3L' },
  { id: 'sabores', name: 'Sabores (Mirinda/Fresca)', icon: '🟠', desc: 'Uva, Naranja, Toronja o Banana 3L' }
];

// 13 curated celebratory / coworker memories placeholder photos with fallback to /fotos/foto{N}.jpg
export const DEMO_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1528605248659-1440064c24e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
];

export function getInitialParticipants(): Participant[] {
  return PARTICIPANTS_LIST.map((name, index) => ({
    id: `p-${index + 1}`,
    name,
    hasPlayed: false,
    photoIndex: index + 1
  }));
}
