// Listing type (buy/sell)
export type ListingType = "sell" | "buy";

// Extended listing status with moderation states
export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'flagged';

// Full listing type with moderation fields
export type Listing = {
  id: string;
  createdAt: string;
  type: ListingType;
  product: string;
  title: string;
  quantityKg: number;
  pricePerKg: number;
  region: string;
  city?: string;
  description?: string;
  status: ListingStatus;
  
  // Moderation fields
  moderatedBy?: string;     // Admin user ID who moderated
  moderatedAt?: string;     // Timestamp of moderation
  rejectionReason?: string; // Reason if rejected
  flagCount?: number;       // Number of user reports
  
  // User/contact info
  user?: { id: string; name: string; email?: string | null };
  contactEmail?: string | null;
  contactPhone?: string | null;
  
  // For editing (simple token-based auth)
  secret?: string;
};

// Helper to check if listing is visible to public
export function isListingPublic(listing: Listing): boolean {
  return listing.status === 'approved' || listing.status === 'active' || listing.status === 'completed';
}

// Helper to check if listing needs moderation
export function needsModeration(listing: Listing): boolean {
  return listing.status === 'pending' || listing.status === 'flagged';
}

// Helper to check if listing was rejected
export function isRejected(listing: Listing): boolean {
  return listing.status === 'rejected';
}

