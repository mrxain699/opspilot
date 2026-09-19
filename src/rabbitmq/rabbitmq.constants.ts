export const RABBITMQ_EXCHANGES = {
  EVENTS: 'opspilot_events',
  DLX: 'opspilot_dlx',
} as const;

export const RABBITMQ_QUEUES = {
  INCIDENT: 'opspilot_incident',
  INCIDENT_RETRY: 'opspilot_incident_retry',
  INCIDENT_DLQ: 'opspilot_incident_dlq',

  // AI: 'opspilot_ai',
  // AI_RETRY: 'opspilot_ai_retry',
  // AI_DLQ: 'opspilot_ai_dlq',

  // AUDIT: 'opspilot_audit',
  // AUDIT_RETRY: 'opspilot_audit_retry',
  // AUDIT_DLQ: 'opspilot_audit_dlq',
} as const;

export const RABBITMQ_ROUTING_KEYS = {
  INCIDENT_CREATED: 'incident.created',
  INCIDENT_UPDATED: 'incident.updated',
  INCIDENT_RESOLVED: 'incident.resolved',
  INCIDENT_DLQ: 'incident.dlq',

  // AI_ANALYSIS_REQUESTED: 'ai.analysis.requested',
  // AI_ANALYSIS_COMPLETED: 'ai.analysis.completed',

  // AUDIT_INCIDENT_CREATED: 'audit.incident.created',
  // AUDIT_INCIDENT_UPDATED: 'audit.incident.updated',
} as const;

export const RABBITMQ_RETRY = {
  MAX_ATTEMPTS: 3,
  DELAY_MS: 5000,
} as const;
