"use client";

import { useState } from "react";
import { PersonSelector, type SelectedPerson } from "@/components/PersonSelector";
import { api, ClientApiError } from "@/lib/client-api";
import type { VoteQuestionItem } from "@/lib/types";

export function VoteQuestionCard({
  slug,
  question,
  onVoted,
}: {
  slug: string;
  question: VoteQuestionItem;
  onVoted: (questionId: string, guestId: string, guestName: string) => void;
}) {
  const initial: SelectedPerson[] = question.selectedGuestId
    ? [{ guestId: question.selectedGuestId, name: question.selectedGuestName ?? "" }]
    : [];
  const [selected, setSelected] = useState<SelectedPerson[]>(initial);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleChange(people: SelectedPerson[]) {
    setSelected(people);
    setErrorMessage(null);
    const picked = people[0];
    if (!picked || !("guestId" in picked)) return;

    setSaving(true);
    try {
      await api.castVote(slug, question.id, picked.guestId);
      onVoted(question.id, picked.guestId, picked.name);
    } catch (e) {
      setErrorMessage(e instanceof ClientApiError ? e.message : "Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-chaos-card p-5">
      <h3 className="text-xl font-black text-white">{question.title}</h3>
      <p className="mt-1 text-white/60">{question.description}</p>
      <div className="mt-4">
        <PersonSelector
          slug={slug}
          selected={selected}
          onChange={handleChange}
          allowExternal={false}
          placeholder="Select person..."
        />
      </div>
      {saving && <div className="mt-2 text-xs text-white/40">Saving...</div>}
      {errorMessage && <div className="mt-2 text-xs text-chaos-pink">{errorMessage}</div>}
      {selected.length > 0 && !errorMessage && (
        <div className="mt-2 text-xs text-chaos-green">Vote locked in — change it anytime before voting closes.</div>
      )}
    </div>
  );
}
