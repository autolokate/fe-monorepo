"use client";

import { endpoints } from "@/lib/api/endpoints";
import { ApiService } from "@/services/api.service";
import type {
  AdvisorAnswerEntry,
  AdvisorConversation,
  AdvisorStep,
  AdvisorVehicleCategory,
} from "@/lib/advisor/types";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function unbox<T>(payload: unknown): T {
  if (isRecord(payload) && "data" in payload) return (payload as { data: T }).data;
  return payload as T;
}

/** GET /v1/advisor/conversations — recent conversations for the signed-in user. */
export async function listAdvisorConversations(limit = 20): Promise<AdvisorConversation[]> {
  const res = await ApiService.get<unknown>(endpoints.advisor.conversations, {
    params: { limit },
  });
  const list = unbox<AdvisorConversation[] | null>(res.data);
  return Array.isArray(list) ? list : [];
}

/** POST /v1/advisor/conversations — start a fresh preference-finder thread. */
export async function createAdvisorConversation(input: {
  vehicle_category: AdvisorVehicleCategory;
  title: string;
}): Promise<AdvisorConversation & { next_step?: AdvisorStep }> {
  const res = await ApiService.post<unknown>(endpoints.advisor.conversations, input);
  const data = unbox<(AdvisorConversation & { next_step?: AdvisorStep }) | null>(res.data);
  if (!data || typeof data.id !== "string") {
    throw new Error("Unable to create conversation");
  }
  return data;
}

/** DELETE /v1/advisor/conversations/{id} — archive a thread. */
export async function archiveAdvisorConversation(conversationId: string): Promise<void> {
  await ApiService.delete(endpoints.advisor.conversationById(conversationId));
}

/** GET /v1/advisor/conversations/{id} — thread + messages + answers. */
export async function getAdvisorConversation(
  conversationId: string,
  limit = 20,
): Promise<{
  conversation: AdvisorConversation;
  messages: unknown[];
  answers: AdvisorAnswerEntry[];
  next_cursor: string | null;
} | null> {
  const res = await ApiService.get<unknown>(
    endpoints.advisor.conversationById(conversationId),
    { params: { limit } },
  );
  return unbox(res.data);
}

/** GET /v1/advisor/conversations/{id}/steps/current — current step or completion. */
export async function getAdvisorCurrentStep(conversationId: string): Promise<{
  step?: AdvisorStep;
  completed: boolean;
  current_step: number;
  answers: AdvisorAnswerEntry[];
} | null> {
  const res = await ApiService.get<unknown>(endpoints.advisor.currentStep(conversationId));
  return unbox(res.data);
}

/** POST /v1/advisor/conversations/{id}/answer — submit one answer, get next step. */
export async function submitAdvisorAnswer(
  conversationId: string,
  input: { step_id: string; selected_option_ids: string[] },
): Promise<{ next_step?: AdvisorStep; completed: boolean } | null> {
  const res = await ApiService.post<unknown>(
    endpoints.advisor.submitAnswer(conversationId),
    input,
  );
  return unbox(res.data);
}

/** GET /v1/advisor/conversations/{id}/results — model-level matches once completed. */
export async function getAdvisorResults(conversationId: string): Promise<unknown> {
  const res = await ApiService.get<unknown>(endpoints.advisor.results(conversationId));
  return unbox(res.data);
}
