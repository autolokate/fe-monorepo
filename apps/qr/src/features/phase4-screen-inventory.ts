import { sharedAuthScreenInventory } from './shared-auth/screens/inventory';
import { sharedLegalScreenInventory } from './shared-legal/screens/inventory';

export const phase4ScreenInventory = [...sharedAuthScreenInventory, ...sharedLegalScreenInventory];
