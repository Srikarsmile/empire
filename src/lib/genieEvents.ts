export const GENIE_PROMPT_EVENT = 'genie:prompt';
export const GENIE_APPLY_FILTERS_EVENT = 'genie:apply-filters';

export interface GeniePromptDetail {
  prompt: string;
  source?: 'hero' | 'sticky' | 'panel' | 'chip';
}

export interface GenieApplyFiltersDetail {
  searchQuery?: string;
  maxPrice?: number;
  selectedAmenities?: string[];
  sortBy?: 'recommended' | 'price-asc' | 'price-desc' | 'rating-desc';
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  scrollToResults?: boolean;
}
