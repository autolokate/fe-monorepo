export const STARTER_COPY = {
  heading: '₹99 Safe',
  descriptionLead: 'Starter plan with essential protection.',
  descriptionEmphasis: 'Not sold on web.',
  availableLabel: 'Available on',
} as const;

export type RetailerId = 'blinkit' | 'zepto' | 'amazon';

export interface Retailer {
  id: RetailerId;
  label: string;
}

export const STARTER_RETAILERS: Retailer[] = [
  { id: 'blinkit', label: 'blinkit' },
  { id: 'zepto', label: 'zepto' },
  { id: 'amazon', label: 'amazon' },
];
