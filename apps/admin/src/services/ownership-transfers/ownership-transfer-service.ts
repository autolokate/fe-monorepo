import type {
  ApproveTransferBody,
  InitiateTransferBody,
  TransferCompletedDto,
  TransferInitiatedDto,
} from '@autolokate/api-client';
import { approveOwnershipTransfer, initiateOwnershipTransfer } from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function submitInitiateOwnershipTransfer(
  body: InitiateTransferBody,
  signal?: AbortSignal,
): Promise<TransferInitiatedDto> {
  return initiateOwnershipTransfer(getAdminApiClient(), body, { signal });
}

export async function submitApproveOwnershipTransfer(
  transferId: string,
  body: ApproveTransferBody,
  signal?: AbortSignal,
): Promise<TransferCompletedDto> {
  return approveOwnershipTransfer(getAdminApiClient(), transferId, body, { signal });
}
