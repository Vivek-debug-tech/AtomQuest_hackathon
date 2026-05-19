import type { NotificationEvent } from "@/lib/notifications";

export interface IntegrationDeliveryResult {
  delivered: boolean;
  provider: string;
  reason?: string;
}

export interface IntegrationAdapter {
  key: string;
  channel: "email" | "teams";
  enabled: boolean;
  dispatch: (event: NotificationEvent) => Promise<IntegrationDeliveryResult>;
}

async function postToWebhook(url: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.ok;
}

const emailWebhook = process.env.EMAIL_PROVIDER_WEBHOOK_URL;
const teamsWebhook = process.env.TEAMS_PROVIDER_WEBHOOK_URL;

export const integrationAdapters: IntegrationAdapter[] = [
  {
    key: "email",
    channel: "email",
    enabled: Boolean(emailWebhook),
    dispatch: async (event) => {
      if (!emailWebhook) {
        return {
          delivered: false,
          provider: "email-simulated",
          reason: "EMAIL_PROVIDER_WEBHOOK_URL is not configured",
        };
      }

      const delivered = await postToWebhook(emailWebhook, {
        recipient: event.recipient,
        subject: event.subject,
        message: event.message,
        deepLink: event.deepLink,
      });

      return {
        delivered,
        provider: "email-webhook",
        reason: delivered ? undefined : "Email webhook returned non-2xx",
      };
    },
  },
  {
    key: "teams",
    channel: "teams",
    enabled: Boolean(teamsWebhook),
    dispatch: async (event) => {
      if (!teamsWebhook) {
        return {
          delivered: false,
          provider: "teams-simulated",
          reason: "TEAMS_PROVIDER_WEBHOOK_URL is not configured",
        };
      }

      const delivered = await postToWebhook(teamsWebhook, {
        title: event.subject,
        text: event.message,
        recipient: event.recipient,
        deepLink: event.deepLink,
      });

      return {
        delivered,
        provider: "teams-webhook",
        reason: delivered ? undefined : "Teams webhook returned non-2xx",
      };
    },
  },
];

export async function dispatchIntegrationEvent(event: NotificationEvent) {
  const adapter = integrationAdapters.find((item) => item.channel === event.channel);
  if (!adapter) {
    return {
      delivered: false,
      provider: "none",
      reason: `No adapter registered for ${event.channel}`,
    };
  }

  try {
    return await adapter.dispatch(event);
  } catch (error) {
    return {
      delivered: false,
      provider: adapter.key,
      reason: error instanceof Error ? error.message : "Adapter dispatch failed",
    };
  }
}

export function getIntegrationAdapterStatus() {
  return integrationAdapters.map((adapter) => ({
    key: adapter.key,
    channel: adapter.channel,
    enabled: adapter.enabled,
  }));
}
