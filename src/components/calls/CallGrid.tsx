import type { ConversationState } from '@/lib/types';
import { CallCard } from '@/components/calls/CallCard';

interface CallGridProps { calls: ConversationState[]; }
export function CallGrid({ calls }: CallGridProps) {
  return <div className="grid gap-6 lg:grid-cols-3">{calls.map((call) => <CallCard key={call.id} companyName={call.vendor.vendor_name} companyStyle={call.vendor.vendor_style} status={call.status === 'initiated' ? 'pending' : call.status} quote={call.quote} error={call.error} />)}</div>;
}
