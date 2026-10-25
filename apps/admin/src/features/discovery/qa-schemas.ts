import type {
  AdminCommunityQuestionDto,
  CreateAdminCommunityQuestionBody,
  UpdateAdminCommunityQuestionBody,
} from '@autolokate/api-client';
import { COMMUNITY_QUESTION_CATEGORIES, COMMUNITY_QUESTION_KINDS } from '@autolokate/api-client';
import { z } from 'zod';

export const questionFormSchema = z.object({
  kind: z.enum(COMMUNITY_QUESTION_KINDS),
  category: z.enum(COMMUNITY_QUESTION_CATEGORIES),
  title: z
    .string()
    .trim()
    .min(3, 'Title needs at least 3 characters.')
    .max(200, 'Title is too long (200 max).'),
  body: z.string().trim().max(4000, 'Body is too long (4000 max).'),
  vehicleLabel: z.string().trim().max(120, 'Vehicle label is too long (120 max).'),
  publishNow: z.boolean(),
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

export const EMPTY_QUESTION_FORM: QuestionFormValues = {
  kind: 'general',
  category: 'maintenance',
  title: '',
  body: '',
  vehicleLabel: '',
  publishNow: false,
};

export function questionToFormValues(question: AdminCommunityQuestionDto): QuestionFormValues {
  return {
    kind: question.kind,
    category: question.category,
    title: question.title,
    body: question.body,
    vehicleLabel: question.vehicleLabel ?? '',
    publishNow: question.status === 'VISIBLE',
  };
}

export function toCreateQuestionBody(values: QuestionFormValues): CreateAdminCommunityQuestionBody {
  return {
    kind: values.kind,
    category: values.category,
    title: values.title,
    ...(values.body ? { body: values.body } : {}),
    ...(values.vehicleLabel ? { vehicleLabel: values.vehicleLabel } : {}),
    status: values.publishNow ? 'VISIBLE' : 'HIDDEN',
  };
}

/** Only the fields the admin actually changed — status moves through Publish / Hide, never this form. */
export function toUpdateQuestionBody(
  values: QuestionFormValues,
  original: AdminCommunityQuestionDto,
): UpdateAdminCommunityQuestionBody {
  const body: UpdateAdminCommunityQuestionBody = {};
  if (values.title !== original.title) {
    body.title = values.title;
  }
  if (values.body !== original.body) {
    body.body = values.body;
  }
  if (values.category !== original.category) {
    body.category = values.category;
  }
  if (values.kind !== original.kind) {
    body.kind = values.kind;
  }
  const nextLabel = values.vehicleLabel === '' ? null : values.vehicleLabel;
  if (nextLabel !== original.vehicleLabel) {
    body.vehicleLabel = nextLabel;
  }
  return body;
}
