import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShopProduct } from "./constants";
import styles from "./index.module.css";

export function ProductCard({ product }: { product: ShopProduct }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={product.image}
          alt={product.imageAlt}
          width={280}
          height={280}
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <span className={styles.vehicleBadge}>{product.badge}</span>
        <h3 className={styles.cardTitle}>{product.title}</h3>
        <p className={styles.cardDescription}>{product.description}</p>
        <Button size="lg" className={styles.cta} asChild>
          <Link href={product.ctaHref} target="_blank" rel="noopener noreferrer">
            <ShoppingCart className="h-4 w-4" aria-hidden />
            {product.ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </article>
  );
}
