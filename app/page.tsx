"use client";

import { useState, useEffect, useRef } from "react";

const issues = [
  {
    id: 1,
    severity: "critical",
    users: 832,
    sessions: 1204,
    dropRate: "69%",
    title: 'Clicking "Join" shows "Already joined this"',
    description:
      'Users click the Join button and receive an "Already joined this" error — blocking re-engagement and causing confusion.',
    suggestedFix:
      'Check membership state before rendering the Join button. If the user is already a member, hide the button or replace it with a "View Community" CTA. Add a server-side guard to return a clear error with remediation options rather than a blocking modal.',
    tag: "Broken Flow",
    first_seen: "3 days ago",
    last_seen: "2 min ago",
  },
  {
    id: 2,
    severity: "critical",
    users: 4345,
    sessions: 5810,
    dropRate: "100%",
    title: "Users unable to exit the Create Account tab",
    description:
      "Users get trapped in the account creation flow with no clear way to go back, leading to full session abandonment.",
    suggestedFix:
      'Add a visible "Back" or "Cancel" button at the top of the Create Account screen that routes to the previous page. Ensure the browser back button is not intercepted. Consider a persistent X in the top-right so users always have a clear escape path.',
    tag: "Dead End",
    first_seen: "6 days ago",
    last_seen: "5 min ago",
  },
  {
    id: 3,
    severity: "medium",
    users: 3277,
    sessions: 4120,
    dropRate: "32%",
    title: "Empty page shown after clicking the logo",
    description:
      "Clicking the logo from certain pages routes users to a blank page — no content, no error message.",
    suggestedFix:
      "Audit the logo href across all page templates — it likely resolves to a route with no content in certain auth states. Ensure the logo always routes to the user's contextual home (dashboard if logged in, landing if not). Add a fallback redirect and a non-empty loading/error state to prevent a blank screen.",
    tag: "Broken Navigation",
    first_seen: "1 day ago",
    last_seen: "12 min ago",
  },
];

const severityConfig = {
  critical: {
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-400 border border-red-500/20",
    label: "Critical",
    countColor: "text-red-400",
    hover: "hover:border-red-500/40",
    glow: "hover:shadow-red-500/10",
  },
  medium: {
    dot: "bg-yellow-500",
    badge: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    label: "Medium",
    countColor: "text-yellow-400",
    hover: "hover:border-yellow-500/40",
    glow: "hover:shadow-yellow-500/10",
  },
};

// Update this list as you add more videos to public/videos/
const SAMPLE_VIDEOS = ["/videos/1.mp4", "/videos/2.mp4", "/videos/3.mp4"];

function getVideoSrc(seed: number) {
  return SAMPLE_VIDEOS[seed % SAMPLE_VIDEOS.length];
}

function getFakeVideo(seed: number) {
  const userId = 1000 + seed * 13;
  const mins = 1 + (seed % 4);
  const secs = 5 + ((seed * 7) % 55);
  return { userId, mins, secs };
}

type Issue = typeof issues[number];

// Session Search data
const allTags = [
  "Checkout",
  "Big Purchase",
  "Subscription",
  "Product Page",
  "Creator Store",
  "Digital Download",
  "Payment Failed",
  "Onboarding",
  "Community Join",
  "Free Trial",
  "Upgrade Plan",
  "Mobile",
];

