'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Check, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RadixStackDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>
          <MessageSquare className="h-4 w-4" aria-hidden />
          Open Radix Dialog
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-foreground/10 bg-background p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold tracking-tight">Radix UI</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-foreground/75">
            Dialog plus a Slot-based button — same Radix stack as the main Autolokate app.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost">
                <X className="h-4 w-4" aria-hidden />
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button>
                <Check className="h-4 w-4" aria-hidden />
                Done
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
