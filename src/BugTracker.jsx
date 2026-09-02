import React, { useState, useEffect, useMemo, useCallback } from "react";

/* Set VITE_API_URL in .env.local. Unset = sample data mode. */
const API_URL = import.meta.env.VITE_API_URL || "";

/* ------------------------------------------------------------------ styles */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

/* Neutralise whatever the host page brings with it. Vite's template CSS
   centres text, constrains #root and forces its own background. */
html { color-scheme:dark; }
body { margin:0; padding:0; background:#0f1219; text-align:left; display:block; }
#root { max-width:none; width:auto; margin:0; padding:0; text-align:left; display:block; }

.bt {
  --bg:#0f1219; --surface:#171b25; --raised:#1d2230; --line:#2a3040; --line2:#39415a;
  --fg:#dfe4f0; --fg2:#98a1b8; --fg3:#69728a;
  --blocker:#f2555a; --high:#e8913a; --medium:#4aa8d8; --low:#6b7488;
  --ok:#59c98b; --wip:#a371f7; --wait:#4aa8d8;
  background:var(--bg); color:var(--fg); min-height:100vh; width:100%;
  text-align:left; letter-spacing:0;
  font:400 14px/1.55 Inter, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing:antialiased;
}
.bt *, .bt *::before, .bt *::after { box-sizing:border-box; }
.bt button, .bt input, .bt select, .bt textarea { font:inherit; color:inherit; }
.bt :focus-visible { outline:2px solid var(--wip); outline-offset:1px; }
.mono { font-family:'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-variant-ligatures:none; font-variant-numeric:tabular-nums; }

.bt-shell { max-width:1180px; margin:0 auto; padding:0 20px 80px; }

/* ---- status bar ---- */
.bt-bar { display:flex; align-items:center; gap:20px; flex-wrap:wrap;
  padding:14px 0 13px; border-bottom:1px solid var(--line); margin-bottom:0; }
.bt-logo { font-family:'JetBrains Mono', monospace; font-weight:700; font-size:15px;
  letter-spacing:-0.02em; color:var(--fg); margin:0; }
.bt-logo i { color:var(--blocker); font-style:normal; }
.bt-caret { display:inline-block; width:7px; height:15px; background:var(--wip);
  margin-left:3px; vertical-align:-2px; }
.bt-stats { display:flex; gap:16px; flex:1 1 auto; flex-wrap:wrap; }
.bt-stat { font-family:'JetBrains Mono', monospace; font-size:12.5px; color:var(--fg3);
  display:flex; align-items:center; gap:6px; }
.bt-stat b { color:var(--fg); font-weight:500; }
.bt-stat[data-hot="1"] b { color:var(--blocker); }
.bt-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }
.bt-tools { display:flex; gap:8px; }

/* ---- tabs ---- */
.bt-tabs { display:flex; gap:2px; border-bottom:1px solid var(--line);
  overflow-x:auto; margin-bottom:0; }
.bt-tab { background:none; border:0; border-bottom:2px solid transparent;
  padding:11px 14px; cursor:pointer; color:var(--fg3); white-space:nowrap;
  font-size:13px; font-weight:500; display:flex; gap:8px; align-items:center; }
.bt-tab:hover { color:var(--fg2); }
.bt-tab[data-on="1"] { color:var(--fg); border-bottom-color:var(--wip); }
.bt-tab em { font-family:'JetBrains Mono', monospace; font-style:normal;
  font-size:11.5px; color:var(--fg3); background:var(--surface);
  padding:1px 6px; border-radius:9px; }
.bt-tab[data-on="1"] em { color:var(--fg); background:var(--raised); }

/* ---- rows ---- */
.bt-row { display:grid; grid-template-columns:78px 92px 1fr auto; gap:14px;
  align-items:center; width:100%; text-align:left; background:none;
  border:0; border-bottom:1px solid var(--line); padding:11px 12px 11px 10px;
  cursor:pointer; border-left:2px solid transparent; }
.bt-row:hover { background:var(--surface); }
.bt-row[data-open="1"] { background:var(--surface); border-left-color:var(--wip); }
@media (max-width:720px) {
  .bt-row { grid-template-columns:78px 1fr; row-gap:6px; }
  .bt-row .bt-id { grid-row:1; }
  .bt-row .bt-title { grid-column:1 / -1; }
  .bt-row .bt-right { grid-column:1 / -1; justify-content:flex-start; }
}

.bt-sev { font-family:'JetBrains Mono', monospace; font-size:10.5px; font-weight:700;
  letter-spacing:0.06em; padding:2px 0; text-align:center; border-radius:2px;
  border:1px solid currentColor; }
.bt-sev[data-s="Blocker"] { color:var(--blocker); }
.bt-sev[data-s="High"]    { color:var(--high); }
.bt-sev[data-s="Medium"]  { color:var(--medium); }
.bt-sev[data-s="Low"]     { color:var(--low); }

.bt-id { font-family:'JetBrains Mono', monospace; font-size:12.5px; color:var(--fg3); }
.bt-title { font-size:14px; color:var(--fg); font-weight:450;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.bt-title s { text-decoration:none; color:var(--fg3); font-family:'JetBrains Mono', monospace;
  font-size:12px; margin-right:9px; }
.bt-right { display:flex; align-items:center; gap:14px; justify-content:flex-end; }
.bt-state { font-size:12px; color:var(--fg2); display:flex; align-items:center; gap:6px;
  white-space:nowrap; }
.bt-age { font-family:'JetBrains Mono', monospace; font-size:11.5px; color:var(--fg3);
  white-space:nowrap; }
.bt-age[data-late="1"] { color:var(--blocker); }
.bt-age[data-late="soon"] { color:var(--high); }
.bt-closed .bt-title, .bt-closed .bt-id { opacity:.5; }

/* ---- detail ---- */
.bt-detail { border-bottom:1px solid var(--line); border-left:2px solid var(--wip);
  background:var(--surface); padding:16px 20px 22px; }
.bt-desc { color:var(--fg2); font-size:13.5px; margin:0 0 18px; max-width:78ch;
  white-space:pre-wrap; }
.bt-facts { display:flex; gap:20px; flex-wrap:wrap; margin:0 0 18px;
  font-family:'JetBrains Mono', monospace; font-size:11.5px; color:var(--fg3); }
.bt-facts b { color:var(--fg2); font-weight:400; }

.bt-log { margin:0 0 20px; max-height:300px; overflow-y:auto; padding-right:6px; }
.bt-line { display:grid; grid-template-columns:132px 1fr; gap:14px; padding:7px 0;
  border-top:1px solid var(--line); }
.bt-line:first-child { border-top:0; }
.bt-when { font-family:'JetBrains Mono', monospace; font-size:11.5px; color:var(--fg3);
  padding-top:2px; }
.bt-said { margin:0; font-size:13.5px; color:var(--fg); white-space:pre-wrap; max-width:78ch; }
.bt-by { font-size:12px; color:var(--fg2); margin-bottom:2px; }
.bt-by u { text-decoration:none; color:var(--fg); font-weight:500; }
.bt-by i { font-style:normal; color:var(--fg3); }
.bt-shift { font-family:'JetBrains Mono', monospace; font-size:11.5px;
  color:var(--wip); margin-top:3px; }

/* ---- forms ---- */
.bt-form { display:flex; flex-direction:column; gap:12px; max-width:660px; }
.bt-grid { display:flex; gap:12px; flex-wrap:wrap; }
.bt-field { display:flex; flex-direction:column; gap:5px; flex:1 1 165px; }
.bt-lab { font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--fg3);
  letter-spacing:0.03em; }
.bt-in, .bt-ta, .bt-sel { background:var(--bg); border:1px solid var(--line2);
  border-radius:3px; padding:8px 10px; width:100%; color:var(--fg); font-size:13.5px; }
.bt-ta { min-height:80px; resize:vertical; line-height:1.55; font-family:inherit; }
.bt-in:focus, .bt-ta:focus, .bt-sel:focus { border-color:var(--wip); outline:none; }
.bt-in::placeholder, .bt-ta::placeholder { color:var(--fg3); }
.bt-sel option { background:var(--raised); color:var(--fg); }

.bt-btn { background:var(--wip); color:#0f1219; border:1px solid var(--wip);
  padding:8px 15px; border-radius:3px; cursor:pointer; font-weight:600; font-size:13px;
  line-height:1.4; }
.bt-btn:hover:not(:disabled) { background:#b184f8; border-color:#b184f8; }
.bt-btn:disabled { background:transparent; border-color:var(--line2); color:var(--fg3);
  cursor:not-allowed; }
.bt-btn-q { background:transparent; color:var(--fg2); border:1px solid var(--line2);
  font-weight:500; }
.bt-btn-q:hover { background:var(--raised); color:var(--fg); }

.bt-act { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
.bt-hint { font-family:'JetBrains Mono', monospace; font-size:11.5px; color:var(--fg3); }
.bt-err { font-family:'JetBrains Mono', monospace; font-size:11.5px; color:var(--blocker); }

.bt-new { border-bottom:1px solid var(--line); background:var(--surface);
  padding:18px 20px 22px; }

/* ---- empty ---- */
.bt-blank { padding:60px 12px 70px; max-width:56ch; }
.bt-blank p { font-family:'JetBrains Mono', monospace; font-size:13px; color:var(--fg3);
  margin:0 0 10px; }
.bt-blank strong { display:block; font-size:16px; font-weight:600; color:var(--fg);
  margin-bottom:8px; font-family:Inter, sans-serif; }

@media (prefers-reduced-motion:no-preference) {
  .bt-row, .bt-tab, .bt-btn { transition:background-color .1s linear, color .1s linear; }
}
`;

/* -------------------------------------------------------------- sample data */

const TODAY = new Date().toISOString().slice(0, 10);
const shift = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const DEMO_META = {
  statuses: ["New", "Reported to vendor", "Awaiting vendor", "Needs my action",
             "In progress", "Verifying fix", "Closed", "Won't fix"],
  severities: ["Blocker", "High", "Medium", "Low"],
  closed: ["Closed", "Won't fix"],
  staleDays: 7,
  minNote: 15,
  today: TODAY,
};

const DEMO_TICKETS = [
  { id: "TKT-004", system: "FileMaker", title: "Nightly backup fails every Sunday",
    description: "Scheduled backup errors out with a lock timeout. Only Sundays, when the reindex job overlaps.",
    severity: "High", status: "Awaiting vendor", vendor_ref: "CS-88214", vendor_contact: "Dana R.",
    reported_date: shift(-22), next_followup: shift(-4), last_update: shift(-11), created_by: "Hunter", closed_date: "" },
  { id: "TKT-007", system: "ShipStation", title: "Freight quotes missing on split shipments",
    description: "When an order splits across two trailers the second leg comes back with no rate.",
    severity: "Blocker", status: "Reported to vendor", vendor_ref: "SS-40912", vendor_contact: "Support queue",
    reported_date: shift(-9), next_followup: shift(-1), last_update: shift(-3), created_by: "Hunter", closed_date: "" },
  { id: "TKT-011", system: "Kleos ERP", title: "Panel length rounds down on metric orders",
    description: "Rounding happens at the quote stage, so the cut list is short by up to 12mm.",
    severity: "High", status: "In progress", vendor_ref: "", vendor_contact: "",
    reported_date: shift(-5), next_followup: TODAY, last_update: shift(-1), created_by: "Hunter", closed_date: "" },
  { id: "TKT-012", system: "Sage 50", title: "Purchase order sync drops line notes",
    description: "Line-level notes vanish after the nightly sync. Vendor says it is by design, pushing back.",
    severity: "Medium", status: "Awaiting vendor", vendor_ref: "SG-7731", vendor_contact: "Marcus P.",
    reported_date: shift(-14), next_followup: shift(3), last_update: shift(-2), created_by: "Hunter", closed_date: "" },
  { id: "TKT-013", system: "Ubiquiti", title: "Shop floor AP drops clients under load",
    description: "Tablets on the cut line lose association when more than nine devices associate.",
    severity: "Medium", status: "Needs my action", vendor_ref: "", vendor_contact: "",
    reported_date: shift(-3), next_followup: shift(1), last_update: shift(-3), created_by: "Hunter", closed_date: "" },
  { id: "TKT-002", system: "FileMaker", title: "SSL renewal broke the WebDirect login",
    description: "Certificate chain was incomplete after the win-acme renewal.",
    severity: "Blocker", status: "Closed", vendor_ref: "CS-87001", vendor_contact: "Dana R.",
    reported_date: shift(-40), next_followup: "", last_update: shift(-31), created_by: "Hunter", closed_date: shift(-31) },
];

const DEMO_UPDATES = [
  { update_id: "a1", ticket_id: "TKT-004", timestamp: shift(-22) + " 09:14", author: "Hunter",
    type: "Opened", body: "Opened with vendor support, sent the Event Viewer export.", new_status: "Reported to vendor" },
  { update_id: "a2", ticket_id: "TKT-004", timestamp: shift(-11) + " 16:02", author: "Hunter",
    type: "Vendor response", body: "Dana says engineering reproduced it and it is queued for the next patch. No date given.", new_status: "Awaiting vendor" },
  { update_id: "b1", ticket_id: "TKT-007", timestamp: shift(-9) + " 11:30", author: "Hunter",
    type: "Opened", body: "Logged with screenshots of both legs and the rate response.", new_status: "Reported to vendor" },
  { update_id: "b2", ticket_id: "TKT-007", timestamp: shift(-3) + " 08:45", author: "Renee",
    type: "Comment", body: "This is holding up two dealer orders. Worth escalating if we do not hear back this week.", new_status: "" },
  { update_id: "c1", ticket_id: "TKT-011", timestamp: shift(-1) + " 14:20", author: "Hunter",
    type: "Note", body: "Traced it to the quote rounding helper, not the cut list generator. Fix is in a branch.", new_status: "In progress" },
];

/* ---------------------------------------------------------------- helpers */

const daysAgo = (iso, today) =>
  !iso ? null : Math.round((new Date(today + "T12:00:00") - new Date(iso + "T12:00:00")) / 86400000);

function urgencyOf(t, meta) {
  if (meta.closed.includes(t.status)) return "closed";
  const f = (t.next_followup || "").trim();
  if (f && f < meta.today) return "overdue";
  if (f && f === meta.today) return "today";
  const age = daysAgo(t.last_update, meta.today);
  if (age !== null && age >= meta.staleDays) return "overdue";
  if (t.status === "Awaiting vendor" || t.status === "Reported to vendor") return "waiting";
  return "ok";
}

const STATE_COLOR = {
  "New": "var(--fg3)",
  "Reported to vendor": "var(--wait)",
  "Awaiting vendor": "var(--wait)",
  "Needs my action": "var(--high)",
  "In progress": "var(--wip)",
  "Verifying fix": "var(--wip)",
  "Closed": "var(--ok)",
  "Won't fix": "var(--fg3)",
};

function ageLabel(t, meta, urgency) {
  if (urgency === "closed") return { text: "closed", late: "0" };
  const f = (t.next_followup || "").trim();
  if (f && f < meta.today) {
    const d = daysAgo(f, meta.today);
    return { text: `${d}d overdue`, late: "1" };
  }
  if (f && f === meta.today) return { text: "due today", late: "soon" };
  const age = daysAgo(t.last_update, meta.today);
  return { text: age === 0 ? "updated today" : `${age}d quiet`, late: "0" };
}

/* -------------------------------------------------------------------- app */

export default function BugTracker() {
  const accessKey = useMemo(() => {
    try { return new URLSearchParams(window.location.search).get("k") || ""; }
    catch { return ""; }
  }, []);

  const demo = !API_URL;
  const [user, setUser] = useState(demo ? { name: "Hunter", role: "admin" } : null);
  const [meta, setMeta] = useState(DEMO_META);
  const [tickets, setTickets] = useState(demo ? DEMO_TICKETS : []);
  const [updates, setUpdates] = useState(demo ? DEMO_UPDATES : []);
  const [loading, setLoading] = useState(!demo);
  const [fatal, setFatal] = useState("");
  const [filter, setFilter] = useState("overdue");
  const [openId, setOpenId] = useState(null);
  const [composing, setComposing] = useState(false);
  const [alerts, setAlerts] = useState("unknown");

  const isAdmin = user?.role === "admin";

  const call = useCallback(async (action, payload) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ k: accessKey, action, payload }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Request failed.");
    setTickets(data.tickets);
    setUpdates(data.updates);
    return data;
  }, [accessKey]);

  useEffect(() => {
    if (demo) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}?k=${encodeURIComponent(accessKey)}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);
        setUser(data.user); setMeta(data.meta);
        setTickets(data.tickets); setUpdates(data.updates);
      } catch (err) {
        setFatal(err.message || "Could not reach the backend.");
      } finally { setLoading(false); }
    })();
  }, [demo, accessKey]);

  useEffect(() => {
    try { if ("Notification" in window) setAlerts(Notification.permission); }
    catch { setAlerts("unsupported"); }
  }, []);

  const buckets = useMemo(() => {
    const b = { overdue: [], today: [], waiting: [], open: [], closed: [] };
    tickets.forEach((t) => {
      const u = urgencyOf(t, meta);
      if (u === "closed") { b.closed.push(t); return; }
      b.open.push(t);
      if (u === "overdue") b.overdue.push(t);
      else if (u === "today") b.today.push(t);
      else if (u === "waiting") b.waiting.push(t);
    });
    const rank = { Blocker: 0, High: 1, Medium: 2, Low: 3 };
    Object.values(b).forEach((list) =>
      list.sort((x, y) => (rank[x.severity] ?? 9) - (rank[y.severity] ?? 9)));
    return b;
  }, [tickets, meta]);

  useEffect(() => {
    if (loading || alerts !== "granted" || !buckets.overdue.length) return;
    try {
      new Notification(`${buckets.overdue.length} bug${buckets.overdue.length === 1 ? "" : "s"} overdue`, {
        body: buckets.overdue.slice(0, 3).map((t) => t.title).join("\n"),
        tag: "bugs-" + meta.today,
      });
    } catch { /* blocked, no harm */ }
  }, [loading, alerts, buckets.overdue.length, meta.today]);

  const shown = filter === "all" ? buckets.open : buckets[filter] || [];

  if (loading) return <Frame><div className="bt-blank"><p>connecting…</p></div></Frame>;
  if (fatal) return (
    <Frame>
      <div className="bt-blank">
        <strong>Can't reach the backend</strong>
        <p>{fatal}</p>
        <p>Check your link still ends in <span className="mono">?k=yourkey</span>.</p>
      </div>
    </Frame>
  );

  return (
    <Frame>
      <div className="bt-bar">
        <h1 className="bt-logo">bug<i>.</i>tracker<span className="bt-caret" /></h1>
        <div className="bt-stats">
          <span className="bt-stat" data-hot={buckets.overdue.length ? "1" : "0"}>
            <span className="bt-dot" style={{ color: "var(--blocker)" }} />
            <b>{buckets.overdue.length}</b> overdue
          </span>
          <span className="bt-stat">
            <span className="bt-dot" style={{ color: "var(--high)" }} />
            <b>{buckets.today.length}</b> due today
          </span>
          <span className="bt-stat">
            <span className="bt-dot" style={{ color: "var(--wait)" }} />
            <b>{buckets.open.length}</b> open
          </span>
        </div>
        <div className="bt-tools">
          {alerts === "default" && (
            <button className="bt-btn bt-btn-q" onClick={async () => {
              try { setAlerts(await Notification.requestPermission()); } catch { setAlerts("denied"); }
            }}>Enable alerts</button>
          )}
          {isAdmin && (
            <button className="bt-btn" onClick={() => { setComposing(!composing); setOpenId(null); }}>
              {composing ? "Cancel" : "New bug"}
            </button>
          )}
        </div>
      </div>

      <div className="bt-tabs">
        {[["overdue", "Overdue", buckets.overdue.length],
          ["today", "Due today", buckets.today.length],
          ["waiting", "With vendor", buckets.waiting.length],
          ["all", "All open", buckets.open.length],
          ["closed", "Closed", buckets.closed.length]].map(([key, label, n]) => (
          <button key={key} className="bt-tab" data-on={filter === key ? "1" : "0"}
            onClick={() => { setFilter(key); setOpenId(null); }}>
            {label}<em>{n}</em>
          </button>
        ))}
      </div>

      {composing && isAdmin && (
        <NewTicket meta={meta} onCancel={() => setComposing(false)}
          onSave={async (p) => { await call("createTicket", p); setComposing(false); setFilter("all"); }} />
      )}

      {shown.length === 0 && !composing && (
        <div className="bt-blank">
          {tickets.length === 0 ? (
            <>
              <strong>No bugs logged yet</strong>
              <p>Add the ones you're already chasing. Each needs a follow-up date, and you can't log an update without setting the next one.</p>
              {isAdmin && <button className="bt-btn" onClick={() => setComposing(true)}>New bug</button>}
            </>
          ) : (
            <p>
              {filter === "overdue" ? "Nothing overdue. Everything has a live follow-up date."
                : filter === "closed" ? "No closed bugs yet."
                : "Nothing in this view."}
            </p>
          )}
        </div>
      )}

      {shown.map((t) => {
        const u = urgencyOf(t, meta);
        const open = openId === t.id;
        const age = ageLabel(t, meta, u);
        return (
          <div key={t.id}>
            <button className={"bt-row" + (u === "closed" ? " bt-closed" : "")}
              data-open={open ? "1" : "0"} aria-expanded={open}
              onClick={() => setOpenId(open ? null : t.id)}>
              <span className="bt-sev" data-s={t.severity}>{(t.severity || "").toUpperCase()}</span>
              <span className="bt-id">{t.id}</span>
              <span className="bt-title"><s>{t.system}</s>{t.title}</span>
              <span className="bt-right">
                <span className="bt-state">
                  <span className="bt-dot" style={{ color: STATE_COLOR[t.status] || "var(--fg3)" }} />
                  {t.status}
                </span>
                <span className="bt-age" data-late={age.late}>{age.text}</span>
              </span>
            </button>
            {open && (
              <Detail ticket={t} meta={meta} isAdmin={isAdmin}
                log={updates.filter((x) => x.ticket_id === t.id)}
                onSave={(p) => call("addUpdate", { ...p, ticketId: t.id })} />
            )}
          </div>
        );
      })}
    </Frame>
  );
}

function Frame({ children }) {
  return (
    <div className="bt">
      <style>{CSS}</style>
      <div className="bt-shell">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------ detail panel */

function Detail({ ticket, meta, isAdmin, log, onSave }) {
  const [body, setBody] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [type, setType] = useState("Vendor response");
  const [vendorRef, setVendorRef] = useState(ticket.vendor_ref || "");
  const [next, setNext] = useState(ticket.next_followup || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const closing = meta.closed.includes(status);
  const min = isAdmin ? meta.minNote : 5;
  const short = body.trim().length < min;
  const needsDate = isAdmin && !closing && !next;
  const blocked = short || needsDate;

  const submit = async () => {
    setBusy(true); setErr("");
    try {
      await onSave({ body, newStatus: status, type, vendorRef, nextFollowup: closing ? "" : next });
      setBody("");
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="bt-detail">
      {ticket.description && <p className="bt-desc">{ticket.description}</p>}

      <div className="bt-facts">
        <span>opened <b>{ticket.reported_date}</b></span>
        {ticket.vendor_ref && <span>vendor ref <b>{ticket.vendor_ref}</b></span>}
        {ticket.vendor_contact && <span>contact <b>{ticket.vendor_contact}</b></span>}
        {ticket.next_followup && <span>next follow-up <b>{ticket.next_followup}</b></span>}
      </div>

      {log.length > 0 && (
        <div className="bt-log">
          {log.map((u) => (
            <div className="bt-line" key={u.update_id}>
              <span className="bt-when">{u.timestamp}</span>
              <div>
                <div className="bt-by"><u>{u.author}</u> <i>{u.type}</i></div>
                <p className="bt-said">{u.body}</p>
                {u.new_status && <div className="bt-shift">→ {u.new_status}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bt-form">
        <div className="bt-field">
          <label className="bt-lab" htmlFor={`n-${ticket.id}`}>
            {isAdmin ? "what changed" : "comment"}
          </label>
          <textarea id={`n-${ticket.id}`} className="bt-ta" value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={isAdmin ? "What the vendor said, what you tried, what's next." : ""} />
        </div>

        {isAdmin && (
          <div className="bt-grid">
            <div className="bt-field">
              <label className="bt-lab" htmlFor={`t-${ticket.id}`}>kind</label>
              <select id={`t-${ticket.id}`} className="bt-sel" value={type} onChange={(e) => setType(e.target.value)}>
                {["Vendor response", "Follow-up sent", "Note", "Workaround"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="bt-field">
              <label className="bt-lab" htmlFor={`s-${ticket.id}`}>status</label>
              <select id={`s-${ticket.id}`} className="bt-sel" value={status} onChange={(e) => setStatus(e.target.value)}>
                {meta.statuses.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="bt-field">
              <label className="bt-lab" htmlFor={`f-${ticket.id}`}>next follow-up</label>
              <input id={`f-${ticket.id}`} className="bt-in mono" type="date" value={next}
                disabled={closing} onChange={(e) => setNext(e.target.value)} />
            </div>
            <div className="bt-field">
              <label className="bt-lab" htmlFor={`v-${ticket.id}`}>vendor ref</label>
              <input id={`v-${ticket.id}`} className="bt-in mono" value={vendorRef}
                onChange={(e) => setVendorRef(e.target.value)} placeholder="their ticket no." />
            </div>
          </div>
        )}

        <div className="bt-act">
          <button className="bt-btn" disabled={blocked || busy} onClick={submit}>
            {busy ? "Saving…" : isAdmin ? "Log update" : "Post comment"}
          </button>
          {short && <span className="bt-hint">{min - body.trim().length} more chars</span>}
          {!short && needsDate && <span className="bt-hint">set a next follow-up, or close it</span>}
          {err && <span className="bt-err">{err}</span>}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- new ticket */

function NewTicket({ meta, onCancel, onSave }) {
  const [f, setF] = useState({
    system: "", title: "", description: "", severity: "Medium",
    status: "New", vendorRef: "", vendorContact: "",
    reportedDate: meta.today, nextFollowup: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ready = f.title.trim().length > 3 && f.system.trim() && f.nextFollowup;

  const save = async () => {
    setBusy(true); setErr("");
    try { await onSave(f); } catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="bt-new">
      <div className="bt-form">
        <div className="bt-field">
          <label className="bt-lab" htmlFor="nt-title">summary</label>
          <input id="nt-title" className="bt-in" value={f.title} onChange={set("title")}
            placeholder="Nightly backup fails every Sunday" />
        </div>
        <div className="bt-grid">
          <div className="bt-field">
            <label className="bt-lab" htmlFor="nt-sys">system</label>
            <input id="nt-sys" className="bt-in" value={f.system} onChange={set("system")}
              placeholder="FileMaker, ShipStation, Kleos ERP" />
          </div>
          <div className="bt-field">
            <label className="bt-lab" htmlFor="nt-sev">severity</label>
            <select id="nt-sev" className="bt-sel" value={f.severity} onChange={set("severity")}>
              {meta.severities.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="bt-field">
            <label className="bt-lab" htmlFor="nt-status">status</label>
            <select id="nt-status" className="bt-sel" value={f.status} onChange={set("status")}>
              {meta.statuses.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="bt-field">
          <label className="bt-lab" htmlFor="nt-desc">detail</label>
          <textarea id="nt-desc" className="bt-ta" value={f.description} onChange={set("description")}
            placeholder="Steps to reproduce, error text, who reported it." />
        </div>
        <div className="bt-grid">
          <div className="bt-field">
            <label className="bt-lab" htmlFor="nt-next">next follow-up</label>
            <input id="nt-next" className="bt-in mono" type="date" value={f.nextFollowup} onChange={set("nextFollowup")} />
          </div>
          <div className="bt-field">
            <label className="bt-lab" htmlFor="nt-ref">vendor ref</label>
            <input id="nt-ref" className="bt-in mono" value={f.vendorRef} onChange={set("vendorRef")} />
          </div>
          <div className="bt-field">
            <label className="bt-lab" htmlFor="nt-who">vendor contact</label>
            <input id="nt-who" className="bt-in" value={f.vendorContact} onChange={set("vendorContact")} />
          </div>
        </div>
        <div className="bt-act">
          <button className="bt-btn" disabled={!ready || busy} onClick={save}>
            {busy ? "Saving…" : "Open bug"}
          </button>
          <button className="bt-btn bt-btn-q" onClick={onCancel}>Cancel</button>
          {!ready && <span className="bt-hint">summary, system and a follow-up date required</span>}
          {err && <span className="bt-err">{err}</span>}
        </div>
      </div>
    </div>
  );
}