const sessionVideos = [
  { id: 1, title: "User completes $299 course purchase", duration: "2:14", tags: ["Big Purchase", "Checkout"], videoIdx: 0 },
  { id: 2, title: "New creator sets up their store", duration: "3:41", tags: ["Creator Store", "Onboarding"], videoIdx: 1 },
  { id: 3, title: "User downloads digital product after purchase", duration: "1:08", tags: ["Digital Download", "Checkout"], videoIdx: 2 },
  { id: 4, title: "Subscription renewal — user upgrades plan", duration: "1:55", tags: ["Subscription", "Upgrade Plan"], videoIdx: 0 },
  { id: 5, title: "Payment declined on $499 software bundle", duration: "0:47", tags: ["Payment Failed", "Big Purchase"], videoIdx: 1 },
  { id: 6, title: "User joins private community after buying access", duration: "2:33", tags: ["Community Join", "Checkout"], videoIdx: 2 },
  { id: 7, title: "Free trial start — user explores dashboard", duration: "4:02", tags: ["Free Trial", "Onboarding"], videoIdx: 0 },
  { id: 8, title: "User browses product page for 8 minutes", duration: "8:11", tags: ["Product Page"], videoIdx: 1 },
  { id: 9, title: "Mobile checkout — buys $99 template pack", duration: "1:22", tags: ["Mobile", "Checkout", "Big Purchase"], videoIdx: 2 },
  { id: 10, title: "User upgrades from free to Pro plan", duration: "1:49", tags: ["Upgrade Plan", "Subscription"], videoIdx: 0 },
  { id: 11, title: "Creator publishes first digital product", duration: "5:17", tags: ["Creator Store", "Digital Download"], videoIdx: 1 },
  { id: 12, title: "User fails to complete onboarding — drops off", duration: "0:38", tags: ["Onboarding", "Payment Failed"], videoIdx: 2 },
  { id: 13, title: "Bulk purchase of 3 courses in one session", duration: "3:05", tags: ["Big Purchase", "Checkout"], videoIdx: 0 },
  { id: 14, title: "Community member purchases exclusive drop", duration: "1:17", tags: ["Community Join", "Big Purchase"], videoIdx: 1 },
  { id: 15, title: "User cancels subscription mid-flow", duration: "2:48", tags: ["Subscription"], videoIdx: 2 },
  { id: 16, title: "First-time buyer — mobile product page browse", duration: "6:30", tags: ["Mobile", "Product Page", "Onboarding"], videoIdx: 0 },
  { id: 17, title: "Checkout completes after payment retry", duration: "1:03", tags: ["Payment Failed", "Checkout"], videoIdx: 1 },
  { id: 18, title: "User activates free trial from creator landing page", duration: "2:21", tags: ["Free Trial", "Creator Store"], videoIdx: 2 },
];

const statusOptions = [
  { value: "todo", label: "Todo", icon: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="2 2"/></svg>
  )},
  { value: "in_progress", label: "In Progress", icon: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#f59e0b" strokeWidth="1.5"/><path d="M7 3.5v3.5l2 2" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/></svg>
  )},
  { value: "in_review", label: "In Review", icon: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#8b5cf6" strokeWidth="1.5"/><circle cx="7" cy="7" r="2.5" fill="#8b5cf6"/></svg>
  )},
  { value: "done", label: "Done", icon: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" fill="#22c55e" fillOpacity="0.15" stroke="#22c55e" strokeWidth="1.5"/><path d="M4.5 7l2 2 3-3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { value: "cancelled", label: "Cancelled", icon: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#6b7280" strokeWidth="1.5"/><path d="M5 5l4 4M9 5l-4 4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
  )},
];

const priorityOptions = [
  { value: "urgent", label: "Urgent", icon: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="2" height="10" rx="1" fill="#ef4444"/><rect x="6" y="2" width="2" height="7" rx="1" fill="#ef4444"/><rect x="10" y="2" width="2" height="4" rx="1" fill="#ef4444"/></svg>
  )},
  { value: "high", label: "High", icon: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="2" height="10" rx="1" fill="#f97316"/><rect x="6" y="2" width="2" height="7" rx="1" fill="#f97316"/><rect x="10" y="2" width="2" height="4" rx="1" fill="#f97316" fillOpacity="0.3"/></svg>
  )},
  { value: "medium", label: "Medium", icon: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="2" height="10" rx="1" fill="#f59e0b"/><rect x="6" y="2" width="2" height="7" rx="1" fill="#f59e0b" fillOpacity="0.3"/><rect x="10" y="2" width="2" height="4" rx="1" fill="#f59e0b" fillOpacity="0.3"/></svg>
  )},
  { value: "low", label: "Low", icon: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="2" height="10" rx="1" fill="#6b7280" fillOpacity="0.4"/><rect x="6" y="2" width="2" height="7" rx="1" fill="#6b7280" fillOpacity="0.4"/><rect x="10" y="2" width="2" height="4" rx="1" fill="#6b7280" fillOpacity="0.4"/></svg>
  )},
  { value: "no_priority", label: "No Priority", icon: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="4" cy="7" r="1.2" fill="#6b7280" fillOpacity="0.4"/><circle cx="7" cy="7" r="1.2" fill="#6b7280" fillOpacity="0.4"/><circle cx="10" cy="7" r="1.2" fill="#6b7280" fillOpacity="0.4"/></svg>
  )},
];

