import weddingPhotography from '@/config/wedding-photography.json';

export const weddingPhotographyConfig = weddingPhotography;
export const demoVendorRoles = [
  { id: 'premium', vendor_name: 'Apex Premier Provider', vendor_style: 'premium_negotiable' },
  { id: 'flashdeal', vendor_name: 'QuickDeal Express', vendor_style: 'lowball_upseller' },
  { id: 'honest-lens', vendor_name: 'Honest Choice Collective', vendor_style: 'transparent_fair' },
] as const;

export const jobSpecStorageKey = 'negotiator_wedding_photo_job_spec';
export const generalJobStorageKey = 'negotiator_general_job';
export const generalVendorsStorageKey = 'negotiator_general_vendors';
export const quotesStorageKey = 'negotiator_wedding_photo_quotes';
export const negotiationStorageKey = 'negotiator_wedding_photo_negotiation';
