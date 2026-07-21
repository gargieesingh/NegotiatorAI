export interface WeddingEvent {
  name: string;
  date?: string;
  coverage_hours: number;
}

export interface WeddingVenue {
  name: string;
  city: string;
  address?: string;
}

export interface WeddingPhotoJobSpec {
  id: string;
  created_at: string;
  vertical: 'wedding_photography';
  wedding_date: string;
  venue: WeddingVenue;
  events: WeddingEvent[];
  coverage_type: 'photography_only' | 'photography_plus_videography';
  drone_coverage_required: boolean;
  albums_required: boolean;
  special_requests: string[];
  intake_method: 'voice' | 'document' | 'combined';
  confirmed_by_user: boolean;
  confirmed_at: string;
  spec_hash: string;
}

export type JobSpec = WeddingPhotoJobSpec;
export type CallJobSpec = JobSpec | import('@/lib/verticals').GeneralJobSpec;
export type CompanyStyle = 'premium_negotiable' | 'lowball_upseller' | 'transparent_fair';
export type CallOutcome = 'quote_received' | 'callback_commitment' | 'documented_decline';

export interface QuoteLineItem { name: string; amount: number; }

export interface WeddingPhotoQuoteDetails {
  base_coverage: number;
  additional_event_coverage: number;
  videography: number;
  drone_coverage: number;
  cinematic_film: number;
  highlight_reel: number;
  albums: number;
  travel: number;
  accommodation: number;
  taxes: number;
  deposit: number;
  overtime_rate_per_hour: number;
  other_fees: QuoteLineItem[];
  total: number;
  binding: boolean;
  valid_until: string;
}

export interface ConversationTurn {
  speaker: 'negotiator' | 'company';
  text: string;
  timestamp: string;
  is_key_moment: boolean;
}

export interface Quote {
  quote_id: string;
  company_name: string;
  company_style: CompanyStyle;
  call_timestamp: string;
  call_duration_seconds: number;
  outcome: CallOutcome;
  quote: WeddingPhotoQuoteDetails;
  included_services: string[];
  excluded_services: string[];
  red_flags: string[];
  transcript: ConversationTurn[];
  recording_url?: string;
  price_changed_during_call: boolean;
  initial_price: number;
  final_price: number;
}

export interface DemoVendorParticipant {
  id: string;
  vendor_name: string;
  vendor_style: CompanyStyle;
  phone_number: string;
  consent_recording: boolean;
}

export interface NegotiationResult {
  negotiation_id: string;
  target_company: string;
  strategy_used: string;
  competing_quote_cited: { company: string; amount: number; binding: boolean };
  initial_target_price: number;
  final_target_price: number;
  price_changed: boolean;
  savings_achieved: number;
  transcript: ConversationTurn[];
  outcome: 'price_reduced' | 'held_firm' | 'declined_further';
}

export interface ConversationState {
  id: string;
  vendor: DemoVendorParticipant;
  status: 'initiated' | 'calling' | 'processing' | 'complete' | 'declined' | 'no_answer' | 'error';
  job_spec: CallJobSpec;
  mode: 'quote' | 'negotiate';
  leverage?: { company_name: string; amount: number; binding: boolean };
  started_at: string;
  completed_at?: string;
  quote?: Quote;
  transcript?: ConversationTurn[];
  error?: string;
  call_sid?: string;
  elevenlabs_conversation_id?: string;
}

export interface RankedQuote extends Quote { rank: number; recommended: boolean; rank_reasoning: string; }

export interface Report {
  generated_at: string;
  summary: { companies_called: number; quotes_received: number; negotiation_savings: number; price_range: { low: number; high: number } };
  ranked_quotes: RankedQuote[];
  negotiation_summary: string;
  recommendation: { company: string; total: number; binding: boolean; reason: string; evidence: string[] };
  red_flags_found: Array<{ company: string; flag: string; severity: 'warning' | 'danger' }>;
}

export interface NegotiationStrategy {
  target_company: string;
  leverage_company: string;
  leverage_amount: number;
  leverage_binding: boolean;
  approach: string;
}

export interface ExtractionEvidence { field: string; source_text: string; page?: number; }
export interface DocumentParseResponse {
  success: true;
  job_spec: Partial<JobSpec>;
  confidence: 'high' | 'medium' | 'low';
  missing_fields: string[];
  extraction_evidence: ExtractionEvidence[];
}
