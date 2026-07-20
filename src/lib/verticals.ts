export type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'select';

export interface VerticalField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  help?: string;
  options?: string[];
}

export interface QuoteLineItemConfig {
  key: string;
  label: string;
  required: boolean;
}

export interface VerticalConfig {
  id: string;
  displayName: string;
  summary: string;
  version: string;
  intakeFields: VerticalField[];
  quoteLineItems: QuoteLineItemConfig[];
  discoveryQueries: string[];
  redFlagRules: string[];
  negotiationLevers: string[];
}

export interface GeneralJobSpec {
  id: string;
  vertical: string;
  config: VerticalConfig;
  data: Record<string, string | number | boolean>;
  confirmed_by_user: boolean;
  confirmed_at?: string;
  spec_hash: string;
}

const commonQuoteItems: QuoteLineItemConfig[] = [
  { key: 'base_price', label: 'Base service price', required: true },
  { key: 'travel_or_delivery', label: 'Travel or delivery', required: false },
  { key: 'taxes_and_fees', label: 'Taxes and mandatory fees', required: true },
  { key: 'deposit', label: 'Deposit / advance', required: false },
  { key: 'total', label: 'All-in quoted total', required: true },
];

export const verticalRegistry: Record<string, VerticalConfig> = {
  wedding_photography: {
    id: 'wedding_photography', displayName: 'Wedding photography', version: '1.0.0',
    summary: 'Compare itemized photography packages for a wedding.',
    intakeFields: [
      { key: 'wedding_date', label: 'Wedding date', type: 'text', required: true },
      { key: 'venue_city', label: 'Venue and city', type: 'text', required: true },
      { key: 'events_hours', label: 'Events and coverage hours', type: 'textarea', required: true, help: 'Example: Mehendi 2h, Wedding ceremony 5h, Reception 3h' },
      { key: 'coverage_type', label: 'Coverage type', type: 'select', required: true, options: ['Photography only', 'Photography + videography'] },
      { key: 'drone_coverage', label: 'Drone coverage required', type: 'boolean', required: true },
      { key: 'albums', label: 'Albums required', type: 'boolean', required: true },
      { key: 'special_requests', label: 'Special requests', type: 'textarea', required: false },
    ],
    quoteLineItems: [...commonQuoteItems, { key: 'videography', label: 'Videography', required: false }, { key: 'drone', label: 'Drone coverage', required: false }, { key: 'albums', label: 'Albums', required: false }, { key: 'overtime', label: 'Overtime rate', required: true }],
    discoveryQueries: ['wedding photographers near {{venue_city}}'],
    redFlagRules: ['Flag a quote 30% or more below the comparable median.', 'Flag missing coverage hours, taxes, validity, or binding status.'],
    negotiationLevers: ['Price match a verified comparable quote.', 'Request an included album, engagement shoot, or waived travel fee.'],
  },
  moving: {
    id: 'moving', displayName: 'Local moving', version: '1.0.0',
    summary: 'Compare comparable, itemized local moving estimates.',
    intakeFields: [
      { key: 'move_date', label: 'Move date', type: 'text', required: true },
      { key: 'origin', label: 'Origin address / city', type: 'text', required: true },
      { key: 'destination', label: 'Destination address / city', type: 'text', required: true },
      { key: 'home_size', label: 'Home size', type: 'select', required: true, options: ['Studio', '1 bedroom', '2 bedrooms', '3 bedrooms', '4+ bedrooms'] },
      { key: 'stairs_elevator', label: 'Stairs or elevator details', type: 'textarea', required: true },
      { key: 'large_items', label: 'Large / specialty items', type: 'textarea', required: false },
      { key: 'packing_required', label: 'Packing required', type: 'boolean', required: true },
    ],
    quoteLineItems: [...commonQuoteItems, { key: 'hourly_rate', label: 'Hourly rate', required: true }, { key: 'stairs_fee', label: 'Stairs fee', required: false }, { key: 'long_carry_fee', label: 'Long-carry fee', required: false }, { key: 'packing', label: 'Packing', required: false }],
    discoveryQueries: ['moving companies near {{origin}}', 'local movers near {{origin}}'],
    redFlagRules: ['Flag a quote 30% or more below the comparable median.', 'Flag sight-unseen estimates, missing stairs/long-carry fees, or non-binding quotes.'],
    negotiationLevers: ['Request a binding not-to-exceed estimate.', 'Ask to remove a fee using a verified comparable quote.'],
  },
  auto_repair: {
    id: 'auto_repair', displayName: 'Auto repair', version: '1.0.0',
    summary: 'Compare itemized repair estimates for the same vehicle and fault.',
    intakeFields: [
      { key: 'vehicle', label: 'Vehicle year, make, and model', type: 'text', required: true },
      { key: 'repair_location', label: 'Repair city', type: 'text', required: true },
      { key: 'issue', label: 'Problem / diagnostic symptoms', type: 'textarea', required: true },
      { key: 'damage_or_codes', label: 'Damage details or diagnostic codes', type: 'textarea', required: false },
      { key: 'parts_preference', label: 'Parts preference', type: 'select', required: true, options: ['Shop recommendation', 'OEM only', 'Aftermarket acceptable'] },
      { key: 'insurance', label: 'Insurance claim involved', type: 'boolean', required: true },
    ],
    quoteLineItems: [...commonQuoteItems, { key: 'parts', label: 'Parts', required: true }, { key: 'labor', label: 'Labor', required: true }, { key: 'diagnostic', label: 'Diagnostic fee', required: false }, { key: 'warranty', label: 'Warranty terms', required: true }],
    discoveryQueries: ['auto repair shops near {{repair_location}}'],
    redFlagRules: ['Flag missing labor hours, parts source, warranty, or diagnostic fee.', 'Flag a total 30% below comparable estimates.'],
    negotiationLevers: ['Request a parts/labor breakdown.', 'Ask for a labor-rate match or included diagnostic fee.'],
  },
  contractor_bid: {
    id: 'contractor_bid', displayName: 'Home contractor bid', version: '1.0.0',
    summary: 'Compare scope-matched contractor bids.',
    intakeFields: [
      { key: 'project_type', label: 'Project type', type: 'text', required: true },
      { key: 'project_location', label: 'Project city', type: 'text', required: true },
      { key: 'scope_of_work', label: 'Scope of work', type: 'textarea', required: true },
      { key: 'property_details', label: 'Property details', type: 'textarea', required: true },
      { key: 'target_timeline', label: 'Target timeline', type: 'text', required: false },
      { key: 'permits_known', label: 'Permits already known/obtained', type: 'boolean', required: true },
    ],
    quoteLineItems: [...commonQuoteItems, { key: 'materials', label: 'Materials', required: true }, { key: 'labor', label: 'Labor', required: true }, { key: 'permits', label: 'Permits', required: false }, { key: 'change_order_terms', label: 'Change-order terms', required: true }],
    discoveryQueries: ['{{project_type}} contractors near {{project_location}}'],
    redFlagRules: ['Flag missing scope, permits, exclusions, timeline, or change-order terms.', 'Flag a total 30% below comparable bids.'],
    negotiationLevers: ['Request an itemized scope match.', 'Use a verified bid to negotiate price or included materials.'],
  },
};

