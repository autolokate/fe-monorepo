/**
 * Provider inventory — wiring deferred until UI bootstrap phase.
 * All providers compose DS theme + workspace packages only.
 */
export type ProviderId =
  | 'ThemeProvider'
  | 'AuthProvider'
  | 'FlowEngineProvider'
  | 'QueryClientProvider'
  | 'RouterProvider';

export type ProviderDefinition = {
  id: ProviderId;
  package: '@autolokate/design-system' | '@autolokate/auth' | 'local' | '@tanstack/react-query';
  description: string;
  phase: '4-bootstrap' | '4-auth' | '4-data';
};

export const providerInventory: readonly ProviderDefinition[] = [
  {
    id: 'ThemeProvider',
    package: '@autolokate/design-system',
    description: 'setThemeMode / data-theme on document root',
    phase: '4-bootstrap',
  },
  {
    id: 'AuthProvider',
    package: '@autolokate/auth',
    description: 'TokenManager session + device identity',
    phase: '4-auth',
  },
  {
    id: 'FlowEngineProvider',
    package: 'local',
    description: 'Active flow context and step navigation',
    phase: '4-bootstrap',
  },
  {
    id: 'QueryClientProvider',
    package: '@tanstack/react-query',
    description: 'Server state for vehicles, plans, OTP',
    phase: '4-data',
  },
  {
    id: 'RouterProvider',
    package: 'local',
    description: 'react-router-dom — added in implementation phase',
    phase: '4-bootstrap',
  },
];
