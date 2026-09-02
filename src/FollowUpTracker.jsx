import React, { useState, useEffect, useMemo, useCallback } from "react";

/* Set VITE_API_URL in .env.local. Unset = sample data mode. */
const API_URL = import.meta.env.VITE_API_URL || "";

/* ------------------------------------------------------------------ styles */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

.ft {
  --paper:#dde1de; --panel:#f4f6f4; --panel2:#eaedea;
  --ink:#1c211e; --ink2:#5a635e; --rule:#c3cac5;
  --oxide:#a33a2b; --amber:#a8730a; --slate:#46626f; --moss:#4a6b46;
  background:var(--paper); color:var(--ink); min-height:100vh;
  font:400 15px/1.55 'IBM Plex Sans', system-ui, sans-serif;
  -webkit-font-smoothing:antialiased;
}
.ft *, .ft *::before, .ft *::after { box-sizing:border-box; }
.ft button, .ft input, .ft select, .ft textarea { font:inherit; color:inherit; }
.ft :focus-visible { outline:2px solid var(--slate); outline-offset:2px; }
.ft-mono { font-family:'IBM Plex Mono', ui-monospace, monospace; font-variant-numeric:tabular-nums; }

.ft-shell { max-width:1060px; margin:0 auto; padding:28px 20px 80px; }

.ft-head { display:flex; align-items:baseline; gap:16px; flex-wrap:wrap;
  padding-bottom:16px; border-bottom:1px solid var(--rule); margin-bottom:20px; }
.ft-title { font-family:'Archivo', sans-serif; font-weight:700; font-size:26px;
  letter-spacing:-0.02em; margin:0; }
.ft-standing { color:var(--ink2); font-size:14px; margin:0; flex:1 1 220px; }
.ft-standing b { color:var(--oxide); font-weight:600; }
.ft-headbtns { display:flex; gap:8px; }

.ft-body { display:grid; grid-template-columns:170px 1fr; gap:26px; align-items:start; }
@media (max-width:760px) { .ft-body { grid-template-columns:1fr; gap:16px; } }

.ft-rail { display:flex; flex-direction:column; gap:1px; position:sticky; top:20px; }
@media (max-width:760px) {
  .ft-rail { position:static; flex-direction:row; overflow-x:auto; gap:6px; padding-bottom:4px; }
}
.ft-filter { display:flex; justify-content:space-between; gap:10px; align-items:center;
  background:none; border:0; border-left:3px solid transparent; text-align:left;
  padding:7px 10px; cursor:pointer; color:var(--ink2); white-space:nowrap; border-radius:0; }
.ft-filter:hover { background:var(--panel2); }
.ft-filter[data-on="1"] { background:var(--panel); color:var(--ink); font-weight:600;
  border-left-color:var(--ink); }
@media (max-width:760px) {
  .ft-filter { border-left:0; border-bottom:2px solid transparent; }
  .ft-filter[data-on="1"] { border-left:0; border-bottom-color:var(--ink); }
}
.ft-filter span:last-child { font-family:'IBM Plex Mono', monospace; font-size:13px; }

.ft-list { background:var(--panel); border:1px solid var(--rule); border-radius:2px; }
.ft-row { display:block; width:100%; text-align:left; background:none; border:0;
  border-bottom:1px solid var(--rule); border-left:4px solid var(--rule);
  padding:13px 16px; cursor:pointer; }
.ft-list > *:last-child .ft-row, .ft-list > *:last-child { border-bottom:0; }
.ft-row:hover { background:var(--panel2); }
.ft-row[data-u="overdue"] { border-left-color:var(--oxide); }
.ft-row[data-u="today"]   { border-left-color:var(--amber); }
.ft-row[data-u="waiting"] { border-left-color:var(--slate); }
.ft-row[data-u="closed"]  { border-left-color:var(--rule); opacity:.62; }
.ft-row[data-u="ok"]      { border-left-color:var(--moss); }

.ft-rowtop { display:flex; gap:10px; align-items:baseline; }
.ft-id { font-family:'IBM Plex Mono', monospace; font-size:12.5px; color:var(--ink2); }
.ft-sys { font-size:12.5px; color:var(--ink2); border:1px solid var(--rule);
  padding:0 6px; border-radius:2px; }
.ft-name { font-family:'Archivo', sans-serif; font-weight:600; font-size:15.5px;
  letter-spacing:-0.01em; margin:3px 0 2px; }
