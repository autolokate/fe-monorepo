import { VerifyView } from './components/VerifyView';
import { verifyMetadata } from './config/metadata';

export const metadata = verifyMetadata;

type Props = { params: Promise<{ planId: string }> };

export default async function VerifyPage({ params }: Props) {
  const { planId } = await params;
  return <VerifyView planId={planId} />;
}
