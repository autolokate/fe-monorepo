import { ConfigureView } from './components/ConfigureView';
import { configureMetadata } from './config/metadata';

export const metadata = configureMetadata;

type Props = { params: Promise<{ planId: string }> };

export default async function ConfigurePage({ params }: Props) {
  const { planId } = await params;
  return <ConfigureView planId={planId} />;
}
