"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../providers/SocketProvider";

type NavTab = "Home" | "Leaderboard" | "Problems";

type Stat = {
  label: string;
  value: string;
  helper?: string;
};

type QuickAction = {
  title: string;
  description: string;
  onClick?: () => void;
};

export default function DevDuelHome() {
  const router = useRouter();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<NavTab>("Home");
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasNotif, setHasNotif] = useState(true);
  const [matchmakingStatus, setMatchmakingStatus] = useState("");

  useEffect(() => {
    if (!socket) return;

    const onQueued = (data: any) => setMatchmakingStatus(data.message);
    const onFound = (data: any) => {
      setMatchmakingStatus("Match found!");
      router.push(`/duel/${data.duelId}`);
    };

    socket.on("matchmaking:queued", onQueued);
    socket.on("matchmaking:found", onFound);

    return () => {
      socket.off("matchmaking:queued", onQueued);
      socket.off("matchmaking:found", onFound);
    };
  }, [socket, router]);

  const findMatch = () => {
    if (!socket) return;
    setMatchmakingStatus("Finding match...");
    socket.emit("matchmaking:find");
  };

  const cancelMatchmaking = () => {
    if (!socket) return;
    socket.emit("matchmaking:cancel");
    setMatchmakingStatus("Cancelled");
  };

  const handleLogout = async () => {
    try {
      // Call your backend logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Clear local storage
      localStorage.removeItem('user');
      
      // Close profile dropdown
      setProfileOpen(false);
      
      // Redirect to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data and redirect even if API fails
      localStorage.removeItem('user');
      setProfileOpen(false);
      window.location.href = '/';
    }
  };

  // Replace with real user data from your auth/user store
  const user = useMemo(
    () => ({
      name: "Dhruv",
      handle: "@dhruv",
      rating: 1432,
      matches: 57,
      winPct: 61,
      avatarText: "D",
    }),
    []
  );

  const stats: Stat[] = [
    { label: "Rating", value: `${user.rating}`, helper: "Competitive ELO" },
    { label: "Matches", value: `${user.matches}`, helper: "Total duels played" },
    { label: "Win %", value: `${user.winPct}%`, helper: "Lifetime win rate" },
  ];

  const actions: QuickAction[] = [
    {
      title: "Match History",
      description: "Review recent duels, opponents, and outcomes.",
      onClick: () => alert("Navigate: /history"),
    },
    {
      title: "Global Leaderboard",
      description: "See top-rated duelists and climb the ranks.",
      onClick: () => alert("Navigate: /leaderboard"),
    },
    {
      title: "Problem Library",
      description: "Curated problems for practice and warmups.",
      onClick: () => alert("Navigate: /problems"),
    },
  ];

  const DESIGN_BRIEF = `You are a senior product designer + frontend architect.

Context:
I am building a real-time competitive coding platform called “DevDuel”.
The login and signup pages are already completed and working.
After authentication, users are redirected to the Home Page.

Goal:
Design a detailed, production-ready Home Page UI/UX in Figma for DevDuel.
The design must be clean, modern, competitive, and developer-focused.

Platform:
- Desktop-first (1440px width)
- Dark mode theme
- Inspired by competitive platforms like Codeforces, LeetCode, and gaming dashboards

Core Features to Reflect:
- Real-time coding duels using WebSockets
- Matchmaking using Redis
- Rating-based competitive system
- Practice mode without rating impact
- User profiles, match history, and leaderboard

Home Page Requirements:

1. Top Navigation Bar
   - DevDuel logo on the left
   - Optional navigation tabs: Home, Leaderboard, Problems
   - Right side profile avatar with dropdown:
     - View Profile
     - Match History
     - Settings
     - Logout
   - Notification icon for duel updates

2. Hero Section (Primary Focus)
   - Strong headline motivating competition
   - Subtext explaining real-time duels
   - Primary CTA button: “Find a Duel”
     - High visual priority
     - Triggers matchmaking
   - Secondary CTA button: “Practice Mode”
     - Lower priority, non-rated

3. User Stats Overview
   - Display user rating
   - Total matches played
   - Win percentage
   - Each stat shown as a card with subtle hover effects

4. Quick Action Cards
   - Match History
   - Global Leaderboard
   - Problem Library
   - Cards should be clickable and visually distinct

5. Visual & UX Details
   - Use auto-layout
   - Consistent spacing and alignment
   - Reusable components (buttons, cards, navbar)
   - Clear hierarchy and accessibility-friendly contrast

6. Figma Output Expectations
   - Exact frame structure
   - Component hierarchy
   - Naming conventions
   - Suggested color styles and typography styles
   - Variants for buttons (primary, secondary, disabled)
   - Hover and active state descriptions

7. UX Flow Explanation
   - Explain what happens when the user clicks “Find a Duel”
   - Explain how matchmaking works at a high level
   - Explain how stats update after a duel

Tone & Style:
- Competitive
- Minimal
- Professional
- Developer-centric

Deliverables:
- Detailed textual layout for Figma recreation
- Clear section-by-section breakdown
- Explanation suitable for academic/project presentation`;

  return (
    <div className="page">
      {/* Background grid */}
      <div className="bgWrap" aria-hidden="true">
        <div className="gridPerspective" />
        <div className="vignette" />
        <div className="noise" />
      </div>

      {/* Top Nav */}
      <header className="nav">
        <div className="navLeft">
          <div className="logo">
            <span className="logoMark" />
            <span className="logoText">DevDuel</span>
          </div>

          <nav className="tabs" aria-label="Primary">
            {(["Home", "Leaderboard", "Problems"] as NavTab[]).map((t) => (
              <button
                key={t}
                className={`tab ${activeTab === t ? "tabActive" : ""}`}
                onClick={() => {
                  if (t === "Leaderboard") {
                    router.push('/leaderboard');
                  } else if (t === "Home") {
                    setActiveTab(t);
                  } else {
                    alert("Navigate: /problems");
                  }
                }}
                type="button"
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        <div className="navRight">
          <button
            className="iconBtn"
            type="button"
            aria-label="Notifications"
            onClick={() => setHasNotif((v) => !v)}
            title="Notifications"
          >
            <span className="bell" />
            {hasNotif && <span className="dot" aria-hidden="true" />}
          </button>

          <div className="profile">
            <button
              className="avatarBtn"
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <span className="avatar">{user.avatarText}</span>
              <span className="profileMeta">
                <span className="profileName">{user.name}</span>
                <span className="profileHandle">{user.handle}</span>
              </span>
              <span className={`chev ${profileOpen ? "chevUp" : ""}`} />
            </button>

            {profileOpen && (
              <div className="menu" role="menu">
                <MenuItem label="View Profile" onClick={() => router.push('/profile')} />
                <MenuItem label="Match History" onClick={() => alert("Go: /history")} />
                <MenuItem label="Settings" onClick={() => alert("Go: /settings")} />
                <div className="menuSep" />
                <MenuItem label="Logout" danger onClick={handleLogout} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="main">
        <section className="heroCard">
          <div className="heroTop">
            <div className="heroCopy">
              <h1 className="heroTitle">
                Duel in real-time. <span className="heroAccent">Climb the rating ladder.</span>
              </h1>
              <p className="heroSub">
                Instant matchmaking, live coding battles via WebSockets, and a competitive rating system designed
                for serious developers.
              </p>

              <div className="ctaRow">
                <button className="btn btnPrimary" type="button" onClick={findMatch}>
                  Find a Duel
                </button>
                {matchmakingStatus && (
                  <button className="btn btnSecondary" type="button" onClick={cancelMatchmaking}>
                    Cancel
                  </button>
                )}
                <button className="btn btnSecondary" type="button" onClick={() => alert("Go: Practice Mode")}>
                  Practice Mode
                </button>
                <button className="btn btnGhost" type="button" onClick={() => alert("Open: How it works")}>
                  How it works
                </button>
              </div>

              {matchmakingStatus && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px 16px', 
                  background: 'rgba(147, 51, 234, 0.15)', 
                  border: '1px solid rgba(147, 51, 234, 0.30)', 
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: '#fff',
                  fontSize: '14px'
                }}>
                  {matchmakingStatus}
                </div>
              )}

              <div className="microRow">
                <Pill label="WebSockets Live" />
                <Pill label="Redis Matchmaking" />
                <Pill label="Rated + Unrated" />
              </div>
            </div>

            {/* Right side: User stats */}
            <aside className="statsGrid" aria-label="User stats overview">
              {stats.map((s) => (
                <div key={s.label} className="statCard">
                  <div className="statLabel">{s.label}</div>
                  <div className="statValue">{s.value}</div>
                  {s.helper && <div className="statHelper">{s.helper}</div>}
                </div>
              ))}
            </aside>
          </div>

          {/* Quick actions */}
          <div className="actionsRow" aria-label="Quick actions">
            {actions.map((a) => (
              <button
                key={a.title}
                className="actionCard"
                type="button"
                onClick={a.onClick}
              >
                <div className="actionTitle">{a.title}</div>
                <div className="actionDesc">{a.description}</div>
                <div className="actionHint">Open →</div>
              </button>
            ))}
          </div>
        </section>

        {/* Visible spec text panel (as you requested) */}
        <section className="briefCard">
          <div className="briefHead">
            <div>
              <div className="briefTitle">Design Brief (Visible)</div>
              <div className="briefSub">
                This panel intentionally shows the full requirements text on the Home Page.
              </div>
            </div>
            <button className="btn btnSecondary btnSmall" type="button" onClick={() => navigator.clipboard?.writeText(DESIGN_BRIEF)}>
              Copy
            </button>
          </div>

          <pre className="briefBody">{DESIGN_BRIEF}</pre>
        </section>
      </main>

      <style>{css}</style>
    </div>
  );
}

function MenuItem({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={`menuItem ${danger ? "menuItemDanger" : ""}`}
      role="menuitem"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function Pill({ label }: { label: string }) {
  return <span className="pill">{label}</span>;
}

const css = `
/* ---- Page base ---- */
.page{
  min-height:100vh;
  color:#fff;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
  position:relative;
  overflow-y: auto;
}

/* ---- Futuristic grid background with purple theme ---- */
.bgWrap{
  position:fixed;
  inset:0;
  z-index:0;
  background:#0a0a0f;
}
.gridPerspective{
  position:absolute;
  inset:-20%;
  background:
    repeating-linear-gradient(0deg, rgba(147, 51, 234, 0.08) 0 2px, transparent 2px 56px),
    repeating-linear-gradient(90deg, rgba(147, 51, 234, 0.08) 0 2px, transparent 2px 56px);
  transform: perspective(900px) rotateX(62deg) translateY(160px);
  transform-origin:center;
  filter: blur(0.1px);
  opacity:0.65;
}
.vignette{
  position:absolute;
  inset:0;
  background:
    radial-gradient(1200px 600px at 50% 38%, rgba(147, 51, 234, 0.15), transparent 60%),
    radial-gradient(800px 500px at 50% 100%, rgba(0,0,0,0.75), rgba(10,10,15,0.95));
}
.noise{
  position:absolute;
  inset:0;
  opacity:0.08;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.25'/%3E%3C/svg%3E");
}

/* ---- Nav ---- */
.nav{
  position:fixed;
  top:0;
  left:0;
  right:0;
  z-index:2;
  height:72px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 28px;
  border-bottom:1px solid rgba(147, 51, 234, 0.20);
  background: linear-gradient(to bottom, rgba(10,10,15,0.90), rgba(10,10,15,0.70));
  backdrop-filter: blur(10px);
}
.navLeft{display:flex; align-items:center; gap:18px;}
.logo{display:flex; align-items:center; gap:10px;}
.logoMark{
  width:10px; height:10px; border-radius:999px;
  background: linear-gradient(135deg, #9333ea, #a855f7);
  box-shadow: 0 0 22px rgba(147, 51, 234, 0.40);
}
.logoText{font-weight:800; letter-spacing:0.3px; font-size:16px;}

.tabs{display:flex; gap:10px; margin-left:12px;}
.tab{
  color: rgba(255,255,255,0.78);
  background: transparent;
  border:1px solid rgba(147, 51, 234, 0.20);
  border-radius:999px;
  padding:8px 12px;
  font-size:13px;
  cursor:pointer;
  transition: all .18s ease;
}
.tab:hover{border-color: rgba(147, 51, 234, 0.40); color: rgba(255,255,255,0.92); transform: translateY(-1px);}
.tabActive{
  background: rgba(147, 51, 234, 0.20);
  border-color: rgba(147, 51, 234, 0.40);
  color:#fff;
}

.navRight{display:flex; align-items:center; gap:12px;}
.iconBtn{
  position:relative;
  width:40px; height:40px;
  border-radius:12px;
  background: rgba(147, 51, 234, 0.08);
  border:1px solid rgba(147, 51, 234, 0.15);
  cursor:pointer;
  transition: all .18s ease;
}
.iconBtn:hover{transform: translateY(-1px); border-color: rgba(147, 51, 234, 0.30); background: rgba(147, 51, 234, 0.12);}
.bell{
  display:block;
  width:18px; height:18px;
  margin:0 auto;
  background:
    radial-gradient(circle at 50% 30%, rgba(255,255,255,0.9), rgba(147, 51, 234, 0.6));
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5L3 18v1h18v-1l-2-2Z'/%3E%3C/svg%3E") center / contain no-repeat;
}
.dot{
  position:absolute;
  top:9px; right:9px;
  width:8px; height:8px;
  border-radius:999px;
  background:#9333ea;
  box-shadow:0 0 0 4px rgba(147, 51, 234, 0.20);
}

.profile{position:relative;}
.avatarBtn{
  display:flex; align-items:center; gap:10px;
  height:40px;
  padding:6px 10px;
  border-radius:14px;
  background: rgba(147, 51, 234, 0.08);
  border:1px solid rgba(147, 51, 234, 0.15);
  cursor:pointer;
  transition: all .18s ease;
}
.avatarBtn:hover{transform: translateY(-1px); border-color: rgba(147, 51, 234, 0.30); background: rgba(147, 51, 234, 0.12);}
.avatar{
  width:28px; height:28px; border-radius:12px;
  display:grid; place-items:center;
  background: rgba(147, 51, 234, 0.15);
  border:1px solid rgba(147, 51, 234, 0.25);
  font-weight:800;
}
.profileMeta{display:flex; flex-direction:column; align-items:flex-start; line-height:1.05;}
.profileName{font-size:12px; font-weight:750;}
.profileHandle{font-size:11px; color: rgba(255,255,255,0.62);}
.chev{
  width:14px; height:14px;
  margin-left:4px;
  background: rgba(255,255,255,0.85);
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='m7 10 5 5 5-5'/%3E%3C/svg%3E") center/contain no-repeat;
  opacity:0.75;
  transition: transform .18s ease;
}
.chevUp{transform: rotate(180deg);}

/* Menu */
.menu{
  position:absolute;
  top:48px; right:0;
  width:210px;
  border-radius:16px;
  background: rgba(10,10,15,0.90);
  border:1px solid rgba(147, 51, 234, 0.20);
  box-shadow: 0 18px 70px rgba(0,0,0,0.55);
  backdrop-filter: blur(12px);
  overflow:hidden;
  z-index:10;
}
.menuItem{
  width:100%;
  text-align:left;
  padding:12px 12px;
  background:transparent;
  border:none;
  color: rgba(255,255,255,0.86);
  cursor:pointer;
  font-size:13px;
  transition: background .12s ease, color .12s ease;
}
.menuItem:hover{background: rgba(147, 51, 234, 0.15); color:#fff;}
.menuSep{height:1px; background: rgba(147, 51, 234, 0.20); margin:6px 0;}
.menuItemDanger{color: rgba(255,255,255,0.92);}
.menuItemDanger:hover{background: rgba(147, 51, 234, 0.20);}

/* ---- Main layout ---- */
.main{
  position:relative;
  z-index:1;
  width: min(1200px, calc(100% - 48px));
  margin: 0 auto;
  padding: 106px 0 64px;
  display:grid;
  gap:24px;
}

/* ---- Hero card with centered CTA ---- */
.heroCard{
  border-radius:24px;
  border: 1px solid rgba(147, 51, 234, 0.20);
  background: linear-gradient(180deg, rgba(147, 51, 234, 0.08), rgba(147, 51, 234, 0.04));
  box-shadow: 0 28px 120px rgba(147, 51, 234, 0.15);
  overflow:hidden;
}
.heroTop{
  display:grid;
  grid-template-columns: 1fr;
  gap:32px;
  padding: 40px 32px;
  text-align: center;
}
.heroCopy{padding:0 20px;}
.heroTitle{
  margin:0;
  font-size:48px;
  line-height:1.05;
  letter-spacing:-0.8px;
  font-weight:900;
  background: linear-gradient(135deg, #fff, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.heroAccent{
  color: #a855f7;
  text-shadow: 0 0 26px rgba(168, 85, 247, 0.30);
}
.heroSub{
  margin:16px 0 0;
  max-width: 60ch;
  color: rgba(255,255,255,0.78);
  font-size:15px;
  line-height:1.6;
  margin-left: auto;
  margin-right: auto;
}

.ctaRow{
  display:flex;
  justify-content: center;
  gap:16px;
  margin-top:32px;
  flex-wrap:wrap;
}
.btn{
  height:52px;
  padding: 0 24px;
  border-radius:16px;
  border:1px solid rgba(147, 51, 234, 0.20);
  font-weight:800;
  font-size:14px;
  cursor:pointer;
  transition: all .18s ease;
}
.btn:active{transform: translateY(0px) scale(0.98);}
.btnPrimary{
  background: linear-gradient(135deg, #9333ea, #a855f7);
  color:#fff;
  border-color: rgba(147, 51, 234, 0.40);
  box-shadow: 0 20px 50px rgba(147, 51, 234, 0.25);
  font-size:16px;
  padding: 0 32px;
}
.btnPrimary:hover{transform: translateY(-2px); box-shadow: 0 26px 70px rgba(147, 51, 234, 0.35);}
.btnSecondary{
  background: rgba(147, 51, 234, 0.15);
  color:#fff;
  border-color: rgba(147, 51, 234, 0.30);
}
.btnSecondary:hover{transform: translateY(-2px); background: rgba(147, 51, 234, 0.20); border-color: rgba(147, 51, 234, 0.40);}
.btnGhost{
  background: transparent;
  color: rgba(255,255,255,0.82);
  border-color: rgba(147, 51, 234, 0.20);
}
.btnGhost:hover{transform: translateY(-2px); border-color: rgba(147, 51, 234, 0.40); color:#fff;}
.btnSmall{height:36px; padding:0 12px; border-radius:12px; font-size:12px;}

.microRow{
  display:flex;
  justify-content: center;
  gap:12px;
  margin-top:20px;
  flex-wrap:wrap;
}
.pill{
  font-size:12px;
  color: rgba(255,255,255,0.78);
  padding: 8px 14px;
  border-radius:999px;
  border:1px solid rgba(147, 51, 234, 0.20);
  background: rgba(147, 51, 234, 0.10);
}

/* Stats cards - centered below hero */
.statsGrid{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap:16px;
  max-width: 600px;
  margin: 0 auto;
  padding:0 20px;
}
.statCard{
  border-radius:20px;
  border:1px solid rgba(147, 51, 234, 0.20);
  background: rgba(10,10,15,0.40);
  padding:20px 16px;
  transition: all .18s ease;
  text-align: center;
}
.statCard:hover{transform: translateY(-2px); border-color: rgba(147, 51, 234, 0.35); background: rgba(10,10,15,0.50);}
.statLabel{font-size:12px; color: rgba(255,255,255,0.70); font-weight:700; text-transform: uppercase; letter-spacing: 0.5px;}
.statValue{font-size:28px; font-weight:950; margin-top:8px; letter-spacing:-0.5px; color: #a855f7;}
.statHelper{font-size:11px; color: rgba(255,255,255,0.55); margin-top:6px;}

/* Quick action cards */
.actionsRow{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap:16px;
  padding: 0 32px 32px;
}
.actionCard{
  text-align:left;
  border-radius:20px;
  border:1px solid rgba(147, 51, 234, 0.20);
  background: rgba(10,10,15,0.40);
  padding:20px 20px;
  cursor:pointer;
  transition: all .18s ease;
}
.actionCard:hover{transform: translateY(-2px); border-color: rgba(147, 51, 234, 0.35); background: rgba(10,10,15,0.50);}
.actionTitle{font-weight:900; letter-spacing:-0.2px; color: #a855f7;}
.actionDesc{margin-top:8px; color: rgba(255,255,255,0.75); font-size:13px; line-height:1.5;}
.actionHint{margin-top:12px; font-size:12px; color: rgba(255,255,255,0.55);}

/* ---- Visible spec panel ---- */
.briefCard{
  border-radius:24px;
  border: 1px solid rgba(147, 51, 234, 0.20);
  background: rgba(10,10,15,0.50);
  overflow:hidden;
}
.briefHead{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(147, 51, 234, 0.20);
}
.briefTitle{font-weight:950; letter-spacing:-0.2px; color: #a855f7;}
.briefSub{margin-top:3px; font-size:12px; color: rgba(255,255,255,0.62);}

.briefBody{
  margin:0;
  padding: 20px 24px 24px;
  max-height: 340px;
  overflow:auto;
  font-size:12.5px;
  line-height:1.55;
  color: rgba(255,255,255,0.78);
  white-space:pre-wrap;
}

/* Responsive guard */
@media (max-width: 1100px){
  .heroTop{grid-template-columns: 1fr; }
  .statsGrid{grid-template-columns: repeat(3,1fr); max-width: 100%;}
  .actionsRow{grid-template-columns: 1fr;}
  .heroTitle{font-size:36px;}
  .ctaRow{flex-direction: column; align-items: center;}
  .btn{width: 100%; max-width: 300px;}
}

@media (max-width: 768px){
  .statsGrid{grid-template-columns: 1fr; gap: 12px;}
  .heroTitle{font-size:28px;}
  .main{padding: 90px 12px 40px;}
  .heroTop{padding: 30px 20px;}
}
`