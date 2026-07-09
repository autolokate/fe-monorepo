import {
  colorPrimitives,
  semanticDark,
  semanticLight,
  type SemanticColorToken,
} from './tokens/colors';
import { motion } from './tokens/motion';
import { spacing } from './tokens/spacing';
import { typography } from './tokens/typography';

export type ThemeMode = 'light' | 'dark';

export const themes = {
  light: semanticLight,
  dark: semanticDark,
} as const satisfies Record<ThemeMode, Record<SemanticColorToken, string>>;

export type Theme = {
  mode: ThemeMode;
  colors: Record<SemanticColorToken, string>;
  primitives: typeof colorPrimitives;
  typography: typeof typography;
  spacing: typeof spacing;
  motion: typeof motion;
};

/** Resolve a full theme object for programmatic use. */
export function getTheme(mode: ThemeMode = 'light'): Theme {
  return {
    mode,
    colors: themes[mode],
    primitives: colorPrimitives,
    typography,
    spacing,
    motion,
  };
}

/** Primitive + semantic + typography + spacing tokens for a given theme mode. */
export function getCssVariables(mode: ThemeMode = 'light'): Record<string, string> {
  return {
    ...colorPrimitives,
    ...typography,
    ...spacing,
    ...motion,
    ...themes[mode],
  };
}

/** Default flat token map (light semantic colors). */
export const cssVariables = getCssVariables('light');

export type CssVariableName = keyof typeof cssVariables;

const THEME_ATTRIBUTE = 'data-theme';

/** Apply a theme mode to the document root. */
export function setThemeMode(mode: ThemeMode, element: HTMLElement = document.documentElement): void {
  element.setAttribute(THEME_ATTRIBUTE, mode);
}

/** Read the active theme mode from the document root. */
export function getThemeMode(element: HTMLElement = document.documentElement): ThemeMode | null {
  const value = element.getAttribute(THEME_ATTRIBUTE);
  return value === 'light' || value === 'dark' ? value : null;
}

/** Serialize primitive tokens (theme-independent) into a CSS block. */
export function createPrimitiveStylesheet(selector = ':root'): string {
  const entries: [string, string][] = [
    ...Object.entries(colorPrimitives),
    ...Object.entries(typography),
    ...Object.entries(spacing),
  ];

  const declarations = entries.map(([name, value]) => `  ${name}: ${value};`).join('\n');

  return `${selector} {\n${declarations}\n}\n`;
}

/** Serialize semantic color roles for a theme mode into a CSS block. */
export function createSemanticStylesheet(
  mode: ThemeMode,
  selector: string = mode === 'light' ? ':root, [data-theme="light"]' : '[data-theme="dark"]',
): string {
  const declarations = Object.entries(themes[mode])
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  return `${selector} {\n${declarations}\n}\n`;
}

/** Serialize the full token set into CSS blocks for all supported theme modes. */
export function createThemeStylesheet(): string {
  const primitiveBlock = createPrimitiveStylesheet();
  const lightBlock = createSemanticStylesheet('light');
  const darkBlock = createSemanticStylesheet('dark', '[data-theme="dark"]');

  const darkSystemDeclarations = Object.entries(themes.dark)
    .map(([name, value]) => `    ${name}: ${value};`)
    .join('\n');

  const darkSystemBlock = `@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${darkSystemDeclarations}
  }
}`;

  return `${primitiveBlock}\n${lightBlock}\n${darkBlock}\n${darkSystemBlock}\n`;
}

/** Apply design tokens as inline CSS variables on a DOM element. */
export function applyTheme(
  element: HTMLElement,
  mode: ThemeMode = 'light',
): void {
  const variables = getCssVariables(mode);
  for (const [name, value] of Object.entries(variables)) {
    element.style.setProperty(name, value);
  }
  setThemeMode(mode, element);
}

/** Grouped token namespaces for programmatic access. */
export const theme = {
  primitives: colorPrimitives,
  typography,
  spacing,
  motion,
  themes,
} as const;