const labelOptions = [
  { value: "bug", label: "Bug", color: "bg-red-500" },
  { value: "improvement", label: "Improvement", color: "bg-blue-500" },
  { value: "feature", label: "Feature", color: "bg-green-500" },
  { value: "ux", label: "UX", color: "bg-purple-500" },
  { value: "performance", label: "Performance", color: "bg-orange-500" },
];

const assigneeOptions = [
  { value: "", label: "Assignee" },
  { value: "alex", label: "Alex" },
  { value: "jamie", label: "Jamie" },
  { value: "sam", label: "Sam" },
  { value: "morgan", label: "Morgan" },
];

function PropertyPill({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[11px] text-white/45 hover:text-white/70 hover:bg-white/[0.06] px-2.5 py-1.5 rounded-md transition-all"
    >
      {children}
    </button>
  );
}

// ── Video Detail Modal ──────────────────────────────────────────────────────

type VideoSession = {
  src: string;
  title: string;
  duration: string;
  tags?: string[];
};

const timestampEventPool = [
  [
    { t: 4,  type: "click",   label: "Clicked product hero CTA" },
    { t: 11, type: "error",   label: '"Already joined this" error shown' },
    { t: 18, type: "pause",   label: "User paused — stared at error for 7s" },
    { t: 26, type: "rage",    label: "Rage-clicked Join button ×4" },
    { t: 34, type: "nav",     label: "Navigated back to homepage" },
    { t: 41, type: "drop",    label: "Session ended — tab closed" },
  ],
  [
    { t: 3,  type: "nav",     label: "Opened Create Account tab" },
    { t: 9,  type: "click",   label: "Filled in email field" },
    { t: 17, type: "pause",   label: "Hesitated 12s on password field" },
    { t: 25, type: "error",   label: "No back button visible — user stuck" },
    { t: 31, type: "rage",    label: "Clicked outside modal repeatedly" },
    { t: 38, type: "drop",    label: "Abandoned session" },
  ],
  [
    { t: 2,  type: "nav",     label: "Clicked site logo" },
    { t: 5,  type: "error",   label: "Empty page rendered — no content" },
    { t: 10, type: "pause",   label: "User waited 5s expecting load" },
    { t: 14, type: "nav",     label: "Hit browser back button" },
    { t: 20, type: "click",   label: "Re-clicked logo — same blank page" },
    { t: 27, type: "drop",    label: "Session ended" },
  ],
];

const aiPlayByPlay = [
  [
    { t: 4,  text: "User lands on the product page and immediately clicks the primary CTA — clear purchase intent." },
    { t: 11, text: "Error modal fires: 'Already joined this.' The UI failed to detect their membership state before rendering the Join button." },
    { t: 18, text: "7-second dwell on the error. No secondary CTA, no redirect. The modal offers no path forward." },
    { t: 26, text: "Rage-click pattern detected — user retried the same broken button 4 times. Classic sign of confusion, not malice." },
    { t: 34, text: "User navigates back. They've given up on the current flow but haven't fully abandoned the product yet." },
    { t: 41, text: "Tab closed. Full drop. This user had clear purchase intent — the bug converted them from engaged to lost." },
  ],
  [
    { t: 3,  text: "User opens the account creation flow, likely a new visitor or returning user trying a second account." },
    { t: 9,  text: "Email entered quickly — motivated user. No friction yet." },
    { t: 17, text: "12-second hesitation on the password field. Password requirements likely not visible." },
    { t: 25, text: "User looks for a way out. No back button, no X, no escape. The flow has trapped them." },
    { t: 31, text: "Clicking outside the modal hoping to dismiss it — a standard user expectation. Nothing happens." },
    { t: 38, text: "Session abandoned. 100% of users in this state drop off — this isn't a one-off." },
  ],
  [
    { t: 2,  text: "Logo click — user trying to navigate home or reset their context. A deeply ingrained behaviour." },
    { t: 5,  text: "Blank page rendered. No skeleton, no spinner, no error. The user has no signal the app is alive." },
    { t: 10, text: "5-second wait. User is giving the page a chance to load. It never does." },
    { t: 14, text: "Browser back — user resorted to native navigation after the app gave them nothing." },
    { t: 20, text: "Second attempt on the logo. Users retry once before giving up. Same broken result." },
    { t: 27, text: "Session over. The logo is a trust anchor — when it breaks, it signals the whole product is unreliable." },
  ],
];

