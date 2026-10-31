import type {
  GarageTaxonomyCategoryDto,
  GarageTaxonomySubcategoryDto,
  GarageTaxonomyVehicleDto,
} from '@autolokate/api-client';
import {
  AlButton,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { useGarageTaxonomy } from '@/hooks/garage/useGarageTaxonomy';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import { AdminPanel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './garage-taxonomy.css';

type TabId = 'vehicles' | 'categories' | 'subcategories';

type Draft = {
  id?: string;
  label: string;
  slug: string;
  sortOrder: string;
  visible: boolean;
  categoryId?: string;
};

const EMPTY_DRAFT: Draft = {
  label: '',
  slug: '',
  sortOrder: '100',
  visible: true,
};

export function GarageTaxonomyPage() {
  const canWrite = useAdminPermission('settings:write');
  const {
    tree,
    isLoading,
    isFetching,
    userErrorMessage,
    vehicleSaveError,
    categorySaveError,
    subcategorySaveError,
    isSaving,
    saveVehicle,
    saveCategory,
    saveSubcategory,
    refresh,
  } = useGarageTaxonomy();

  const [tab, setTab] = useState<TabId>('vehicles');
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [formOpen, setFormOpen] = useState(false);
  /** Subcategories tab: only show/edit rows for this parent category (mapping guarantee). */
  const [subcategoryFilterCategoryId, setSubcategoryFilterCategoryId] = useState<string>('');

  const categories = useMemo(() => tree?.categories ?? [], [tree?.categories]);
  const vehicles = useMemo(() => tree?.vehicleCategories ?? [], [tree?.vehicleCategories]);

  const effectiveSubcategoryFilterId = subcategoryFilterCategoryId || categories[0]?.id || '';

  const subcategories = useMemo(() => {
    if (!effectiveSubcategoryFilterId) return [];
    const parent = categories.find((c) => c.id === effectiveSubcategoryFilterId);
    if (!parent) return [];
    return parent.subcategories.map((s) => ({
      ...s,
      categoryLabel: parent.label,
    }));
  }, [categories, effectiveSubcategoryFilterId]);

  const openCreate = () => {
    setDraft({
      ...EMPTY_DRAFT,
      categoryId:
        tab === 'subcategories'
          ? effectiveSubcategoryFilterId || categories[0]?.id
          : categories[0]?.id,
    });
    setFormOpen(true);
  };

  const openEditVehicle = (row: GarageTaxonomyVehicleDto) => {
    setDraft({
      id: row.id,
      label: row.label,
      slug: row.slug,
      sortOrder: String(row.sortOrder),
      visible: row.visible,
    });
    setFormOpen(true);
  };

  const openEditCategory = (row: GarageTaxonomyCategoryDto) => {
    setDraft({
      id: row.id,
      label: row.label,
      slug: row.slug,
      sortOrder: String(row.sortOrder),
      visible: row.visible,
    });
    setFormOpen(true);
  };

  const openEditSubcategory = (row: GarageTaxonomySubcategoryDto) => {
    setDraft({
      id: row.id,
      label: row.label,
      slug: row.slug,
      sortOrder: String(row.sortOrder),
      visible: row.visible,
      categoryId: row.categoryId,
    });
    setFormOpen(true);
  };

  const saveError =
    tab === 'vehicles'
      ? vehicleSaveError
      : tab === 'categories'
        ? categorySaveError
        : subcategorySaveError;

  const onSubmit = async () => {
    const sortOrder = Number.parseInt(draft.sortOrder, 10);
    const body = {
      label: draft.label.trim(),
      slug: draft.slug.trim() || undefined,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 100,
      visible: draft.visible,
    };
    if (!body.label) return;

    if (tab === 'vehicles') {
      await saveVehicle({ id: draft.id, body });
    } else if (tab === 'categories') {
      await saveCategory({ id: draft.id, body });
    } else {
      if (!draft.categoryId) return;
      await saveSubcategory({
        id: draft.id,
        body: { ...body, categoryId: draft.categoryId },
      });
    }
    setFormOpen(false);
    setDraft(EMPTY_DRAFT);
  };

  if (userErrorMessage && !tree) {
    const needsMigrate =
      /404|503|relation|does not exist|0097|migrate/i.test(userErrorMessage) ||
      userErrorMessage.toLowerCase().includes('not found');
    return (
      <RequirePermission permission="settings:read">
        <AlErrorState
          message={
            needsMigrate
              ? `Workshops taxonomy needs migrate 0097 (Kapil GO required before Dev apply). ${userErrorMessage}`
              : userErrorMessage
          }
          onRetry={() => {
            void refresh();
          }}
        />
      </RequirePermission>
    );
  }

  if (isLoading && !tree) {
    return (
      <RequirePermission permission="settings:read">
        <AdminPageLoader label="Loading Workshops taxonomy…" />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="settings:read">
      <AlStack gap="md" data-testid="garage-taxonomy-page">
        <AlPageHeader
          title="Garage taxonomy"
          description="Partner Workshops vehicle categories, business categories, and subcategories (platform root). Requires migrate 0097."
          actions={
            <>
              {canWrite ? <AlPageHeaderAction label="Add" onClick={openCreate} /> : null}
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={() => {
                  void refresh();
                }}
              />
            </>
          }
        />

        <AdminPanel
          title="Platform root catalogue"
          subtitle="Edits apply to all garage partners. Store-level offered services stay on the partner store APIs after Kapil migrate GO."
        >
          <div className="garage-taxonomy-tabs" role="tablist" aria-label="Taxonomy sections">
            {(
              [
                ['vehicles', 'Vehicle categories'],
                ['categories', 'Categories'],
                ['subcategories', 'Subcategories'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`garage-taxonomy-tab${tab === id ? ' garage-taxonomy-tab--active' : ''}`}
                onClick={() => {
                  setTab(id);
                  setFormOpen(false);
                  if (id === 'subcategories' && !subcategoryFilterCategoryId && categories[0]) {
                    setSubcategoryFilterCategoryId(categories[0].id);
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'subcategories' ? (
            <label className="garage-taxonomy-field garage-taxonomy-filter">
              <span>Parent category</span>
              <select
                value={effectiveSubcategoryFilterId}
                onChange={(e) => {
                  const next = e.target.value;
                  setSubcategoryFilterCategoryId(next);
                  setFormOpen(false);
                  setDraft({
                    ...EMPTY_DRAFT,
                    categoryId: next || undefined,
                  });
                }}
                data-testid="garage-taxonomy-subcategory-category-filter"
                required
              >
                {categories.length === 0 ? (
                  <option value="">No categories yet</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.subcategories.length})
                    </option>
                  ))
                )}
              </select>
            </label>
          ) : null}

          {formOpen && canWrite ? (
            <form
              className="garage-taxonomy-form"
              onSubmit={(e) => {
                e.preventDefault();
                void onSubmit();
              }}
            >
              <AlText as="h3" variant="subtitle">
                {draft.id ? 'Edit' : 'Add'}{' '}
                {tab === 'vehicles'
                  ? 'vehicle category'
                  : tab === 'categories'
                    ? 'category'
                    : 'subcategory'}
              </AlText>
              <label className="garage-taxonomy-field">
                <span>Label</span>
                <input
                  value={draft.label}
                  onChange={(e) => {
                    setDraft((d) => ({ ...d, label: e.target.value }));
                  }}
                  required
                  maxLength={120}
                />
              </label>
              <label className="garage-taxonomy-field">
                <span>Slug (optional)</span>
                <input
                  value={draft.slug}
                  onChange={(e) => {
                    setDraft((d) => ({ ...d, slug: e.target.value }));
                  }}
                  maxLength={64}
                  placeholder="auto from label"
                />
              </label>
              <label className="garage-taxonomy-field">
                <span>Sort order</span>
                <input
                  type="number"
                  value={draft.sortOrder}
                  onChange={(e) => {
                    setDraft((d) => ({ ...d, sortOrder: e.target.value }));
                  }}
                  min={0}
                  max={10000}
                />
              </label>
              {tab === 'subcategories' ? (
                <label className="garage-taxonomy-field">
                  <span>Parent category (required)</span>
                  <select
                    value={draft.categoryId ?? ''}
                    onChange={(e) => {
                      const next = e.target.value;
                      setDraft((d) => ({ ...d, categoryId: next }));
                      if (next) setSubcategoryFilterCategoryId(next);
                    }}
                    required
                    data-testid="garage-taxonomy-subcategory-parent"
                  >
                    <option value="" disabled>
                      Select parent category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="garage-taxonomy-check">
                <input
                  type="checkbox"
                  checked={draft.visible}
                  onChange={(e) => {
                    setDraft((d) => ({ ...d, visible: e.target.checked }));
                  }}
                />
                <span>Visible to partners</span>
              </label>
              {saveError ? <p className="admin-empty-note">{saveError}</p> : null}
              <div className="garage-taxonomy-form-actions">
                <AlButton type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save'}
                </AlButton>
                <AlButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setFormOpen(false);
                  }}
                >
                  Cancel
                </AlButton>
              </div>
            </form>
          ) : null}

          {tab === 'vehicles' ? (
            <TaxonomyTable
              rows={vehicles.map((v) => ({
                id: v.id,
                primary: v.label,
                secondary: v.slug,
                meta: `sort ${String(v.sortOrder)}${v.visible ? '' : ' · hidden'}`,
                onEdit: canWrite
                  ? () => {
                      openEditVehicle(v);
                    }
                  : undefined,
              }))}
              empty="No vehicle categories yet — apply migrate 0097 or add one."
            />
          ) : null}

          {tab === 'categories' ? (
            <TaxonomyTable
              rows={categories.map((c) => ({
                id: c.id,
                primary: c.label,
                secondary: c.slug,
                meta: `${String(c.subcategories.length)} sub · sort ${String(c.sortOrder)}${c.visible ? '' : ' · hidden'}`,
                onEdit: canWrite
                  ? () => {
                      openEditCategory(c);
                    }
                  : undefined,
              }))}
              empty="No business categories yet — apply migrate 0097 or add one."
            />
          ) : null}

          {tab === 'subcategories' ? (
            <TaxonomyTable
              rows={subcategories.map((s) => ({
                id: s.id,
                primary: s.label,
                secondary: `${s.categoryLabel} · ${s.slug}`,
                meta: `csv#${s.legacyCsvId == null ? '—' : String(s.legacyCsvId)} · sort ${String(s.sortOrder)}${s.visible ? '' : ' · hidden'}`,
                onEdit: canWrite
                  ? () => {
                      openEditSubcategory(s);
                    }
                  : undefined,
              }))}
              empty={
                effectiveSubcategoryFilterId
                  ? 'No subcategories for this category — add one with the parent selected above.'
                  : 'No subcategories yet — apply migrate 0097 or add a category first.'
              }
            />
          ) : null}
        </AdminPanel>
      </AlStack>
    </RequirePermission>
  );
}

function TaxonomyTable({
  rows,
  empty,
}: {
  rows: Array<{
    id: string;
    primary: string;
    secondary: string;
    meta: string;
    onEdit?: () => void;
  }>;
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="admin-empty-note">{empty}</p>;
  }
  return (
    <ul className="garage-taxonomy-list">
      {rows.map((row) => (
        <li key={row.id} className="garage-taxonomy-row">
          <div>
            <div className="garage-taxonomy-row__primary">{row.primary}</div>
            <div className="garage-taxonomy-row__secondary">{row.secondary}</div>
            <div className="garage-taxonomy-row__meta">{row.meta}</div>
          </div>
          {row.onEdit ? (
            <AlButton type="button" variant="secondary" onClick={row.onEdit}>
              Edit
            </AlButton>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
