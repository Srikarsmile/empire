export interface DateRange {
  start: string;
  end: string;
}

export interface ReviewItem {
  id: string;
  guestName: string;
  reviewerEmail?: string;
  rating: number;
  date: string;
  comment: string;
  photos: string[];
  hostResponse?: {
    hostName: string;
    date: string;
    message: string;
  };
}

export interface VehicleMeta {
  rating: number;
  reviewCount: number;
  minNights: number;
  bookedRanges: DateRange[];
  reviews: ReviewItem[];
}

const vehicleMeta: Record<string, VehicleMeta> = {
  'prop-1': {
    rating: 4.96,
    reviewCount: 84,
    minNights: 2,
    bookedRanges: [
      { start: '2026-03-12', end: '2026-03-15' },
      { start: '2026-03-23', end: '2026-03-27' },
      { start: '2026-04-11', end: '2026-04-14' },
    ],
    reviews: [
      {
        id: 'r-101',
        guestName: 'Daniel P.',
        rating: 5,
        date: '2026-02-18',
        comment: 'The Wrangler was spotless, pickup at POP was on time, and it handled the hills above Sosua easily.',
        photos: [
          'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'
        ],
        hostResponse: {
          hostName: 'Empire Cars',
          date: '2026-02-19',
          message: 'Appreciate it, Daniel. Glad the airport handoff and 4x4 setup worked well for your trip.'
        }
      },
      {
        id: 'r-102',
        guestName: 'Mia R.',
        rating: 5,
        date: '2026-01-29',
        comment: 'Exactly the type of island Jeep we wanted. Fast replies and no surprise fees at return.',
        photos: ['https://images.unsplash.com/photo-1494905998402-395d579af36f?q=80&w=800&auto=format&fit=crop']
      }
    ]
  },
  'prop-2': {
    rating: 4.82,
    reviewCount: 111,
    minNights: 1,
    bookedRanges: [
      { start: '2026-03-10', end: '2026-03-12' },
      { start: '2026-03-19', end: '2026-03-22' },
      { start: '2026-04-05', end: '2026-04-08' },
    ],
    reviews: [
      {
        id: 'r-201',
        guestName: 'Alicia W.',
        rating: 5,
        date: '2026-02-24',
        comment: 'Perfect budget car for airport to Sosua and back. Clean, cold A/C, and very easy handoff.',
        photos: ['https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=800&auto=format&fit=crop']
      },
      {
        id: 'r-202',
        guestName: 'Trevor H.',
        rating: 4,
        date: '2026-01-21',
        comment: 'Simple process and good fuel economy. Best option if you want a practical rental and quick booking.',
        photos: ['https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=800&auto=format&fit=crop'],
        hostResponse: {
          hostName: 'Empire Cars',
          date: '2026-01-22',
          message: 'Thanks Trevor. We built this option for exactly that kind of easy airport run.'
        }
      }
    ]
  },
  'prop-3': {
    rating: 4.9,
    reviewCount: 73,
    minNights: 2,
    bookedRanges: [
      { start: '2026-03-14', end: '2026-03-17' },
      { start: '2026-03-29', end: '2026-04-01' },
      { start: '2026-04-18', end: '2026-04-21' },
    ],
    reviews: [
      {
        id: 'r-301',
        guestName: 'Chris L.',
        rating: 5,
        date: '2026-02-12',
        comment: 'Good luggage room, smooth ride, and Empire arranged the child seat before we landed.',
        photos: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop']
      },
      {
        id: 'r-302',
        guestName: 'Natalie S.',
        rating: 5,
        date: '2026-01-14',
        comment: 'This was the best middle ground between a compact and a Jeep. Great for family beach days.',
        photos: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=800&auto=format&fit=crop']
      }
    ]
  },
  'prop-4': {
    rating: 4.94,
    reviewCount: 49,
    minNights: 2,
    bookedRanges: [
      { start: '2026-03-16', end: '2026-03-18' },
      { start: '2026-03-25', end: '2026-03-29' },
      { start: '2026-04-09', end: '2026-04-13' },
    ],
    reviews: [
      {
        id: 'r-401',
        guestName: 'Sandra K.',
        rating: 5,
        date: '2026-02-15',
        comment: 'We had eight people plus boards and luggage, and the van pickup made the whole arrival painless.',
        photos: ['https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?q=80&w=800&auto=format&fit=crop'],
        hostResponse: {
          hostName: 'Empire Cars',
          date: '2026-02-16',
          message: 'Thanks Sandra. Group arrivals are where the Hiace really saves time.'
        }
      },
      {
        id: 'r-402',
        guestName: 'Luis G.',
        rating: 5,
        date: '2026-01-28',
        comment: 'Clean van, professional driver option, and enough room for the whole family. Strong service.',
        photos: ['https://images.unsplash.com/photo-1617469767053-d3b523a0b982?q=80&w=800&auto=format&fit=crop']
      }
    ]
  },
  'prop-5': {
    rating: 4.88,
    reviewCount: 58,
    minNights: 2,
    bookedRanges: [
      { start: '2026-03-11', end: '2026-03-13' },
      { start: '2026-03-21', end: '2026-03-24' },
      { start: '2026-04-15', end: '2026-04-18' },
    ],
    reviews: [
      {
        id: 'r-501',
        guestName: 'Jordan B.',
        rating: 5,
        date: '2026-02-08',
        comment: 'Booked it for a weekend birthday trip and the handoff looked premium from the first minute.',
        photos: ['https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?q=80&w=800&auto=format&fit=crop']
      },
      {
        id: 'r-502',
        guestName: 'Eva N.',
        rating: 4,
        date: '2026-01-19',
        comment: 'Fun car, very clean interior, and easy return at the airport before our flight.',
        photos: ['https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=800&auto=format&fit=crop']
      }
    ]
  }
};

export default vehicleMeta;
