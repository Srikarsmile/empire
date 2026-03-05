export interface DateRange {
  start: string;
  end: string;
}

export interface ReviewItem {
  id: string;
  guestName: string;
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

export interface PropertyMeta {
  rating: number;
  reviewCount: number;
  minNights: number;
  bookedRanges: DateRange[];
  reviews: ReviewItem[];
}

const propertyMeta: Record<string, PropertyMeta> = {
  'prop-1': {
    rating: 4.92,
    reviewCount: 126,
    minNights: 3,
    bookedRanges: [
      { start: '2026-03-11', end: '2026-03-15' },
      { start: '2026-03-24', end: '2026-03-29' },
      { start: '2026-04-12', end: '2026-04-16' },
      { start: '2026-05-02', end: '2026-05-07' },
    ],
    reviews: [
      {
        id: 'r-101',
        guestName: 'Sofia G.',
        rating: 5,
        date: '2026-02-10',
        comment:
          'The rooftop at sunset is unreal. Check-in was frictionless and the apartment looked exactly like the photos.',
        photos: ['/images/properties/prop-1/image_14.jpg', '/images/properties/prop-1/image_30.jpg'],
        hostResponse: {
          hostName: 'Empire Team',
          date: '2026-02-11',
          message: 'Appreciate the review, Sofia. We are glad you enjoyed the rooftop evenings.',
        },
      },
      {
        id: 'r-102',
        guestName: 'Marcus T.',
        rating: 5,
        date: '2026-01-18',
        comment:
          'Fast WiFi, quiet nights, and the best equipped kitchen we have had in Sosua. Would stay again.',
        photos: ['/images/properties/prop-1/image_21.png'],
      },
      {
        id: 'r-103',
        guestName: 'Noa R.',
        rating: 4,
        date: '2025-12-29',
        comment:
          'Great apartment and support was responsive. The terrace and pool area were spotless.',
        photos: ['/images/properties/prop-1/image_35.jpg'],
      },
    ],
  },
  'prop-2': {
    rating: 4.74,
    reviewCount: 89,
    minNights: 2,
    bookedRanges: [
      { start: '2026-03-08', end: '2026-03-10' },
      { start: '2026-03-18', end: '2026-03-21' },
      { start: '2026-04-06', end: '2026-04-09' },
    ],
    reviews: [
      {
        id: 'r-201',
        guestName: 'Eleanor C.',
        rating: 5,
        date: '2026-02-21',
        comment:
          'Perfect for airport access and still close to restaurants. Booking and support were very smooth.',
        photos: ['/images/properties/prop-2/image_20.jpg'],
      },
      {
        id: 'r-202',
        guestName: 'Haruto M.',
        rating: 4,
        date: '2026-01-26',
        comment: 'Clean and practical place. Exactly what we needed for a short stay.',
        photos: ['/images/properties/prop-2/image_24.jpg'],
        hostResponse: {
          hostName: 'Empire Team',
          date: '2026-01-27',
          message: 'Thanks Haruto, happy to hear the location worked well for your trip.',
        },
      },
    ],
  },
  'prop-3': {
    rating: 4.68,
    reviewCount: 64,
    minNights: 2,
    bookedRanges: [
      { start: '2026-03-14', end: '2026-03-17' },
      { start: '2026-03-27', end: '2026-03-30' },
      { start: '2026-04-20', end: '2026-04-24' },
    ],
    reviews: [
      {
        id: 'r-301',
        guestName: 'Lina B.',
        rating: 5,
        date: '2026-02-05',
        comment: 'Reliable power and internet, and the parking was secure. Strong value.',
        photos: ['/images/properties/prop-3/image_29.jpg'],
      },
      {
        id: 'r-302',
        guestName: 'Diego F.',
        rating: 4,
        date: '2026-01-11',
        comment: 'Convenient and clean. Host was responsive to questions before arrival.',
        photos: ['/images/properties/prop-3/image_33.jpg'],
      },
    ],
  },
  'prop-4': {
    rating: 4.95,
    reviewCount: 142,
    minNights: 4,
    bookedRanges: [
      { start: '2026-03-09', end: '2026-03-13' },
      { start: '2026-03-22', end: '2026-03-27' },
      { start: '2026-04-14', end: '2026-04-18' },
    ],
    reviews: [
      {
        id: 'r-401',
        guestName: 'Amelia P.',
        rating: 5,
        date: '2026-02-14',
        comment: 'Huge apartment with great design touches. Felt premium from check-in to checkout.',
        photos: ['/images/properties/prop-4/image_54.jpg', '/images/properties/prop-4/image_43.png'],
        hostResponse: {
          hostName: 'Empire Team',
          date: '2026-02-15',
          message: 'Thanks Amelia. We are happy the space and process met your expectations.',
        },
      },
      {
        id: 'r-402',
        guestName: 'Karan S.',
        rating: 5,
        date: '2026-01-30',
        comment: 'Great for family stays. Quiet area and spotless interiors.',
        photos: ['/images/properties/prop-4/image_60.jpg'],
      },
    ],
  },
  'prop-5': {
    rating: 4.66,
    reviewCount: 51,
    minNights: 2,
    bookedRanges: [
      { start: '2026-03-07', end: '2026-03-09' },
      { start: '2026-03-16', end: '2026-03-20' },
      { start: '2026-04-10', end: '2026-04-12' },
    ],
    reviews: [
      {
        id: 'r-501',
        guestName: 'Nadia O.',
        rating: 5,
        date: '2026-02-03',
        comment: 'Excellent value and very smooth communication. Parking and WiFi were perfect.',
        photos: ['/images/properties/prop-5/image_33.jpg'],
      },
      {
        id: 'r-502',
        guestName: 'Jonas L.',
        rating: 4,
        date: '2026-01-17',
        comment: 'Comfortable apartment and easy self check-in. Would return for another short trip.',
        photos: ['/images/properties/prop-5/image_36.jpg'],
      },
    ],
  },
};

export default propertyMeta;
