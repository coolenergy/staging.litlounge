export interface Webhook {
  id?: string;
  action?: string;
  streamName?: string;
  category?: string;
  event?: string;
  sessionId?: string;
  timestamp?: number;
  duration?: number;
  clientData?: string;
  serverData?: string;
  platform?: string;
  location?: string;
  participantId?: string;
}
