// Inline mock of what a charter satellite-drop alert looks like in
// Telegram. Pure presentation — no real bot integration here. The data is
// hard-coded because this preview is illustrative, not live.
//
// Three bubbles, mirroring the actual multi-message format the cron
// route generates (label + content). One alert, one milestone, one
// catalyst — covers the breadth of what charter members will receive.

export default function TelegramAlertPreview() {
  return (
    <div className="rounded-md overflow-hidden border border-border-custom shadow-sm bg-[#0e1621]">
      {/* Telegram-style header */}
      <div className="bg-[#17212b] border-b border-[#0e1621] px-4 py-3 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg,#3390ec,#1f6fc8)" }}
        >
          G
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-semibold leading-tight truncate">
            GIGASCOPE Alerts
          </div>
          <div className="text-[#7d8e9f] text-[11px] leading-tight">bot · online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="px-4 py-5 flex flex-col gap-3 bg-[#0e1621]">
        <Bubble time="06:42">
          <div className="text-[10px] uppercase tracking-widest text-[#8aa9c8] font-mono mb-1">
            Satellite drop
          </div>
          <p className="text-white text-sm leading-snug">
            New Sentinel-2 frame on <strong>Giga Texas</strong> (2026-05-15). Visible delta:
            south expansion pad extends ~120 m east of the prior frame. Track +1.
          </p>
        </Bubble>
        <Bubble time="06:42">
          <div className="text-[10px] uppercase tracking-widest text-[#8aa9c8] font-mono mb-1">
            Milestone
          </div>
          <p className="text-white text-sm leading-snug">
            <strong>Starbase</strong> — FAA static-fire window opens 2026-05-30 14:00 UTC for
            Booster 14. Filing 2026-053-FAA-OST. Open in app →
          </p>
        </Bubble>
        <Bubble time="06:43">
          <div className="text-[10px] uppercase tracking-widest text-[#8aa9c8] font-mono mb-1">
            Catalyst · T-7
          </div>
          <p className="text-white text-sm leading-snug">
            TSLA Q2 earnings call in 7 days. Charter dashboard shows the relevant
            Texas/Mexico/Berlin progress deltas since the prior call.
          </p>
        </Bubble>
      </div>
    </div>
  );
}

function Bubble({ children, time }: { children: React.ReactNode; time: string }) {
  return (
    <div className="bg-[#182533] rounded-md px-3 py-2.5 max-w-[92%]">
      {children}
      <div className="text-[10px] text-[#6f8194] mt-1.5 text-right">{time}</div>
    </div>
  );
}
