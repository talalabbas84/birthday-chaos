import { notFound } from "next/navigation";
import { PartyApp } from "@/components/PartyApp";
import { getCurrentGuest, getPartyBySlug } from "@/lib/party";

export default async function PartyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const party = await getPartyBySlug(slug);
  if (!party) notFound();

  const guest = await getCurrentGuest(slug, party.id);

  return (
    <PartyApp
      slug={slug}
      initialGuest={
        guest
          ? { id: guest.id, name: guest.name, danceLevel: guest.danceLevel, points: guest.points }
          : null
      }
      initialPartyStatus={party.status}
      initialVotingOpen={party.votingOpen}
    />
  );
}
