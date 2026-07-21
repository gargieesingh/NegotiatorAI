import { ElevenLabsClient } from 'elevenlabs';
import type { CallJobSpec, ConversationState, DemoVendorParticipant } from '@/lib/types';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export async function placeHumanDemoCall(
  vendor: DemoVendorParticipant,
  jobSpec: CallJobSpec,
  callId: string,
  mode: ConversationState['mode'],
  leverage?: ConversationState['leverage'],
): Promise<{ callSid: string; conversationId?: string }> {
  if (!vendor.consent_recording) throw new Error('Recording consent is required before placing a demo call.');
  if (!vendor.phone_number) throw new Error(`A phone number is required for ${vendor.vendor_name}.`);
  const client = new ElevenLabsClient({ apiKey: required('ELEVENLABS_API_KEY') });
  const response = await client.conversationalAi.twilioOutboundCall({
    agent_id: required('ELEVENLABS_NEGOTIATOR_AGENT_ID'),
    agent_phone_number_id: required('ELEVENLABS_OUTBOUND_PHONE_NUMBER_ID'),
    to_number: vendor.phone_number,
    conversation_initiation_client_data: {
      dynamic_variables: {
        negotiator_call_id: callId,
        vendor_name: vendor.vendor_name,
        wedding_brief: JSON.stringify(jobSpec),
        confirmed_job_spec: JSON.stringify(jobSpec),
        vertical_config: 'config' in jobSpec ? JSON.stringify(jobSpec.config) : 'Use the approved wedding-photography configuration.',
        call_mode: mode,
        competing_quote: leverage ? JSON.stringify(leverage) : 'No competing quote is available for this initial quote-gathering call.',
      },
    },
  });
  if (!response.success || !response.callSid) throw new Error(response.message || 'ElevenLabs did not return an outbound call identifier.');
  const withConversationId = response as typeof response & { conversation_id?: string; conversationId?: string };
  return { callSid: response.callSid, conversationId: withConversationId.conversation_id ?? withConversationId.conversationId };
}
