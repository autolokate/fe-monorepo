import { sharedAuthScreenInventory } from './shared-auth/screens/inventory.js';
import { sharedLegalScreenInventory } from './shared-legal/screens/inventory.js';

export const phase4ScreenInventory = [
  ...sharedAuthScreenInventory,
  ...sharedLegalScreenInventory,
];
