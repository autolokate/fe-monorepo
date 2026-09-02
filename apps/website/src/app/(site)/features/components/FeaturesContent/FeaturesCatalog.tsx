'use client';

import type { FeatureCategory } from './features-catalog';
import { LIGHT_FEATURE_CATEGORIES } from './features-catalog';
import {
  FEATURES_CATALOG_COPY,
  FEATURES_DAILY_UTILITY_MEDIA,
  FEATURES_GARAGES_MEDIA,
  FEATURES_SHOWCASES,
} from './constants';
import { FeatureMediaStage, type FeatureMediaVariant } from './FeatureMediaStage';
import { FeaturesReveal } from './FeaturesReveal';
import styles from './catalog.module.css';

const INTRO_CATEGORY_COUNT = 2;

type CategoryMedia = {
  image: string;
  imageAlt: string;
  width: number;
  height: number;
  variant: FeatureMediaVariant;
};

type MediaPosition = 'left' | 'right';

function getCategoryMedia(categoryId: string): CategoryMedia | undefined {
  if (categoryId === 'daily') {
    return {
      ...FEATURES_DAILY_UTILITY_MEDIA,
      width: 852,
      height: 1847,
      variant: 'utility',
    };
  }
  if (categoryId === 'garages') {
    return {
      ...FEATURES_GARAGES_MEDIA,
      width: 892,
      height: 1762,
      variant: 'garages',
    };
  }
  return undefined;
}

function FeatureCategoryCard({
  category,
  index,
  media,
  mediaPosition = 'right',
}: {
  category: FeatureCategory;
  index: number;
  media?: CategoryMedia;
  mediaPosition?: MediaPosition;
}) {
  const CategoryIcon = category.Icon;
  const isSpotlight = Boolean(media);

  return (
    <FeaturesReveal delayMs={index * 60}>
      <article
        id={category.id}
        className={[
          styles.category,
          isSpotlight ? styles.categorySpotlight : '',
          media && mediaPosition === 'left' ? styles.categorySpotlightReverse : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles.categoryContent}>
          <header className={styles.categoryHead}>
            <span className={styles.categoryIndex}>{String(index + 1).padStart(2, '0')}</span>
            <span className={styles.categoryIcon} aria-hidden="true">
              <CategoryIcon className={styles.categoryIconSvg} strokeWidth={1.75} />
            </span>
            <div className={styles.categoryTitles}>
              <h3 className={styles.categoryTitle}>{category.title}</h3>
              <p className={styles.categorySubtitle}>{category.subtitle}</p>
            </div>
            <span className={styles.categoryCount}>
              {category.items.length} {category.items.length === 1 ? 'feature' : 'features'}
            </span>
          </header>

          <ul className={styles.itemList}>
            {category.items.map((item, itemIndex) => {
              const ItemIcon = item.Icon;
              return (
                <li
                  key={item.id}
                  className={styles.item}
                  style={{ transitionDelay: `${String(120 + itemIndex * 40)}ms` }}
                >
                  <span className={styles.itemIcon} aria-hidden="true">
                    <ItemIcon className={styles.itemIconSvg} strokeWidth={1.75} />
                  </span>
                  <div className={styles.itemCopy}>
                    <span className={styles.itemLabel}>{item.label}</span>
                    <span className={styles.itemDetail}>{item.detail}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {media ? (
          <div className={styles.categoryMedia}>
            <FeatureMediaStage
              src={media.image}
              alt={media.imageAlt}
              width={media.width}
              height={media.height}
              variant={media.variant}
            />
          </div>
        ) : null}
      </article>
    </FeaturesReveal>
  );
}

type FeaturesCatalogProps = {
  part: 'intro' | 'rest';
};

export function FeaturesCatalog({ part }: FeaturesCatalogProps) {
  const introCategories = LIGHT_FEATURE_CATEGORIES.slice(0, INTRO_CATEGORY_COUNT);
  const restCategories = LIGHT_FEATURE_CATEGORIES.slice(INTRO_CATEGORY_COUNT);
  const showcase = FEATURES_SHOWCASES[0];

  if (part === 'intro') {
    const { eyebrow, headline, headlineAccent, subheading } = FEATURES_CATALOG_COPY;

    return (
      <section id="features" className={styles.section} aria-labelledby="features-catalog-heading">
        <div className={styles.inner}>
          <FeaturesReveal>
            <header className={styles.header}>
              <p className={styles.eyebrow}>
                <span className={styles.eyebrowLine} aria-hidden="true" />
                {eyebrow}
              </p>
              <h2 id="features-catalog-heading" className={styles.headline}>
                {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
              </h2>
              <p className={styles.subheading}>{subheading}</p>
            </header>
          </FeaturesReveal>

          <div className={styles.spotlightStack}>
            {introCategories.map((category, index) => {
              const media = getCategoryMedia(category.id);
              return (
                <FeatureCategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  media={media}
                  mediaPosition={category.id === 'garages' ? 'left' : 'right'}
                />
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.sectionContinued} aria-label="More app features">
      <div className={styles.inner}>
        <div className={styles.gridRest}>
          {restCategories.map((category, index) => (
            <FeatureCategoryCard
              key={category.id}
              category={category}
              index={index + introCategories.length}
            />
          ))}
        </div>

        <FeaturesReveal delayMs={80}>
          <figure className={styles.showcase}>
            <div className={styles.showcaseMedia}>
              <FeatureMediaStage
                src={showcase.image}
                alt={showcase.imageAlt}
                width={1536}
                height={1024}
                variant="garageDashboard"
              />
            </div>
            <figcaption className={styles.showcaseCopy}>
              <p className={styles.showcaseEyebrow}>{showcase.eyebrow}</p>
              <p className={styles.showcaseHeadline}>{showcase.headline}</p>
              <p className={styles.showcaseBody}>{showcase.body}</p>
            </figcaption>
          </figure>
        </FeaturesReveal>
      </div>
    </section>
  );
}