.ft-meta { font-size:13px; color:var(--ink2); }
.ft-flag { color:var(--oxide); font-weight:600; }
.ft-flag-a { color:var(--amber); font-weight:600; }

.ft-panel { padding:2px 16px 20px 20px; border-bottom:1px solid var(--rule);
  border-left:4px solid var(--rule); background:var(--panel2); }
.ft-desc { font-size:14px; color:var(--ink2); margin:10px 0 16px; max-width:70ch; }

.ft-log { border-left:1px solid var(--rule); padding-left:14px; margin:0 0 18px;
  max-height:280px; overflow-y:auto; }
.ft-entry { margin-bottom:14px; }
.ft-entry:last-child { margin-bottom:0; }
.ft-when { font-family:'IBM Plex Mono', monospace; font-size:12px; color:var(--ink2); }
.ft-who { font-weight:600; font-size:13.5px; }
.ft-said { font-size:14px; margin:2px 0 0; white-space:pre-wrap; max-width:70ch; }
.ft-moved { font-size:13px; color:var(--slate); }

.ft-form { display:flex; flex-direction:column; gap:10px; max-width:640px; }
.ft-grid { display:flex; gap:10px; flex-wrap:wrap; }
.ft-field { display:flex; flex-direction:column; gap:4px; flex:1 1 170px; }
.ft-lab { font-size:13px; color:var(--ink2); }
.ft-in, .ft-ta, .ft-sel { background:#fff; border:1px solid var(--rule); border-radius:2px;
  padding:8px 10px; width:100%; }
.ft-ta { min-height:76px; resize:vertical; line-height:1.5; }
.ft-in:focus, .ft-ta:focus, .ft-sel:focus { border-color:var(--slate); }

.ft-btn { background:var(--ink); color:var(--panel); border:1px solid var(--ink);
  padding:8px 16px; border-radius:2px; cursor:pointer; font-weight:600; font-size:14px; }
