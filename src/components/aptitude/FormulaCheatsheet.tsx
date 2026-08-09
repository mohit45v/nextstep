"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FORMULA_CARDS } from "@/data/aptitudeData";
import { cn } from "@/lib/cn";
import { Badge, Card, Container, EmptyState, PageHeader } from "@/components/ui";

const CATEGORIES = ["All", "Quantitative", "Logical Reasoning", "Verbal Ability"] as const;
type Category = (typeof CATEGORIES)[number];

export const FormulaCheatsheet: React.FC = () => {
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");

  const cards = useMemo(() => {
    const term = query.trim().toLowerCase();
    return FORMULA_CARDS.filter((card) => {
      if (category !== "All" && card.category !== category) return false;
      if (!term) return true;
      return (
        card.title.toLowerCase().includes(term) ||
        card.topic.toLowerCase().includes(term) ||
        card.formula.toLowerCase().includes(term)
      );
    });
  }, [category, query]);

  return (
    <Container>
      <PageHeader
        title="Formula sheets"
        description="Quick-reference cards for the formulas that come up most often in campus aptitude rounds."
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                category === cat
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search formulas"
            aria-label="Search formulas"
            className="w-full rounded-full border border-line bg-surface py-2 pr-4 pl-9 text-sm text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No formulas match that search"
            description="Try a different term, or switch category back to All."
          />
        </div>
      ) : (
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {cards.map((card) => (
            <Card key={card.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-semibold">{card.title}</h3>
                <Badge tone="neutral">{card.topic}</Badge>
              </div>

              {/* The formula itself — monospaced so symbols and spacing read
                  correctly, and visually separated from the prose around it. */}
              <p className="mt-3 rounded-input border border-accent-line bg-accent-soft px-4 py-3 font-mono text-sm leading-relaxed text-ink">
                {card.formula}
              </p>

              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-[11px] font-semibold tracking-wider text-ink-subtle uppercase">
                    Key rule
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {card.keyRule}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold tracking-wider text-ink-subtle uppercase">
                    Example
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {card.example}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};
