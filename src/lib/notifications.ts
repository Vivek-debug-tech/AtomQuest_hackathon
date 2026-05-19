import { randomUUID } from "crypto";

import { dispatchIntegrationEvent } from "@/lib/integration-adapters";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export type NotificationChannel = "email" | "teams";
export type NotificationEventType =
  | "goal_submission"
  | "goal_approval"
  | "goal_rejection"
  | "goal_shared"
  | "checkin_submitted"
  | "checkin_reviewed"
  | "escalation_triggered";

export interface NotificationEvent {
  id: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  message: string;
  deepLink?: string;
  status: "queued" | "sent" | "simulated";
  createdAt: string;
}

type DbNotificationRow = {
  id: string;
  event_type: string;
  channel: string;
  recipient: string;
  subject: string;
  message: string;
  deep_link?: string | null;
  status: string;
  created_at: string;
};

declare global {
  var __goalflowNotifications: NotificationEvent[] | undefined;
}

function getMemoryNotifications() {
  if (!global.__goalflowNotifications) {
    global.__goalflowNotifications = [];
  }
  return global.__goalflowNotifications;
}

function mapNotification(row: DbNotificationRow): NotificationEvent {
  return {
    id: row.id,
    eventType: row.event_type as NotificationEventType,
    channel: row.channel as NotificationChannel,
    recipient: row.recipient,
    subject: row.subject,
    message: row.message,
    deepLink: row.deep_link ?? undefined,
    status: (row.status as NotificationEvent["status"]) ?? "queued",
    createdAt: row.created_at,
  };
}

export function buildGoalDeepLink(goalId: string) {
  return `/goals/${goalId}`;
}

export async function logNotificationEvent(input: {
  eventType: NotificationEventType;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  message: string;
  deepLink?: string;
}) {
  if (!isSupabaseConfigured) {
    const event: NotificationEvent = {
      id: randomUUID(),
      eventType: input.eventType,
      channel: input.channel,
      recipient: input.recipient,
      subject: input.subject,
      message: input.message,
      deepLink: input.deepLink,
      status: "simulated",
      createdAt: new Date().toISOString(),
    };
    const delivery = await dispatchIntegrationEvent(event);
    event.status = delivery.delivered ? "sent" : "simulated";
    getMemoryNotifications().unshift(event);
    return event;
  }

  const supabase = getSupabaseClient({ server: true });
  const { data, error } = await supabase
    .from("notification_events")
    .insert({
      event_type: input.eventType,
      channel: input.channel,
      recipient: input.recipient,
      subject: input.subject,
      message: input.message,
      deep_link: input.deepLink ?? null,
      status: "queued",
    })
    .select("*")
    .single();

  if (error) throw error;
  const mapped = mapNotification(data as DbNotificationRow);
  const delivery = await dispatchIntegrationEvent(mapped);

  const status = delivery.delivered ? "sent" : "simulated";
  const { error: updateError } = await supabase
    .from("notification_events")
    .update({ status })
    .eq("id", mapped.id);

  if (updateError) throw updateError;

  return {
    ...mapped,
    status,
  };
}

export async function fetchNotificationEvents(limit = 50) {
  if (!isSupabaseConfigured) {
    return getMemoryNotifications().slice(0, limit);
  }

  const supabase = getSupabaseClient({ server: true });
  const { data, error } = await supabase
    .from("notification_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data as DbNotificationRow[] | null) ?? []).map(mapNotification);
}

export async function emitGoalSubmissionNotifications(goalId: string, approverRecipient: string) {
  const deepLink = buildGoalDeepLink(goalId);
  await Promise.all([
    logNotificationEvent({
      eventType: "goal_submission",
      channel: "email",
      recipient: approverRecipient,
      subject: "Goal submission awaiting approval",
      message: "A goal sheet was submitted and requires manager review.",
      deepLink,
    }),
    logNotificationEvent({
      eventType: "goal_submission",
      channel: "teams",
      recipient: approverRecipient,
      subject: "Goal approval request",
      message: "Adaptive-card style manager notification simulated for the submitted goal.",
      deepLink,
    }),
  ]);
}

export async function emitApprovalNotifications(goalId: string, recipient: string, approved: boolean) {
  const deepLink = buildGoalDeepLink(goalId);
  const eventType: NotificationEventType = approved ? "goal_approval" : "goal_rejection";
  const subject = approved ? "Goal approved" : "Goal requires rework";
  const message = approved
    ? "Your goal was approved and locked for employee edits."
    : "Your goal was reviewed and sent back for rework.";

  await Promise.all([
    logNotificationEvent({
      eventType,
      channel: "email",
      recipient,
      subject,
      message,
      deepLink,
    }),
    logNotificationEvent({
      eventType,
      channel: "teams",
      recipient,
      subject,
      message: `${message} Deep-link support routes directly to the goal sheet.`,
      deepLink,
    }),
  ]);
}

export async function emitCheckinNotifications(goalId: string, recipient: string, reviewed = false) {
  const deepLink = buildGoalDeepLink(goalId);
  await logNotificationEvent({
    eventType: reviewed ? "checkin_reviewed" : "checkin_submitted",
    channel: "email",
    recipient,
    subject: reviewed ? "Check-in reviewed" : "Quarterly check-in submitted",
    message: reviewed
      ? "Manager review feedback is available for the latest quarterly check-in."
      : "A quarterly progress update was submitted and is ready for review.",
    deepLink,
  });
}