.ft-btn:hover:not(:disabled) { background:#000; }
.ft-btn:disabled { background:var(--rule); border-color:var(--rule); color:#7c847f; cursor:not-allowed; }
.ft-btn-q { background:none; color:var(--ink); border:1px solid var(--rule); font-weight:500; }
.ft-btn-q:hover { background:var(--panel2); }

.ft-hint { font-size:13px; color:var(--ink2); }
.ft-err { font-size:13.5px; color:var(--oxide); }
.ft-empty { padding:34px 20px; color:var(--ink2); }
.ft-new { background:var(--panel); border:1px solid var(--rule); border-radius:2px;
  padding:18px 20px; margin-bottom:18px; }
.ft-actions { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }

@media (prefers-reduced-motion:no-preference) {
  .ft-row, .ft-filter, .ft-btn { transition:background-color .12s ease; }
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
  { id: "TKT-004", system: "FileMaker Server", title: "Nightly backup fails every Sunday",
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
  { id: "TKT-002", system: "FileMaker Server", title: "SSL renewal broke the WebDirect login",
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

function metaLine(t, meta) {
  const age = daysAgo(t.last_update, meta.today);
  const bits = [t.status];
  if (t.vendor_ref) bits.push("ref " + t.vendor_ref);
  bits.push(age === 0 ? "updated today" : `updated ${age} day${age === 1 ? "" : "s"} ago`);
  return bits.join(" · ");
}

/* -------------------------------------------------------------------- app */

export default function FollowUpTracker() {
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
    if (!data.ok) throw new Error(data.error || "Something went wrong.");
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
        setFatal(err.message || "Could not reach the tracker.");
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
    return b;
  }, [tickets, meta]);

  /* One nudge per session, only while the tab is open. Email is the real reminder. */
  useEffect(() => {
    if (loading || alerts !== "granted" || !buckets.overdue.length) return;
    try {
      new Notification(`${buckets.overdue.length} follow-up${buckets.overdue.length === 1 ? "" : "s"} overdue`, {
        body: buckets.overdue.slice(0, 3).map((t) => t.title).join("\n"),
        tag: "followups-" + meta.today,
      });
    } catch { /* blocked, no harm */ }
  }, [loading, alerts, buckets.overdue.length, meta.today]);

  const askForAlerts = async () => {
    try { setAlerts(await Notification.requestPermission()); } catch { setAlerts("denied"); }
  };

  const shown = filter === "all" ? buckets.open : buckets[filter] || [];

  if (loading) return <Frame><p className="ft-empty">Loading your follow-ups.</p></Frame>;
  if (fatal) return (
    <Frame>
      <p className="ft-empty">
        {fatal}<br />
        <span className="ft-hint">Check that your link still has its <code className="ft-mono">?k=</code> key on the end.</span>
      </p>
    </Frame>
  );

  return (
    <Frame>
      <header className="ft-head">
        <h1 className="ft-title">Follow-ups</h1>
        <p className="ft-standing">
          {buckets.overdue.length > 0
            ? <><b>{buckets.overdue.length} overdue</b>{buckets.today.length ? `, ${buckets.today.length} due today` : ""}. Chase them.</>
            : buckets.today.length
              ? <>{buckets.today.length} due today, nothing overdue.</>
              : <>Nothing overdue. {buckets.open.length} open and on schedule.</>}
        </p>
        <div className="ft-headbtns">
          {alerts === "default" && (
            <button className="ft-btn ft-btn-q" onClick={askForAlerts}>Turn on tab alerts</button>
          )}
          {isAdmin && (
            <button className="ft-btn" onClick={() => { setComposing(!composing); setOpenId(null); }}>
              {composing ? "Cancel" : "New ticket"}
            </button>
          )}
        </div>
      </header>

      {composing && isAdmin && (
        <NewTicket meta={meta} onCancel={() => setComposing(false)}
          onSave={async (p) => { await call("createTicket", p); setComposing(false); setFilter("all"); }} />
      )}

      <div className="ft-body">
        <nav className="ft-rail">
          {[["overdue", "Overdue", buckets.overdue.length],
            ["today", "Due today", buckets.today.length],
            ["waiting", "With vendor", buckets.waiting.length],
            ["all", "All open", buckets.open.length],
            ["closed", "Closed", buckets.closed.length]].map(([key, label, n]) => (
            <button key={key} className="ft-filter" data-on={filter === key ? "1" : "0"}
              onClick={() => { setFilter(key); setOpenId(null); }}>
              <span>{label}</span><span>{n}</span>
            </button>
          ))}
        </nav>

        <div className="ft-list">
          {shown.length === 0 && (
            <p className="ft-empty">
              {filter === "overdue" ? "Nothing overdue. Keep it that way."
                : filter === "closed" ? "No closed tickets yet."
                : "Nothing here."}
            </p>
          )}
          {shown.map((t) => {
            const u = urgencyOf(t, meta);
            const open = openId === t.id;
            return (
              <div key={t.id}>
                <button className="ft-row" data-u={u} aria-expanded={open}
                  onClick={() => setOpenId(open ? null : t.id)}>
                  <div className="ft-rowtop">
                    <span className="ft-id">{t.id}</span>
                    <span className="ft-sys">{t.system}</span>
                    {u === "overdue" && <span className="ft-flag">overdue</span>}
                    {u === "today" && <span className="ft-flag-a">due today</span>}
                  </div>
                  <div className="ft-name">{t.title}</div>
                  <div className="ft-meta">{metaLine(t, meta)}</div>
                </button>
                {open && (
                  <Detail ticket={t} meta={meta} isAdmin={isAdmin}
                    log={updates.filter((u2) => u2.ticket_id === t.id)}
                    onSave={(p) => call("addUpdate", { ...p, ticketId: t.id })} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}

function Frame({ children }) {
  return (
    <div className="ft">
      <style>{CSS}</style>
      <div className="ft-shell">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------ ticket panel */

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
    <div className="ft-panel">
      {ticket.description && <p className="ft-desc">{ticket.description}</p>}

      {log.length > 0 && (
        <div className="ft-log">
          {log.map((u) => (
            <div className="ft-entry" key={u.update_id}>
              <div><span className="ft-who">{u.author}</span>{" "}
                <span className="ft-when">{u.timestamp}</span>{" "}
                <span className="ft-when">· {u.type}</span></div>
              <p className="ft-said">{u.body}</p>
              {u.new_status && <div className="ft-moved">Moved to {u.new_status}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="ft-form">
        <div className="ft-field">
          <label className="ft-lab" htmlFor={`n-${ticket.id}`}>
            {isAdmin ? "What happened since last time?" : "Add a comment"}
          </label>
          <textarea id={`n-${ticket.id}`} className="ft-ta" value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={isAdmin ? "What the vendor said, what you tried, what is next." : ""} />
        </div>

        {isAdmin && (
          <div className="ft-grid">
            <div className="ft-field">
              <label className="ft-lab" htmlFor={`t-${ticket.id}`}>Kind of update</label>
              <select id={`t-${ticket.id}`} className="ft-sel" value={type} onChange={(e) => setType(e.target.value)}>
                {["Vendor response", "Follow-up sent", "Note", "Workaround"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="ft-field">
              <label className="ft-lab" htmlFor={`s-${ticket.id}`}>Status</label>
              <select id={`s-${ticket.id}`} className="ft-sel" value={status} onChange={(e) => setStatus(e.target.value)}>
                {meta.statuses.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="ft-field">
              <label className="ft-lab" htmlFor={`f-${ticket.id}`}>Next follow-up</label>
              <input id={`f-${ticket.id}`} className="ft-in" type="date" value={next}
                disabled={closing} onChange={(e) => setNext(e.target.value)} />
            </div>
            <div className="ft-field">
              <label className="ft-lab" htmlFor={`v-${ticket.id}`}>Vendor reference</label>
              <input id={`v-${ticket.id}`} className="ft-in" value={vendorRef}
                onChange={(e) => setVendorRef(e.target.value)} placeholder="their ticket number" />
            </div>
          </div>
        )}

        <div className="ft-actions">
          <button className="ft-btn" disabled={blocked || busy} onClick={submit}>
            {busy ? "Saving" : isAdmin ? "Log update" : "Post comment"}
          </button>
          {short && <span className="ft-hint">{min - body.trim().length} more characters needed.</span>}
          {!short && needsDate && <span className="ft-hint">Set a next follow-up date, or close the ticket.</span>}
          {err && <span className="ft-err">{err}</span>}
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
    <div className="ft-new">
      <div className="ft-form">
        <div className="ft-grid">
          <div className="ft-field">
            <label className="ft-lab" htmlFor="nt-sys">System</label>
            <input id="nt-sys" className="ft-in" value={f.system} onChange={set("system")}
              placeholder="FileMaker Server, ShipStation, Kleos ERP" />
          </div>
          <div className="ft-field">
            <label className="ft-lab" htmlFor="nt-sev">Severity</label>
            <select id="nt-sev" className="ft-sel" value={f.severity} onChange={set("severity")}>
              {meta.severities.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="ft-field">
          <label className="ft-lab" htmlFor="nt-title">What is broken</label>
          <input id="nt-title" className="ft-in" value={f.title} onChange={set("title")}
            placeholder="Nightly backup fails every Sunday" />
        </div>
        <div className="ft-field">
          <label className="ft-lab" htmlFor="nt-desc">Detail</label>
          <textarea id="nt-desc" className="ft-ta" value={f.description} onChange={set("description")}
            placeholder="Steps to reproduce, error text, who reported it." />
        </div>
        <div className="ft-grid">
          <div className="ft-field">
            <label className="ft-lab" htmlFor="nt-status">Status</label>
            <select id="nt-status" className="ft-sel" value={f.status} onChange={set("status")}>
              {meta.statuses.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="ft-field">
            <label className="ft-lab" htmlFor="nt-next">Next follow-up</label>
            <input id="nt-next" className="ft-in" type="date" value={f.nextFollowup} onChange={set("nextFollowup")} />
          </div>
          <div className="ft-field">
            <label className="ft-lab" htmlFor="nt-ref">Vendor reference</label>
            <input id="nt-ref" className="ft-in" value={f.vendorRef} onChange={set("vendorRef")} />
          </div>
          <div className="ft-field">
            <label className="ft-lab" htmlFor="nt-who">Who you are dealing with</label>
            <input id="nt-who" className="ft-in" value={f.vendorContact} onChange={set("vendorContact")} />
          </div>
        </div>
        <div className="ft-actions">
          <button className="ft-btn" disabled={!ready || busy} onClick={save}>
            {busy ? "Saving" : "Open ticket"}
          </button>
          <button className="ft-btn ft-btn-q" onClick={onCancel}>Cancel</button>
          {!ready && <span className="ft-hint">System, title and a follow-up date are required.</span>}
          {err && <span className="ft-err">{err}</span>}
        </div>
      </div>
    </div>
  );
}
