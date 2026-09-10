import { notFound } from "next/navigation";
import { HostApp } from "@/components/HostApp";
import { isHostAuthenticated } from "@/lib/host-auth";
import { getPartyBySlug } from "@/lib/party";

export default async function HostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const party = await getPartyBySlug(slug);
  if (!party) notFound();

  return <HostApp slug={slug} initialAuthed={await isHostAuthenticated(slug)} />;
}
