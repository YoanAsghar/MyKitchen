'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import ProductCards from "../../../../components/ProductCards";
import { Product } from "../../../../models/product";
import { Category } from "../../../../models/category";

interface MenuContentProps {
  products: Product[];
  categories: Category[];
}

interface MenuSection {
  key: string;
  title: string;
  products: Product[];
}

const UNCATEGORIZED_KEY = "uncategorized";

const MenuContent = ({ products, categories }: MenuContentProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showImages, setShowImages] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  // Every product is shown, grouped into one section per category (in the
  // category table's order). Categories without products are skipped, and
  // products with no/unknown category fall into a final "Sin categoría"
  // section. Search narrows the visible products and therefore the sections.
  const sections = useMemo<MenuSection[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    const visibleProducts = query
      ? products.filter((p) => p.name.toLowerCase().includes(query))
      : products;
    const knownCategoryIds = new Set(categories.map((c) => c.id));

    const grouped: MenuSection[] = categories
      .map((category) => ({
        key: `category-${category.id}`,
        title: category.name,
        products: visibleProducts.filter((p) => p.categoryId === category.id),
      }))
      .filter((section) => section.products.length > 0);

    const uncategorized = visibleProducts.filter(
      (p) => p.categoryId === null || !knownCategoryIds.has(p.categoryId)
    );
    if (uncategorized.length > 0) {
      grouped.push({
        key: UNCATEGORIZED_KEY,
        title: "Sin categoría",
        products: uncategorized,
      });
    }

    return grouped;
  }, [products, categories, searchQuery]);

  const getSectionElements = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return [];
    return Array.from(
      container.querySelectorAll<HTMLElement>("[data-section-key]")
    );
  }, []);

  const updateActiveSection = useCallback(() => {
    const container = scrollRef.current;
    const elements = getSectionElements();
    if (!container || elements.length === 0) {
      setActiveSection(null);
      return;
    }

    const threshold = container.scrollTop + 16;
    let current = elements[0].dataset.sectionKey ?? null;
    for (const element of elements) {
      if (element.offsetTop <= threshold) {
        current = element.dataset.sectionKey ?? current;
      }
    }

    // The last section can never reach the top of the viewport; once the
    // container is at the bottom, mark it active so the sidebar matches.
    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 8
    ) {
      current = elements[elements.length - 1].dataset.sectionKey ?? current;
    }

    setActiveSection(current);
  }, [getSectionElements]);

  const handleScroll = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      updateActiveSection();
    });
  }, [updateActiveSection]);

  const handleSectionClick = (key: string) => {
    const container = scrollRef.current;
    const target = getSectionElements().find(
      (element) => element.dataset.sectionKey === key
    );
    if (!container || !target) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    container.scrollTo({
      top: Math.max(0, target.offsetTop - 12),
      behavior: reduceMotion ? "auto" : "smooth",
    });
    setActiveSection(key);
  };

  // Keep the highlight valid when sections change (e.g. while searching).
  useEffect(() => {
    setActiveSection((previous) =>
      previous && sections.some((section) => section.key === previous)
        ? previous
        : sections[0]?.key ?? null
    );
  }, [sections]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTop = 0;
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const hasSearch = searchQuery.trim() !== "";

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-night">
      {/* TOP BAR: SEARCH + IMAGES TOGGLE */}
      <div className="shrink-0 border-b border-night-line bg-night p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-night-muted"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar producto"
              placeholder="Nombre del producto..."
              className="w-full rounded-lg border border-night-line bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-night-faint transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:pl-2">
            <span className="text-sm font-medium text-night-secondary">
              Mostrar imágenes
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={showImages}
              aria-label="Mostrar imágenes"
              onClick={() => setShowImages((value) => !value)}
              className={`relative h-7 w-14 shrink-0 rounded-full p-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                showImages ? "bg-brand-600" : "bg-white/15"
              }`}
            >
              <span
                className={`block size-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  showImages ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* CATEGORY SIDEBAR (horizontal chip row on mobile) */}
        <aside className="shrink-0 border-b border-night-line bg-night md:flex md:h-full md:w-60 md:flex-col md:border-b-0 md:border-r">
          <nav
            aria-label="Categorías de la carta"
            className="flex gap-1 overflow-x-auto p-2 md:min-h-0 md:flex-1 md:flex-col md:overflow-x-hidden md:overflow-y-auto md:p-3"
          >
            <p className="hidden px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-night-muted md:block">
              Categorías
            </p>
            {sections.map((section) => {
              const isActive = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => handleSectionClick(section.key)}
                  aria-current={isActive ? "true" : undefined}
                  className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    isActive
                      ? "bg-brand-500/10 text-brand-500"
                      : "text-night-muted hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {section.title}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* PRODUCT SECTIONS */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative flex-1 overflow-y-auto"
        >
          <div className="p-4 md:p-6">
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <BookOpen
                  className="size-12 text-night-ghost"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h2 className="mt-3 text-xl font-bold text-night-body">
                  {hasSearch ? "Sin resultados" : "La carta está vacía"}
                </h2>
                <p className="mt-1 text-sm text-night-muted">
                  {hasSearch
                    ? `No se encontraron productos para “${searchQuery.trim()}”.`
                    : "Agrega productos desde el panel de administración."}
                </p>
              </div>
            ) : (
              sections.map((section) => (
                <section
                  key={section.key}
                  data-section-key={section.key}
                  className="mb-8 last:mb-0"
                >
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h2 className="text-xl font-bold text-night-title">
                      {section.title}
                    </h2>
                    <span className="shrink-0 text-xs font-medium text-night-muted">
                      {section.products.length}{" "}
                      {section.products.length === 1 ? "producto" : "productos"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {section.products.map((product) => (
                      <ProductCards
                        key={product.id}
                        product={product}
                        showImages={showImages}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuContent;
