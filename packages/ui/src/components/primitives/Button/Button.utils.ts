import type { AlButtonSize, AlButtonVariant } from './Button.types';

export function normalizeButtonVariant(variant: AlButtonVariant) {
  if (variant === 'danger' || variant === 'destructive') {
    return 'destructive';
  }
  return variant;
}

export function normalizeButtonSize(size: AlButtonSize) {
  if (size === 'sm') {
    return 'small';
  }
  if (size === 'md') {
    return 'medium';
  }
  if (size === 'lg') {
    return 'large';
  }
  return size;
}
