import { AlStack, AlText } from '@autolokate/ui';

export type AdminMutationResultField = {
  label: string;
  value: string;
};

export type AdminMutationResultPanelProps = {
  title: string;
  fields: AdminMutationResultField[];
};

export function AdminMutationResultPanel({ title, fields }: AdminMutationResultPanelProps) {
  return (
    <section className="admin-result-panel" aria-label={title}>
      <AlText variant="label">{title}</AlText>
      <AlStack gap="sm">
        {fields.map((field) => (
          <AlStack key={field.label} gap="xs">
            <AlText variant="caption" tone="muted">
              {field.label}
            </AlText>
            <AlText>{field.value}</AlText>
          </AlStack>
        ))}
      </AlStack>
    </section>
  );
}
