import { Award, Clock, MessageCircle, type LucideIcon } from 'lucide-react';

export interface SupportHighlight {
  Icon: LucideIcon;
  title: string;
  description: string;
}

export const supportHighlights: SupportHighlight[] = [
  {
    Icon: Clock,
    title: '24/7 Availability',
    description: "We're always here when you need us.",
  },
  {
    Icon: MessageCircle,
    title: 'Real People',
    description: 'Talk to real experts who care.',
  },
  {
    Icon: Award,
    title: 'Committed to You',
    description: 'Your satisfaction is our top priority.',
  },
];
