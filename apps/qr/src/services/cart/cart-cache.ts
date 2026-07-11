let inflightPriceCart: Promise<unknown> | null = null;

export function getInflightPriceCart(): Promise<unknown> | null {
  return inflightPriceCart;
}

export function setInflightPriceCart(promise: Promise<unknown> | null): void {
  inflightPriceCart = promise;
}

export function clearInflightPriceCart(): void {
  inflightPriceCart = null;
}
