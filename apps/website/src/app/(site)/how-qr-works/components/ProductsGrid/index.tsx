import { Truck } from "lucide-react";
import { SHOP_PRODUCTS_SECTION_ID } from "../HeroBanner/constants";
import { PRODUCTS_SECTION_COPY, products } from "./constants";
import { ProductCard } from "./ProductCard";
import styles from "./index.module.css";

export function ProductsGrid() {
  return (
    <section id={SHOP_PRODUCTS_SECTION_ID} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.panel}>
          <header className={styles.header}>
            <span className={styles.badge}>{PRODUCTS_SECTION_COPY.eyebrow}</span>
            <h2 className={styles.headline}>{PRODUCTS_SECTION_COPY.headline}</h2>
            <p className={styles.subheading}>{PRODUCTS_SECTION_COPY.subheading}</p>
          </header>

          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.key} product={product} />
            ))}
          </div>

          <p className={styles.footerNote}>
            <Truck className="h-4 w-4 shrink-0" aria-hidden />
            {PRODUCTS_SECTION_COPY.footerNote}
          </p>
        </div>
      </div>
    </section>
  );
}
