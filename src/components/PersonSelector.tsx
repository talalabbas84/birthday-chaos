"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client-api";
import type { GuestSummary } from "@/lib/types";

export type SelectedPerson = { guestId: string; name: string } | { externalName: string };

function personKey(p: SelectedPerson): string {
  return "guestId" in p ? `g:${p.guestId}` : `e:${p.externalName.trim().toLowerCase()}`;
}

export function PersonSelector({
  slug,
  selected,
  onChange,
  multiple = false,
  maxSelections = 1,
  allowExternal = true,
  placeholder = "Search people...",
}: {
  slug: string;
  selected: SelectedPerson[];
  onChange: (people: SelectedPerson[]) => void;
  multiple?: boolean;
  maxSelections?: number;
  allowExternal?: boolean;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GuestSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [addingExternal, setAddingExternal] = useState(false);
  const [externalName, setExternalName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const atLimit = selected.length >= maxSelections;
  const selectedKeys = new Set(selected.map(personKey));

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      api
        .searchGuests(slug, query)
        .then((res) => setResults(res.results))
        .catch(() => setResults([]));
    }, 180);
    return () => clearTimeout(timeout);
  }, [query, open, slug]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAddingExternal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addPerson(person: SelectedPerson) {
    const key = personKey(person);
    if (selectedKeys.has(key)) return;
    const next = multiple ? [...selected, person] : [person];
    onChange(next.slice(0, maxSelections));
    setQuery("");
    setExternalName("");
    setAddingExternal(false);
    if (!multiple || next.length >= maxSelections) setOpen(false);
  }

  function removePerson(person: SelectedPerson) {
    onChange(selected.filter((p) => personKey(p) !== personKey(person)));
  }

  const visibleResults = results.filter((r) => !selectedKeys.has(`g:${r.id}`));

  return (
    <div ref={containerRef} className="relative">
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selected.map((p) => (
            <span
              key={personKey(p)}
              className="flex items-center gap-1.5 rounded-full bg-chaos-purple/30 px-3 py-1 text-sm font-medium text-white"
            >
              {"guestId" in p ? p.name : `${p.externalName} (not in app)`}
              <button
                type="button"
                onClick={() => removePerson(p)}
                className="text-white/60 hover:text-white"
                aria-label={`Remove ${"guestId" in p ? p.name : p.externalName}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {!atLimit && (
        <>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/40 outline-none focus:border-chaos-pink/60"
          />

          {open && (
            <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-white/10 bg-chaos-card shadow-2xl">
              {visibleResults.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => addPerson({ guestId: r.id, name: r.name })}
                  className="block w-full px-4 py-3 text-left text-white hover:bg-white/10"
                >
                  {r.name}
                </button>
              ))}

              {visibleResults.length === 0 && !addingExternal && (
                <div className="px-4 py-3 text-sm text-white/40">No matches yet.</div>
              )}

              {allowExternal && !addingExternal && (
                <button
                  type="button"
                  onClick={() => setAddingExternal(true)}
                  className="block w-full border-t border-white/10 px-4 py-3 text-left text-sm text-chaos-cyan"
                >
                  Can&apos;t find them?
                  <span className="block text-white/60">They&apos;re not in the app</span>
                </button>
              )}

              {allowExternal && addingExternal && (
                <div className="border-t border-white/10 p-3">
                  <label className="mb-1 block text-xs text-white/50">What&apos;s their first name?</label>
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={externalName}
                      onChange={(e) => setExternalName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && externalName.trim()) {
                          addPerson({ externalName: externalName.trim() });
                        }
                      }}
                      placeholder="First name"
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40 outline-none"
                    />
                    <button
                      type="button"
                      disabled={!externalName.trim()}
                      onClick={() => addPerson({ externalName: externalName.trim() })}
                      className="rounded-xl bg-chaos-pink px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
