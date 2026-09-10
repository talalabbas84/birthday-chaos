import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { DisplayScreen } from "@/components/DisplayScreen";
import { getPartyBySlug } from "@/lib/party";

export default async function DisplayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const party = await getPartyBySlug(slug);
  if (!party) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const joinUrl = `${baseUrl}/party/${slug}`.replace(/^https?:\/\//, "");
  const qrDataUrl = await QRCode.toDataURL(`${baseUrl}/party/${slug}`, {
    margin: 1,
    width: 240,
    color: { dark: "#ffffff", light: "#0b051800" },
  });

  return <DisplayScreen slug={slug} qrDataUrl={qrDataUrl} joinUrl={joinUrl} />;
}
