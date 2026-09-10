export function QrJoinCard({ qrDataUrl, joinUrl }: { qrDataUrl: string; joinUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/5 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrDataUrl} alt="Scan to join" className="h-32 w-32" />
      <div className="text-sm font-semibold text-white/70">{joinUrl}</div>
    </div>
  );
}