const eventTypeStyle: Record<string, string> = {
  click: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
  pause: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  rage:  "bg-orange-500/20 text-orange-400 border-orange-500/30",
  nav:   "bg-violet-500/20 text-violet-400 border-violet-500/30",
  drop:  "bg-white/10 text-white/40 border-white/20",
};

const eventTypeIcon: Record<string, string> = {
  click: "→", error: "!", pause: "⏸", rage: "⚡", nav: "↩", drop: "✕",
};

function VideoDetailModal({ session, seed, onClose }: { session: VideoSession; seed: number; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [activeEvent, setActiveEvent] = useState<number | null>(null);

  const eventSet = timestampEventPool[seed % timestampEventPool.length];
  const playByPlay = aiPlayByPlay[seed % aiPlayByPlay.length];

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
    const onTime = () => setCurrentTime(v.currentTime);
    const onMeta = () => setDuration(v.duration);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  useEffect(() => {
    if (!duration) return;
    const pct = currentTime / duration;
    const realT = pct * 45;
    let last: number | null = null;
    eventSet.forEach((e, i) => { if (e.t <= realT) last = i; });
    setActiveEvent(last);
  }, [currentTime, duration, eventSet]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const seekToEvent = (t: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = (t / 45) * duration;
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm flex flex-col">
      <div className="flex flex-col h-full max-w-[1200px] w-full mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.7 3.7l-1.4-1.4L8 6.6 3.7 2.3 2.3 3.7 6.6 8l-3.3 3.3 1.4 1.4L8 9.4l3.3 3.3 1.4-1.4L9.4 8z"/>
              </svg>
            </button>
            <p className="text-sm text-white/65 truncate max-w-lg">{session.title}</p>
          </div>
          {session.tags && (
            <div className="flex gap-1.5">
              {session.tags.map((tag) => (
                <span key={tag} className="text-[10px] text-white/35 border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Main layout */}
        <div className="flex flex-1 gap-0 min-h-0">

          {/* Left: video + timeline */}
          <div className="flex flex-col flex-1 min-w-0 p-6 pr-4">
            <div
              className="relative flex-1 bg-black rounded-xl overflow-hidden cursor-pointer min-h-0"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src={session.src}
                muted
                loop
                playsInline
                className="w-full h-full object-contain"
              />
              {!playing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
                      <path d="M4 2.5l10 6.5-10 6.5V2.5z"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="mt-4 flex-shrink-0">
              <div
                className="relative h-2 bg-white/10 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  if (videoRef.current) videoRef.current.currentTime = pct * (videoRef.current.duration || 0);
                }}
              >
                <div className="absolute top-0 left-0 h-full bg-violet-500 rounded-full" style={{ width: `${progressPct}%` }} />
                {eventSet.map((ev, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); seekToEvent(ev.t); }}
                    title={ev.label}
                    style={{ left: `${(ev.t / 45) * 100}%`, top: "50%", transform: "translate(-50%, -50%)" }}
                    className={`absolute w-3 h-3 rounded-full border-2 border-[#0a0a0a] transition-transform hover:scale-125 z-10 ${ev.type === "error" || ev.type === "rage" || ev.type === "drop" ? "bg-red-500" : ev.type === "pause" ? "bg-yellow-500" : ev.type === "nav" ? "bg-violet-500" : "bg-blue-500"}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-white/25 font-mono">
                  {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-white/25 font-mono">{session.duration}</span>
              </div>
            </div>
          </div>

          {/* Right: AI play-by-play */}
          <div className="w-[340px] flex-shrink-0 flex flex-col border-l border-white/[0.06] p-5 min-h-0">
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
              <div className="w-5 h-5 rounded bg-violet-600/30 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1L6.2 3.8H9L6.8 5.6l.8 2.6L5 6.8 2.4 8.2l.8-2.6L1 3.8h2.8L5 1z" fill="#a78bfa"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-white/60">AI Play-by-Play</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {playByPlay.map((event, i) => {
                const ev = eventSet[i];
                const isActive = activeEvent === i;
                return (
                  <button
                    key={i}
                    onClick={() => seekToEvent(ev.t)}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${
                      isActive
                        ? "bg-violet-500/10 border-violet-500/30"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${eventTypeStyle[ev.type]}`}>
                        {eventTypeIcon[ev.type]} {ev.type.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-white/30 font-mono">0:{String(ev.t).padStart(2, "0")}</span>
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />}
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">{event.text}</p>
                  </button>
                );
              })}
            </div>

            {/* Stats strip */}
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex-shrink-0 grid grid-cols-3 gap-2">
              {[
                { label: "Duration", value: session.duration },
                { label: "Events", value: String(eventSet.length) },
                { label: "Outcome", value: "Drop" },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.03] rounded-lg p-2 text-center">
                  <p className="text-xs font-semibold text-white/70">{s.value}</p>
                  <p className="text-[9px] text-white/30 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Create Ticket Modal ─────────────────────────────────────────────────────

function CreateTicketModal({ issue, onClose }: { issue: Issue; onClose: () => void }) {
  const [title, setTitle] = useState(issue.title);
  const [problem, setProblem] = useState(issue.description);
  const [fix, setFix] = useState(issue.suggestedFix);
  const [priority, setPriority] = useState(issue.severity === "critical" ? "urgent" : "medium");
  const [status, setStatus] = useState("todo");
  const [label, setLabel] = useState("bug");
  const [assignee, setAssignee] = useState("");

  const currentStatus = statusOptions.find((s) => s.value === status)!;
  const currentPriority = priorityOptions.find((p) => p.value === priority)!;
  const currentLabel = labelOptions.find((l) => l.value === label)!;
  const currentAssignee = assigneeOptions.find((a) => a.value === assignee)!;

  const cycleStatus = () => {
    const idx = statusOptions.findIndex((s) => s.value === status);
    setStatus(statusOptions[(idx + 1) % statusOptions.length].value);
  };
  const cyclePriority = () => {
    const idx = priorityOptions.findIndex((p) => p.value === priority);
    setPriority(priorityOptions[(idx + 1) % priorityOptions.length].value);
  };
  const cycleLabel = () => {
    const idx = labelOptions.findIndex((l) => l.value === label);
    setLabel(labelOptions[(idx + 1) % labelOptions.length].value);
  };
  const cycleAssignee = () => {
    const idx = assigneeOptions.findIndex((a) => a.value === assignee);
    setAssignee(assigneeOptions[(idx + 1) % assigneeOptions.length].value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#161618] border border-white/[0.09] rounded-xl w-full max-w-2xl mx-4 shadow-2xl shadow-black/60 flex flex-col">
        {/* Header breadcrumb */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <span className="text-white/50 font-medium">Whop</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>New Issue</span>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors p-1 rounded">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
              <path d="M11.7 3.7l-1.4-1.4L7 5.6 3.7 2.3 2.3 3.7 5.6 7l-3.3 3.3 1.4 1.4L7 8.4l3.3 3.3 1.4-1.4L8.4 7z" />
            </svg>
          </button>
        </div>

        {/* Title input */}
        <div className="px-5 pt-1 pb-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-white/90 text-[17px] font-semibold placeholder-white/18 outline-none border-none leading-snug"
            placeholder="Issue title"
            autoFocus
          />
        </div>

        {/* Problem field */}
        <div className="px-5 pt-3">
          <p className="text-[10px] font-medium text-white/25 uppercase tracking-widest mb-1.5">What's broken</p>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={3}
            className="w-full bg-transparent text-[13px] text-white/50 placeholder-white/20 outline-none border-none resize-none leading-relaxed"
            placeholder="Describe what's going wrong for users…"
          />
        </div>

        <div className="h-px bg-white/[0.05] mx-5" />

        {/* Fix field */}
        <div className="px-5 pt-3 pb-2">
          <p className="text-[10px] font-medium text-white/25 uppercase tracking-widest mb-1.5">How to fix it</p>
          <textarea
            value={fix}
            onChange={(e) => setFix(e.target.value)}
            rows={3}
            className="w-full bg-transparent text-[13px] text-white/50 placeholder-white/20 outline-none border-none resize-none leading-relaxed"
            placeholder="Describe the proposed solution…"
          />
        </div>

        <div className="h-px bg-white/[0.06] mx-5" />

        {/* Properties toolbar */}
        <div className="flex items-center gap-0.5 px-3 py-2">
          <PropertyPill onClick={cycleStatus}>
            {currentStatus.icon}
            <span>{currentStatus.label}</span>
          </PropertyPill>
          <PropertyPill onClick={cyclePriority}>
            {currentPriority.icon}
            <span>{currentPriority.label}</span>
          </PropertyPill>
          <PropertyPill onClick={cycleAssignee}>
            <div className="w-3.5 h-3.5 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-white/50">
              {currentAssignee.value ? currentAssignee.label[0] : (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M1.5 8c0-1.657 1.343-3 3-3s3 1.343 3 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
              )}
            </div>
            <span>{currentAssignee.value ? currentAssignee.label : "Assignee"}</span>
          </PropertyPill>
          <PropertyPill onClick={cycleLabel}>
            <div className={`w-2 h-2 rounded-full ${currentLabel.color}`} />
            <span>{currentLabel.label}</span>
          </PropertyPill>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="text-xs text-white/35 hover:text-white/60 transition-colors px-3 py-1.5 rounded-md hover:bg-white/[0.04]"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="text-xs font-medium bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white px-4 py-1.5 rounded-md transition-colors"
          >
            Create issue
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"issues" | "search">("issues");
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [ticketIssue, setTicketIssue] = useState<Issue | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ session: VideoSession; seed: number } | null>(null);
  const [panelSearch, setPanelSearch] = useState("");
  const [panelTag, setPanelTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const videoGridRef = useRef<HTMLDivElement>(null);

  const filteredSessions = sessionVideos.filter((s) => {
    const matchesTag = !activeTagFilter || s.tags.includes(activeTagFilter);
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || s.title.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q));
    return matchesTag && matchesSearch;
  });

  useEffect(() => {
    if (!panelVisible) return;
    // Wait for the panel transition to finish, then force-play all videos
    const timer = setTimeout(() => {
      videoGridRef.current?.querySelectorAll("video").forEach((v) => {
        v.currentTime = 0;
        v.play().catch(() => {});
      });
    }, 320);
    return () => clearTimeout(timer);
  }, [panelVisible, selectedIssue]);

  const handleIssueClick = (id: number) => {
    if (selectedIssue === id && panelVisible) {
      setPanelVisible(false);
      setTimeout(() => setSelectedIssue(null), 300);
    } else {
      setSelectedIssue(id);
      setPanelVisible(true);
      setPanelSearch("");
      setPanelTag(null);
    }
  };

  const selected = issues.find((i) => i.id === selectedIssue);

  return (
    <div className="h-screen overflow-hidden bg-[#0d0d0d] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 py-4">
            <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5" stroke="white" strokeWidth="1.5" />
                <circle cx="7" cy="7" r="2" fill="white" />
              </svg>
            </div>
            <span className="font-semibold text-sm tracking-wide text-white/90">UIScope</span>
          </div>
          {/* Tabs */}
          <nav className="flex items-end gap-1 h-full">
            {(["issues", "search"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-3.5 text-xs font-medium border-b-2 transition-all ${
                  activeTab === tab
                    ? "border-violet-500 text-white/90"
                    : "border-transparent text-white/35 hover:text-white/60"
                }`}
              >
                {tab === "issues" ? "UI Issues" : "Session Search"}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-full">
            Whop · Production
          </span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div
          className={`flex-1 overflow-auto transition-all duration-300 ${panelVisible ? "pr-0" : ""}`}
        >
        {activeTab === "search" && (
          <div className="px-6 py-8">
            {/* Search bar */}
            <div className="relative mb-6 max-w-2xl">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sessions… e.g. checkout, purchase, mobile"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white/80 placeholder-white/25 outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>

            {/* Tag filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    activeTagFilter === tag
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-white/[0.03] border-white/[0.08] text-white/45 hover:text-white/70 hover:border-white/20"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Results count */}
            <p className="text-xs text-white/25 mb-4">
              {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""}
              {activeTagFilter ? ` tagged "${activeTagFilter}"` : ""}
              {searchQuery ? ` matching "${searchQuery}"` : ""}
            </p>

            {/* Video grid */}
            {filteredSessions.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {filteredSessions.map((session) => {
                  const src = SAMPLE_VIDEOS[session.videoIdx % SAMPLE_VIDEOS.length];
                  return (
                    <div key={session.id} className="group cursor-pointer">
                      <div
                        className="relative rounded-xl overflow-hidden aspect-video bg-[#111] mb-2.5"
                        onClick={() => setActiveVideo({
                          session: { src, title: session.title, duration: session.duration, tags: session.tags },
                          seed: session.videoIdx,
                        })}
                      >
                        <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="white"><path d="M2.5 1.5l7 4.5-7 4.5V1.5z"/></svg>
                          </div>
                        </div>
                        {/* Duration badge */}
                        <div className="absolute bottom-2 right-2 text-[10px] text-white/70 bg-black/60 px-1.5 py-0.5 rounded font-mono">
                          {session.duration}
                        </div>
                      </div>
                      <p className="text-xs text-white/70 font-medium leading-snug mb-1.5 group-hover:text-white/90 transition-colors">
                        {session.title}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {session.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                              activeTagFilter === tag
                                ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                                : "bg-white/[0.04] border-white/[0.07] text-white/30 hover:text-white/50"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-white/20 text-sm mb-1">No sessions found</p>
                <p className="text-white/12 text-xs">Try a different search or clear the tag filter</p>
              </div>
            )}
          </div>
        )}
        {activeTab === "issues" && (
          <div className="px-6 py-8 max-w-4xl">
            {/* Page title */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold text-white/90">
                  UI Issues
                </h1>
                <span className="text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                  {issues.length} active
                </span>
              </div>
              <p className="text-sm text-white/35">
                AI-detected friction points from real user sessions
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { label: "Sessions analyzed", value: "38,291" },
                { label: "Users affected", value: "5,177" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3"
                >
                  <p className="text-xs text-white/35 mb-1">{s.label}</p>
                  <p className="text-lg font-semibold text-white/80">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Issues list */}
            <div className="space-y-3">
              {issues.map((issue) => {
                const cfg =
                  severityConfig[issue.severity as keyof typeof severityConfig];
                const isSelected = selectedIssue === issue.id && panelVisible;

                return (
                  <button
                    key={issue.id}
                    onClick={() => handleIssueClick(issue.id)}
                    className={`w-full text-left bg-white/[0.03] border rounded-xl px-5 py-4 transition-all duration-200 cursor-pointer
                      ${isSelected ? "border-violet-500/50 bg-violet-500/[0.05] shadow-lg shadow-violet-500/10" : `border-white/[0.07] ${cfg.hover} hover:bg-white/[0.04] hover:shadow-lg ${cfg.glow}`}
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white/85 mb-1 truncate">
                            {issue.title}
                          </p>
                          <p className="text-xs text-white/35 leading-relaxed line-clamp-2">
                            {issue.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2.5">
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}
                            >
                              {cfg.label}
                            </span>
                            <span className="text-[10px] text-white/20 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                              {issue.tag}
                            </span>
                            <span className="text-[10px] text-white/20 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                              New Feature
                            </span>
                            <span className="text-[10px] text-white/25">
                              Last seen {issue.last_seen}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-start gap-5">
                        <div className="flex gap-5 text-right">
                          <div>
                            <p className={`text-xl font-bold ${cfg.countColor}`}>
                              {issue.users.toLocaleString()}
                            </p>
                            <p className="text-[11px] text-white/30">users</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-white/60">
                              {issue.sessions.toLocaleString()}
                            </p>
                            <p className="text-[11px] text-white/30">sessions</p>
                          </div>
                          <div>
                            <p className={`text-xl font-bold ${cfg.countColor}`}>
                              {issue.dropRate}
                            </p>
                            <p className="text-[11px] text-white/30">drop-off</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setTicketIssue(issue); }}
                          className="flex-shrink-0 text-[11px] font-medium text-white/50 hover:text-white/90 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] hover:border-white/[0.15] px-3 py-1.5 rounded-lg transition-all"
                        >
                          Create Ticket
                        </button>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        )}
        </div>

        {/* Side panel — only on issues tab */}
        <div
          className={`border-l border-white/[0.06] bg-[#0a0a0a] flex flex-col transition-all duration-300 ease-in-out overflow-hidden
            ${panelVisible ? "w-[600px] opacity-100" : "w-0 opacity-0"}
          `}
        >
          {selected && panelVisible && (() => {
            const panelSessions = Array.from({ length: 36 }, (_, i) => {
              const globalSeed = i + selected.id * 36;
              const v = getFakeVideo(globalSeed);
              const src = getVideoSrc(globalSeed);
              const seed = globalSeed % 3;
              const tagPool = [allTags[globalSeed % allTags.length], allTags[(globalSeed + 3) % allTags.length]];
              const title = sessionVideos[globalSeed % sessionVideos.length].title;
              return { i, v, src, seed, tagPool, title };
            });

            const filteredPanel = panelSessions.filter(({ title, tagPool }) => {
              const q = panelSearch.toLowerCase();
              const matchesSearch = !q || title.toLowerCase().includes(q) || tagPool.some(t => t.toLowerCase().includes(q));
              const matchesTag = !panelTag || tagPool.includes(panelTag);
              return matchesSearch && matchesTag;
            });

            return (
            <div className="flex flex-col h-full w-[600px]">
              {/* Header: title + close */}
              <div className="px-4 pt-3 pb-2 border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white/40 truncate pr-4">{selected.title}</p>
                  <button
                    onClick={() => { setPanelVisible(false); setTimeout(() => setSelectedIssue(null), 300); }}
                    className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <path d="M11.7 3.7l-1.4-1.4L7 5.6 3.7 2.3 2.3 3.7 5.6 7l-3.3 3.3 1.4 1.4L7 8.4l3.3 3.3 1.4-1.4L8.4 7z" />
                    </svg>
                  </button>
                </div>
                {/* Search */}
                <div className="relative mb-2">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text"
                    value={panelSearch}
                    onChange={(e) => setPanelSearch(e.target.value)}
                    placeholder="Search sessions…"
                    className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-white/70 placeholder-white/20 outline-none focus:border-violet-500/40 transition-colors"
                  />
                </div>
                {/* Tag filters */}
                <div className="flex flex-wrap gap-1 pb-1">
                  {allTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setPanelTag(panelTag === tag ? null : tag)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                        panelTag === tag
                          ? "bg-violet-600 border-violet-500 text-white"
                          : "bg-white/[0.03] border-white/[0.07] text-white/35 hover:text-white/60"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable video grid */}
              <div className="flex-1 overflow-y-auto p-3">
                {filteredPanel.length > 0 ? (
                <div ref={videoGridRef} className="grid grid-cols-2 gap-2">
                  {filteredPanel.map(({ i, v, src, seed, tagPool, title }) => (
                    <div key={i} className="group cursor-pointer">
                      <div
                        className="relative rounded-md overflow-hidden aspect-video bg-[#111]"
                        onClick={() => setActiveVideo({
                          session: { src, title, duration: `${v.mins}:${String(v.secs).padStart(2,"0")}`, tags: tagPool },
                          seed,
                        })}
                      >
                        <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><path d="M2 1.5l6 3.5-6 3.5V1.5z"/></svg>
                          </div>
                        </div>
                        <div className="absolute bottom-1.5 right-1.5 text-[9px] text-white/40 bg-black/50 px-1.5 py-0.5 rounded">
                          {v.mins}:{String(v.secs).padStart(2, "0")}
                        </div>
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {tagPool.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setPanelTag(panelTag === tag ? null : tag)}
                            className={`text-[9px] px-1.5 py-0.5 rounded-full border transition-all ${
                              panelTag === tag
                                ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                                : "bg-white/[0.03] border-white/[0.06] text-white/25 hover:text-white/50"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-xs text-white/20">No sessions match</p>
                  </div>
                )}
              </div>
            </div>
            );
          })()}
        </div>
      </div>

      {/* Ticket modal */}
      {ticketIssue && (
        <CreateTicketModal issue={ticketIssue} onClose={() => setTicketIssue(null)} />
      )}

      {/* Video detail modal */}
      {activeVideo && (
        <VideoDetailModal
          session={activeVideo.session}
          seed={activeVideo.seed}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}