export function getVerticalConfig(id: string): VerticalConfig | undefined {
  return verticalRegistry[id];
}

export function inferVertical(description: string): VerticalConfig {
  const text = description.toLowerCase();
  if (/move|mover|moving|relocat/.test(text)) return verticalRegistry.moving;
  if (/car|vehicle|auto|mechanic|repair|body shop/.test(text)) return verticalRegistry.auto_repair;
  if (/contractor|renovat|plumb|roof|kitchen|remodel/.test(text)) return verticalRegistry.contractor_bid;
  if (/wedding|photograph|bridal|reception|mehendi/.test(text)) return verticalRegistry.wedding_photography;
  return buildJobScopedConfig({
    id: 'general_service', displayName: 'General service quote', summary: 'Compare itemized quotes for the confirmed service scope.',
    intakeFields: [
      { key: 'service_location', label: 'Service city / location', type: 'text', required: true },
      { key: 'service_description', label: 'What needs to be done?', type: 'textarea', required: true },
      { key: 'desired_timing', label: 'Desired date or timeline', type: 'text', required: true },
      { key: 'special_requirements', label: 'Special requirements', type: 'textarea', required: false },
    ],
    discoveryQuery: '{{service_description}} providers near {{service_location}}',
  });
}

export function buildJobScopedConfig(input: { id: string; displayName: string; summary: string; intakeFields: VerticalField[]; discoveryQuery: string; quoteLineItems?: QuoteLineItemConfig[] }): VerticalConfig {
  return {
    id: input.id.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'general_service',
    displayName: input.displayName.slice(0, 80), summary: input.summary.slice(0, 280), version: `job_scoped_${new Date().toISOString().slice(0, 10)}`,
    intakeFields: input.intakeFields.slice(0, 15), quoteLineItems: input.quoteLineItems?.slice(0, 20) ?? commonQuoteItems,
    discoveryQueries: [input.discoveryQuery.slice(0, 180)], redFlagRules: ['Flag a quote 30% or more below the comparable median.', 'Flag missing mandatory fees, validity, binding status, or requested scope.'],
    negotiationLevers: ['Use only a verified comparable quote to request a price match or included service.'],
  };
}

export function validateConfig(config: VerticalConfig): VerticalConfig | null {
  if (!/^[a-z][a-z0-9_]{2,48}$/.test(config.id) || !config.displayName || config.intakeFields.length < 3 || config.intakeFields.length > 15) return null;
  const fields = config.intakeFields.filter((field) => /^[a-z][a-z0-9_]{1,48}$/.test(field.key) && field.label.length > 0 && ['text', 'textarea', 'number', 'boolean', 'select'].includes(field.type));
  if (fields.length !== config.intakeFields.length || new Set(fields.map((field) => field.key)).size !== fields.length) return null;
  return { ...config, intakeFields: fields, quoteLineItems: config.quoteLineItems.slice(0, 20), discoveryQueries: config.discoveryQueries.slice(0, 4), redFlagRules: config.redFlagRules.slice(0, 8), negotiationLevers: config.negotiationLevers.slice(0, 8) };
}
