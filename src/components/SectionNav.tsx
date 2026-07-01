import { useEffect, useRef, useState } from 'react';

export interface SectionNavItem {
  /** Must match the `id` of the section element it jumps to / spies on. */
  id: string;
  label: string;
}

interface SectionNavProps {
  items: SectionNavItem[];
}

/**
 * Pinned, horizontally-scrollable pill bar acting as a live table of contents:
 * clicking a pill smoothly scrolls to the matching section id, and the pill for
 * whichever section is currently in view is highlighted via IntersectionObserver.
 * Renders nothing when there are fewer than two sections to navigate between.
 */
export function SectionNav({ items }: SectionNavProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const pillRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (items.length < 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        // Prefer the entry closest to the top of the viewport, so scrolling down
        // through several in-view sections still highlights the current one.
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b,
        );
        setActiveId(topmost.target.id);
      },
      // Treat a section as "current" once it's past the sticky header/nav band,
      // and stop counting it once it's mostly scrolled past (top 70% excluded).
      { rootMargin: '-112px 0px -70% 0px', threshold: 0 },
    );

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    for (const el of elements) observer.observe(el);

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (!activeId) return;
    pillRefs.current.get(activeId)?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: 'smooth',
    });
  }, [activeId]);

  if (items.length < 2) return null;

  function handleClick(id: string) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    setActiveId(id);
  }

  return (
    <nav
      aria-label="Jump to section"
      className="sticky top-16 z-10 -mx-4 mb-5 overflow-x-auto border-b border-white/5 bg-ink-950/85 px-4 py-2.5 backdrop-blur-md scroll-slim sm:-mx-6 sm:px-6"
    >
      <div className="flex w-max gap-2">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) pillRefs.current.set(item.id, el);
                else pillRefs.current.delete(item.id);
              }}
              type="button"
              onClick={() => handleClick(item.id)}
              aria-current={isActive ? 'true' : undefined}
              className={`pill shrink-0 whitespace-nowrap outline-none transition data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent/70 ${
                isActive
                  ? 'border-accent/40 bg-accent/15 text-accent'
                  : 'hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
