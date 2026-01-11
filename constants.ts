
import { Attraction } from './types';

export const ATTRACTIONS: Attraction[] = [
  {
    id: 'ORANGUTAN',
    name: 'Orangutan Sanctuary',
    description: 'Observe rescued orangutans in their natural habitat during feeding times.',
    image: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&q=80&w=800',
    externalUrl: 'https://sabahtourism.com/destination/sepilok-orangutan-rehabilitation-centre/',
    prices: { adult: 30, child: 15 }
  },
  {
    id: 'SUNBEAR',
    name: 'Sun Bear Centre',
    description: 'The world’s only sun bear conservation facility, home to the smallest bears.',
    image: 'https://images.unsplash.com/photo-1590273466070-40c466b4432d?auto=format&fit=crop&q=80&w=800',
    externalUrl: 'https://www.bsbcc.org.my/',
    prices: { adult: 30, child: 15 }
  },
  {
    id: 'COMBO',
    name: 'Rainforest Combo',
    description: 'Full experience: Visit both the Orangutan Sanctuary and Sun Bear Centre.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
    externalUrl: 'https://sabahtourism.com/destination/rainforest-discovery-centre-rdc/',
    prices: { adult: 50, child: 25 }
  }
];

export const TIME_SLOTS = [
  '09:00 AM',
  '11:00 AM',
  '02:00 PM',
  '03:30 PM'
];

export const WHATSAPP_NUMBER = '60123109793';
export const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw6BcZL0KDmkwT1U3tPYUJYc8-IwBkHfdiTyoeL6arOc76SBwcufVUt3ecy3brAUb1M/exec';
