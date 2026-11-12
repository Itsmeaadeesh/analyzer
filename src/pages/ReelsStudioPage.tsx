import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGsaSettings } from '../context/GsaContext';

interface CheckItem {
  t: string;
  crit?: number;
  bonus?: number;
  f: (c: { raw: string; l: string; first: string }) => boolean;
  w: string;
}

interface ThemeConfig {
  name: string;
  badge: string;
  cr: string;
  pov: string;
  subs: string[];
  tpl: string;
  checks: (ctx: { gid: string; reg: string; idea: string }) => CheckItem[];
}

const CORE = ['googlestudentambassador', 'gsa2026', 'teamgemini'];
const HAND = ['googleindia', 'googlegemini', 'googlegeminiindia'];
const has = (l: string, t: string, p?: string) => new RegExp((p || '#') + t + '(?![a-z0-9_])', 'i').test(l);
const clean = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
const emoji = /\p{Extended_Pictographic}/u;
const GAMES = /free ?fire|bgmi|valorant|minecraft|\bcod\b|call of duty|fortnite|apex|cs2|counter-strike|pugg?b?|roblox|gta|fifa|among us|clash|genshin|\bgame/i;

function common(ctx: { gid: string; reg: string; idea: string }): CheckItem[] {
  return [
    {
      t: 'GID standalone line matching saved GID',
      f: (c) => new RegExp('^\\s*gid\\s*[:\\-]?\\s*' + ctx.gid + '\\s*$', 'im').test(c.raw),
      w: 'Add "GID: ' + ctx.gid + '" on its own line',
    },
    {
      t: 'All 3 handles: @GoogleIndia @GoogleGemini @GoogleGeminiIndia',
      f: (c) => HAND.every((h) => has(c.l, h, '@')),
      w: 'Need all 3 handles',
    },
    {
      t: '#GoogleStudentAmbassador #GSA2026 #TeamGemini',
      f: (c) => CORE.every((h) => has(c.l, h)),
      w: 'Missing a core hashtag',
    },
    {
      t: 'Correct regional hashtag (' + ctx.reg + '), wrong one absent',
      f: (c) => has(c.l, ctx.reg.slice(1)) && !has(c.l, ctx.reg === '#ping_mcn' ? 'communiqueindia' : 'ping_mcn'),
      w: 'Use only ' + ctx.reg,
    },
  ];
}

const THEMES: Record<string, ThemeConfig> = {
  squad: {
    name: 'Squad Up',
    badge: 'Current',
    cr: 'Missing the Gemini squad-building prompt, the Nano Banana squad visual, or the Google Play Arena CTA = FAIL.',
    pov: "Everyone's looking for a team. You are not. Gemini built your roster before the game even began.",
    subs: [
      'Make music with Lyria',
      'Visualise your ideas with Nano Banana',
      'Write, remix, reimagine with Gemini',
      'Make movies with Veo',
    ],
    tpl: `🎮 EVERY GAMER NEEDS A DREAM SQUAD. I BUILT MINE WITH GOOGLE GEMINI! 🚀

Finding the perfect squad is every gamer's dream. But what if AI could help you imagine one?

Introducing FIRE PHOENIX — Four minds. One squad. Total dominance. 🔥

From building my ultimate FREE FIRE dream squad with Google Gemini, to visualising our characters and creating our esports identity with Nano Banana — this is where gaming meets creativity.

And that's not all! We take it further with an original squad anthem using Lyria and cinematic visuals with Veo. 🎵🎬

Four unique players. Four different roles. One mission.

RECON. LEADER. BLAZE. MEDIC.

Now, gamers, think you've got the skills to match your squad? Google Play Arena is open. Register now!

And don't forget to tag that one teammate who's always AFK! 😂🎮

What would YOUR dream squad look like?

GID: {GID}

@googleindia @googlegemini @googlegeminiindia

#GoogleStudentAmbassador #GSA2026 #TeamGemini {REG}`,
    checks: (ctx) => [
      {
        t: 'Gaming hook in first line (<125 chars)',
        f: (c) =>
          c.first.length < 125 &&
          /gamer|squad|team|gemini|game/i.test(c.first) &&
          (emoji.test(c.first) || c.first === c.first.toUpperCase()),
        w: 'Start with a short gaming POV hook + emoji',
      },
      {
        t: 'Game named + Gemini squad-building',
        crit: 1,
        f: (c) =>
          /gemini/.test(c.l) &&
          /squad|roster|team|roles|players|build|built|draft|prompt/.test(c.l) &&
          (GAMES.test(c.raw) || /dream squad/.test(c.l)),
        w: 'Name your game and say Gemini built the squad',
      },
      {
        t: 'Nano Banana reveal (poster, characters, identity…)',
        crit: 1,
        f: (c) =>
          /nano banana/.test(c.l) &&
          /poster|logo|visual|characters|identity|jersey|banner|art|design|brand|squad look/.test(c.l),
        w: 'Mention the Nano Banana squad visual',
      },
      {
        t: 'Bonus: Lyria / Veo (not required)',
        bonus: 1,
        f: (c) => /lyria|veo/.test(c.l),
        w: 'Optional: add Lyria/Veo for the bonus',
      },
      {
        t: 'Specific feature identifiable',
        f: (c) => /gemini|nano banana|lyria|veo/.test(c.l),
        w: 'Name Gemini / Nano Banana / Lyria / Veo',
      },
      {
        t: 'CTA: Google Play Arena + Register',
        crit: 1,
        f: (c) => /google play arena/.test(c.l) && /register/.test(c.l),
        w: 'Say: Google Play Arena is open. Register now!',
      },
      {
        t: 'Challenge line (tag a teammate… AFK)',
        f: (c) => /\btag\b/.test(c.l) && /teammate|friend|squad|crew/.test(c.l) && /afk|drop in|idea/.test(c.l),
        w: 'Tag a teammate who has been AFK',
      },
      ...common(ctx),
    ],
  },
  brand: {
    name: 'Idea to Brand',
    badge: 'Last month',
    cr: 'Mentioning Gemini or showing an AI output is not enough. Missing the Gemini build process, the Nano Banana reveal, or the "free for students" line = FAIL.',
    pov: 'Show yourself turning a random idea into a real, visualized brand with Gemini and Nano Banana, then say the free part out loud: Google AI Plus is free for students right now.',
    subs: [
      'Visualise your ideas with Nano Banana',
      'Write, remix, reimagine with Gemini',
      'Highlight the Gemini or Google feature you use',
    ],
    tpl: `💡 EVERY BIG BRAND STARTS AS A RANDOM THOUGHT. I TURNED MINE INTO ONE WITH GOOGLE GEMINI! 🚀

I had a random idea: [your idea here].

I chatted with Google Gemini to build the name, the tagline, what I'm selling and what makes it different. Meet [BRAND] — [tagline]. 🍫

Then I visualised everything with Nano Banana 🍌✨ — logo, poster and packaging.

And the best part? Google AI Plus is free for students right now. No excuse not to try this!

Tag someone whose idea is sitting in their notes app doing nothing. 😂

What would YOUR brand look like?

GID: {GID}

@googleindia @googlegemini @googlegeminiindia

#GoogleStudentAmbassador #GSA2026 #TeamGemini {REG}`,
    checks: (ctx) => [
      {
        t: 'Idea → brand story in opening',
        f: (c) => /idea|brand|startup|product|thought|name/.test(c.first.toLowerCase()),
        w: 'Open with the idea/brand line',
      },
      {
        t: 'Gemini build process (name, tagline, USP…)',
        crit: 1,
        f: (c) =>
          /gemini/.test(c.l) &&
          /name|tagline|usp|selling|brainstorm|build|built|chat|prompt|concept/.test(c.l),
        w: 'Say how you built the brand with Gemini',
      },
      {
        t: 'Nano Banana reveal (logo, poster, packaging…)',
        crit: 1,
        f: (c) =>
          /nano banana/.test(c.l) &&
          /logo|poster|packag|visual|brand|reveal|identity|design/.test(c.l),
        w: 'Mention the Nano Banana visuals',
      },
      {
        t: '"Free for students" / Google AI Plus line',
        crit: 1,
        f: (c) =>
          /free for students|ai plus is free|google ai plus[^.]{0,40}free|free[^.]{0,40}ai plus/.test(c.l),
        w: 'Add: Google AI Plus is free for students right now',
      },
      {
        t: 'Specific feature identifiable',
        f: (c) => /gemini|nano banana/.test(c.l),
        w: 'Name Gemini / Nano Banana',
      },
      {
        t: 'Idea description specific (40+ chars, not vague)',
        f: () => ctx.idea.length >= 40 && !/^(true|ai video|done|idea)\.?$/i.test(ctx.idea.trim()),
        w: 'Describe the real output in the idea box',
      },
      ...common(ctx),
    ],
  },
};

export const ReelsStudioPage: React.FC = () => {
  const { gid: savedGid, setGid: updateGid } = useGsaSettings();

  // Settings
  const [gid, setGidLocal] = useState<string>(() => localStorage.getItem('gsa_gid') || savedGid || '973');
  const [reg, setReg] = useState<string>(() => localStorage.getItem('gsa_reg_tag') || '#ping_mcn');
  const [curTheme, setCurTheme] = useState<string>(() => localStorage.getItem('gsa_theme2') || 'squad');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.dataset.theme === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Tabs
  const [tab, setTab] = useState<'analyze' | 'submit'>('analyze');

  // Inputs
  const [reelLink, setReelLink] = useState<string>('');
  const [idea, setIdea] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<string>('Copy');
  const [goldenMessage, setGoldenMessage] = useState<string>('');

  // Analysis result state
  const [analyzed, setAnalyzed] = useState<boolean>(false);
  const [exportStatus, setExportStatus] = useState<string>('Export report');
  const [finalCopyStatus, setFinalCopyStatus] = useState<string>('Copy final caption');
  const resultsRef = useRef<HTMLDivElement>(null);

  // Sync dark theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.dataset.theme = 'dark';
    } else {
      document.documentElement.dataset.theme = 'light';
    }
  }, [isDark]);

  // Context & LocalStorage sync
  const handleGidChange = (val: string) => {
    setGidLocal(val);
    try {
      localStorage.setItem('gsa_gid', val);
      updateGid(val);
    } catch (_) {}
  };

  const handleRegChange = (val: string) => {
    setReg(val);
    try {
      localStorage.setItem('gsa_reg_tag', val);
    } catch (_) {}
  };

  const handleThemeChange = (val: string) => {
    setCurTheme(val);
    try {
      localStorage.setItem('gsa_theme2', val);
    } catch (_) {}
    setAnalyzed(false);
  };

  const currentThemeConfig = THEMES[curTheme] || THEMES.squad;

  // Evaluator context
  const context = useMemo(() => ({
    gid: gid.trim() || '973',
    reg,
    idea,
  }), [gid, reg, idea]);

  const parsedCaption = useMemo(() => {
    const raw = clean(caption);
    return {
      raw,
      l: raw.toLowerCase(),
      first: (raw.split('\n').find((x) => x.trim()) || '').trim(),
    };
  }, [caption]);

  // Check results live
  const checksList = useMemo(() => {
    return currentThemeConfig.checks(context).map((k) => ({
      ...k,
      ok: Boolean(k.f(parsedCaption)),
    }));
  }, [currentThemeConfig, context, parsedCaption]);

  // Interpolated template
  const interpolatedTemplate = useMemo(() => {
    return currentThemeConfig.tpl
      .replace('{GID}', context.gid)
      .replace('{REG}', context.reg);
  }, [currentThemeConfig, context.gid, context.reg]);

  // Live chips metrics
  const hashtagsCount = (parsedCaption.raw.match(/#[\w]+/g) || []).length;
  const handlesCount = HAND.filter((h) => has(parsedCaption.l, h, '@')).length;
  const coreTagsCount = CORE.filter((h) => has(parsedCaption.l, h)).length;
  const gidOk = checksList.length >= 4 ? checksList[checksList.length - 4].ok : false;
  const regOk = checksList.length >= 1 ? checksList[checksList.length - 1].ok : false;
  const critList = checksList.filter((k) => k.crit);
  const critPassed = critList.filter((k) => k.ok).length;

  const scoreableChecks = checksList.filter((k) => !k.bonus);
  const passedScore = scoreableChecks.filter((k) => k.ok).length;
  const totalScoreable = scoreableChecks.length;
  const badCriticals = checksList.filter((k) => !k.ok && k.crit);
  const hasPlaceholders = /\{[A-Z ]+\}|\[(game name|your idea here|brand|team name|tagline|role|game)\]|xxxx/i.test(parsedCaption.raw);
  const bonusItem = checksList.find((k) => k.bonus && k.ok);

  const handleUseTemplate = () => {
    setCaption(interpolatedTemplate);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(interpolatedTemplate).then(() => {
      setCopyStatus('Copied ✓');
      setTimeout(() => setCopyStatus('Copy'), 1200);
    });
  };

  const handleOpenLink = () => {
    const u = reelLink.trim();
    if (/^https?:\/\//i.test(u)) {
      window.open(u, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRunAnalysis = () => {
    setAnalyzed(true);
    if (passedScore === totalScoreable && badCriticals.length === 0 && !hasPlaceholders) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_) {}
    }
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleGoldenTest = () => {
    const defaultReg = '#ping_mcn';
    setReg(defaultReg);
    handleGidChange('973');
    setIdea('Golden test fixture: full approved style caption for the active theme');

    let t = currentThemeConfig.tpl.replace('{GID}', '973').replace('{REG}', defaultReg);
    t = t
      .replace(/\[BRAND\]/g, 'DORMBITES')
      .replace(/\[tagline\]/g, 'Fuel Before The Bell')
      .replace(/\[your idea here\]/g, 'a zero-waste snack brand for hostel students')
      .replace(/\[TEAM NAME\]/g, 'FIRE PHOENIX')
      .replace(/\[GAME\]/g, 'FREE FIRE')
      .replace(/\[ROLE\]/g, 'RECON');

    setCaption(t);
    setAnalyzed(true);

    const testParsed = {
      raw: clean(t),
      l: clean(t).toLowerCase(),
      first: (clean(t).split('\n').find((x) => x.trim()) || '').trim(),
    };
    const r = currentThemeConfig.checks({ gid: '973', reg: defaultReg, idea: 'Golden test fixture: full approved style caption for the active theme' });
    const scoreable = r.filter((k) => !k.bonus);
    const passCount = scoreable.filter((k) => k.f(testParsed)).length;
    setGoldenMessage(passCount + '/' + scoreable.length + (passCount === scoreable.length ? ' ✅' : ' ❌ loosen a check'));

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (_) {}

    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleExportReport = () => {
    const reportText = `GSA Reels Studio · ${currentThemeConfig.name}\nScore ${passedScore}/${totalScoreable}\n` +
      checksList.map((k) => `${k.ok ? 'PASS' : 'FAIL'} - ${k.t}`).join('\n');
    navigator.clipboard.writeText(reportText).then(() => {
      setExportStatus('Copied ✓');
      setTimeout(() => setExportStatus('Export report'), 1500);
    });
  };

  const handleCopyFinalCaption = () => {
    navigator.clipboard.writeText(caption).then(() => {
      setFinalCopyStatus('Copied ✓');
      setTimeout(() => setFinalCopyStatus('Copy final caption'), 1500);
    });
  };

  const trimmedIdea = idea.trim();
  const ideaWarning = trimmedIdea && trimmedIdea.length < 40;

  return (
    <div className="reels-studio-theme min-h-screen pb-16 font-sans">
      <style>{`
        .reels-studio-theme {
          --bg: #f4f6fb;
          --card: #fff;
          --tx: #1f2430;
          --mut: #6b7280;
          --bd: #e3e7ef;
          --blue: #4285f4;
          --red: #ea4335;
          --yel: #fbbc04;
          --grn: #34a853;
          --dk: #12151c;
          background: var(--bg);
          color: var(--tx);
        }
        [data-theme="dark"] .reels-studio-theme,
        .reels-studio-theme.dark-mode {
          --bg: #0f1218;
          --card: #181c25;
          --tx: #e8eaf0;
          --mut: #9aa3b5;
          --bd: #2a303d;
        }
        .rs-wrap { max-width: 1050px; margin: 0 auto; padding: 16px; }
        .rs-card { background: var(--card); border: 1px solid var(--bd); border-radius: 14px; padding: 14px; margin-bottom: 14px; }
        .rs-card h3 { margin: 0 0 8px; font-size: 11px; letter-spacing: .8px; text-transform: uppercase; color: var(--mut); font-weight: 700; }
        .rs-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        @media(max-width: 560px) { .rs-row { grid-template-columns: 1fr 1fr; } }
        .rs-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 14px; }
        @media(max-width: 820px) { .rs-grid { grid-template-columns: 1fr; } }
        .rs-label { font-size: 11px; font-weight: 600; color: var(--mut); display: block; margin-bottom: 3px; }
        .rs-input, .rs-select, .rs-textarea {
          width: 100%; padding: 9px 10px; border: 1px solid var(--bd); border-radius: 9px;
          background: var(--bg); color: var(--tx); font: inherit; font-size: 13px;
        }
        .rs-textarea { resize: vertical; min-height: 120px; }
        .rs-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
        .rs-tab {
          flex: 1; padding: 9px; border: 1px solid var(--bd); background: var(--card);
          border-radius: 10px; cursor: pointer; color: var(--tx); font-weight: 600; font-size: 13px;
          transition: all 0.2s;
        }
        .rs-tab.on { border-color: var(--blue); color: var(--blue); background: rgba(66, 133, 244, 0.08); }
        .rs-btn {
          border: 0; border-radius: 9px; padding: 8px 12px; cursor: pointer;
          font-weight: 600; font-size: 12px; background: var(--blue); color: #fff;
          transition: filter 0.2s;
        }
        .rs-btn:hover { filter: brightness(1.08); }
        .rs-btn.g { background: var(--bd); color: var(--tx); }
        .rs-big {
          width: 100%; padding: 13px; font-size: 15px; font-weight: 700;
          background: linear-gradient(90deg, var(--blue), #1a73e8); color: #fff;
          border-radius: 11px; cursor: pointer; border: 0; box-shadow: 0 4px 12px rgba(66, 133, 244, 0.25);
          transition: all 0.2s;
        }
        .rs-big:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(66, 133, 244, 0.35); }
        .rs-tpl {
          background: var(--dk); color: #d7e3ff; border-radius: 10px; padding: 12px;
          font-size: 12px; white-space: pre-wrap; max-height: 230px; overflow: auto;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .rs-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 6px; }
        .rs-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
        .rs-chip { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 99px; background: rgba(234, 67, 53, 0.13); color: var(--red); }
        .rs-chip.ok { background: rgba(52, 168, 83, 0.13); color: var(--grn); }
        .rs-crit { background: rgba(234, 67, 53, 0.08); border: 1px solid rgba(234, 67, 53, 0.35); }
        .rs-crit p { margin: 0; font-size: 13px; color: var(--tx); }
        .rs-pov { background: rgba(66, 133, 244, 0.06); border: 1px solid rgba(66, 133, 244, 0.3); }
        ol.rs-ck { padding-left: 0; list-style: none; margin: 0; }
        ol.rs-ck li { display: flex; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--bd); font-size: 13px; align-items: flex-start; }
        .rs-n { min-width: 22px; height: 22px; border-radius: 50%; background: var(--bd); display: grid; place-items: center; font-size: 11px; font-weight: 700; color: var(--tx); }
        .rs-tag { font-size: 10px; font-weight: 700; background: var(--red); color: #fff; border-radius: 5px; padding: 1px 6px; margin-left: 5px; }
        .rs-ok .rs-n { background: var(--grn); color: #fff; }
        .rs-bad .rs-n { background: var(--red); color: #fff; }
        .rs-why { display: block; font-size: 11px; color: var(--mut); margin-top: 2px; }
        .rs-banner { background: var(--red); color: #fff; padding: 14px; border-radius: 12px; font-weight: 700; margin-bottom: 10px; }
        .rs-banner.good { background: var(--grn); }
        .rs-ring { font-size: 30px; font-weight: 800; }
        .rs-pill {
          padding: 5px 11px; border: 1px solid var(--bd); border-radius: 99px;
          font-size: 12px; cursor: pointer; background: var(--card); color: var(--tx);
        }
        .rs-msg { font-size: 11px; color: var(--mut); }
      `}</style>

      {/* Top Navbar with Back button & Dark Mode toggle */}
      <header className="border-b border-slate-200/80 bg-white/90 dark:bg-[#181c25]/90 backdrop-blur-md sticky top-0 z-30 mb-4">
        <div className="max-w-[1050px] mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to GSA Studio</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
              Pillar #2 Engine
            </span>
            <button
              onClick={() => setIsDark(!isDark)}
              className="rs-pill font-medium"
              title="Toggle Dark / Light Theme"
            >
              {isDark ? '☀️ Light' : '🌓 Dark'}
            </button>
          </div>
        </div>
      </header>

      <div className="rs-wrap">
        {/* Header Titles */}
        <div className="mb-4">
          <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            GOOGLE STUDENT AMBASSADOR · PILLAR #2
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight m-0 text-slate-900 dark:text-white">
            <span className="text-[#4285f4]">G</span>
            <span className="text-[#ea4335]">S</span>
            <span className="text-[#fbbc04]">A</span> Reels Studio
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Pillar #2 · Content Creation with Reels &amp; Brand Transformation
          </div>
          <span className="inline-block text-[11px] font-bold py-0.5 px-2.5 rounded-full bg-[#34a85322] text-[#34a853] my-1.5">
            ✓ Caption-only compliance engine
          </span>
        </div>

        {/* Global Settings Card */}
        <div className="rs-card">
          <div className="rs-row">
            <div>
              <label className="rs-label">GID *</label>
              <input
                className="rs-input"
                value={gid}
                onChange={(e) => handleGidChange(e.target.value)}
                inputMode="numeric"
                placeholder="973"
              />
            </div>
            <div>
              <label className="rs-label">Region *</label>
              <select
                className="rs-select"
                value={reg}
                onChange={(e) => handleRegChange(e.target.value)}
              >
                <option value="#ping_mcn">East-West India (ping)</option>
                <option value="#CommuniqueIndia">North-South India</option>
              </select>
            </div>
            <div>
              <label className="rs-label">Region Hashtag</label>
              <input className="rs-input" value={reg} readOnly />
            </div>
            <div>
              <label className="rs-label">Pillar #2 Theme</label>
              <select
                className="rs-select"
                value={curTheme}
                onChange={(e) => handleThemeChange(e.target.value)}
              >
                {Object.entries(THEMES)
                  .sort((a, b) => (a[1].badge === 'Current' ? -1 : 1))
                  .map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.name} ({item.badge})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="rs-grid">
          {/* Left Column */}
          <div>
            <div className="rs-tabs">
              <button
                type="button"
                className={`rs-tab ${tab === 'analyze' ? 'on' : ''}`}
                onClick={() => setTab('analyze')}
              >
                Analyze My Reel
              </button>
              <button
                type="button"
                className={`rs-tab ${tab === 'submit' ? 'on' : ''}`}
                onClick={() => setTab('submit')}
              >
                Submit a Reel
              </button>
            </div>

            {tab === 'analyze' && (
              <div>
                {/* Reel Link Input */}
                <div className="rs-card">
                  <h3>Paste your Instagram Reel link (optional)</h3>
                  <div className="flex gap-1.5">
                    <input
                      className="rs-input"
                      value={reelLink}
                      onChange={(e) => setReelLink(e.target.value)}
                      placeholder="https://www.instagram.com/reel/Cxxxx..."
                    />
                    <button
                      type="button"
                      className="rs-btn g shrink-0"
                      onClick={handleOpenLink}
                    >
                      Open
                    </button>
                  </div>
                </div>

                {/* Creative Idea Description */}
                <div className="rs-card">
                  <h3>Creative idea description</h3>
                  <textarea
                    className="rs-textarea"
                    style={{ minHeight: '70px' }}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Describe the real output, e.g. Picked Free Fire, asked Gemini for roles + team name, made a squad poster with Nano Banana..."
                  />
                  <div className={`rs-msg ${ideaWarning ? 'text-amber-500 font-semibold' : ''}`}>
                    {ideaWarning
                      ? '⚠ Too vague. Describe the real output (40+ chars).'
                      : 'Anti-rejection rule: vague entries like "true" or "AI video" are rejected.'}
                  </div>
                </div>

                {/* Ideal Caption Template */}
                <div className="rs-card">
                  <div className="rs-top">
                    <h3 style={{ margin: 0 }}>Ideal caption template</h3>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="rs-btn g"
                        onClick={handleCopyTemplate}
                      >
                        {copyStatus}
                      </button>
                      <button
                        type="button"
                        className="rs-btn"
                        onClick={handleUseTemplate}
                      >
                        Use this caption
                      </button>
                    </div>
                  </div>
                  <div className="rs-tpl">{interpolatedTemplate}</div>
                </div>

                {/* Paste Reel Caption */}
                <div className="rs-card">
                  <h3>Paste your Reel caption</h3>
                  <textarea
                    className="rs-textarea"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Paste your Instagram Reel caption here (or click 'Use this caption')..."
                  />
                  <div className="rs-msg">{caption.length} / 2200 chars</div>

                  {/* Live Chips */}
                  <div className="rs-chips">
                    <span className={`rs-chip ${gidOk ? 'ok' : ''}`}>
                      GID {gidOk ? '✓' : '✗'}
                    </span>
                    <span className={`rs-chip ${handlesCount === 3 ? 'ok' : ''}`}>
                      Handles {handlesCount}/3
                    </span>
                    <span className={`rs-chip ${coreTagsCount === 3 ? 'ok' : ''}`}>
                      Core tags {coreTagsCount}/3
                    </span>
                    <span className={`rs-chip ${regOk ? 'ok' : ''}`}>
                      Regional {regOk ? '✓' : '✗'}
                    </span>
                    <span className={`rs-chip ${critPassed === critList.length ? 'ok' : ''}`}>
                      Critical {critPassed}/{critList.length}
                    </span>
                    <span className={`rs-chip ${hashtagsCount <= 30 ? 'ok' : ''}`}>
                      # {hashtagsCount}
                    </span>
                  </div>
                </div>

                {/* Big Analyze Button */}
                <button
                  type="button"
                  className="rs-big"
                  onClick={handleRunAnalysis}
                >
                  Analyze Reel Compliance
                </button>

                {/* Results Section */}
                {analyzed && (
                  <div ref={resultsRef} style={{ marginTop: '14px' }}>
                    {badCriticals.length > 0 ? (
                      <div className="rs-banner">
                        🚨 CRITICAL FAIL — Reel will be rejected
                        <div style={{ fontWeight: 400, marginTop: '4px', fontSize: '12px' }}>
                          Missing: {badCriticals.map((k) => k.t).join(' · ')}
                        </div>
                      </div>
                    ) : hasPlaceholders ? (
                      <div className="rs-banner">
                        ⚠ Placeholder text left in caption. Replace [brackets] before posting.
                      </div>
                    ) : (
                      <div className={`rs-banner ${passedScore === totalScoreable ? 'good' : ''}`}>
                        {passedScore === totalScoreable ? 'Ready to submit 🚀' : 'Fix these first'}
                      </div>
                    )}

                    <div className="rs-card">
                      <div className="rs-top">
                        <div
                          className="rs-ring"
                          style={{
                            color:
                              passedScore === totalScoreable
                                ? 'var(--grn)'
                                : passedScore >= 7
                                ? 'var(--yel)'
                                : 'var(--red)',
                          }}
                        >
                          {passedScore}/{totalScoreable}
                        </div>

                        {bonusItem && (
                          <span className="inline-block text-[11px] font-bold py-0.5 px-2.5 rounded-full bg-[#34a85322] text-[#34a853]">
                            Bonus unlocked 🎵🎬
                          </span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className="rs-btn g"
                            onClick={handleExportReport}
                          >
                            {exportStatus}
                          </button>
                          <button
                            type="button"
                            className="rs-btn"
                            onClick={handleCopyFinalCaption}
                          >
                            {finalCopyStatus}
                          </button>
                        </div>
                      </div>

                      <ol className="rs-ck">
                        {checksList.map((k, i) => (
                          <li key={i} className={k.ok ? 'rs-ok' : 'rs-bad'}>
                            <span className="rs-n">{k.ok ? '✓' : '✗'}</span>
                            <div className="flex-1">
                              <span className="font-medium text-slate-800 dark:text-slate-100">
                                {k.t}
                              </span>
                              {k.crit ? <span className="rs-tag">CRITICAL</span> : null}
                              <span className="rs-why">{k.ok ? 'Pass' : k.w}</span>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'submit' && (
              <div className="rs-card">
                <h3>Submit a Reel</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Reviewers check only the caption. Run the analysis, hit <b>Copy final caption</b>, then paste it in your reel post.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <div>1. Verify all 10 checklist items pass with no Critical Failures.</div>
                  <div>2. Post your reel on Instagram with the exact verified caption.</div>
                  <div>3. Submit the public reel link to your Google Student Ambassador dashboard.</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            {/* Critical Fail Rule */}
            <div className="rs-card rs-crit">
              <h3 style={{ color: 'var(--red)' }}>Critical Fail Rule</h3>
              <p>{currentThemeConfig.cr}</p>
            </div>

            {/* POV (Point of View) */}
            <div className="rs-card rs-pov">
              <h3>POV (Point of View)</h3>
              <p style={{ margin: 0, fontSize: '13px' }}>{currentThemeConfig.pov}</p>
            </div>

            {/* Sub-ideas */}
            <div className="rs-card">
              <h3>Sub-ideas to spark your reel</h3>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200 mt-2">
                {currentThemeConfig.subs.map((s, idx) => (
                  <div key={idx} style={{ padding: '4px 0' }}>
                    ✨ {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Reel Requirements (10-point checklist) */}
            <div className="rs-card">
              <h3>Reel requirements (10-point checklist)</h3>
              <ol className="rs-ck">
                {checksList.map((k, i) => (
                  <li key={i}>
                    <span className="rs-n">{i + 1}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {k.t}
                      {k.crit ? <span className="rs-tag">CRITICAL</span> : null}
                      {k.bonus ? (
                        <span className="rs-tag" style={{ background: 'var(--grn)' }}>
                          BONUS
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tools */}
            <div className="rs-card">
              <h3>Tools</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rs-btn g"
                  onClick={handleGoldenTest}
                >
                  Golden Test
                </button>
                <span className="rs-msg font-medium">{goldenMessage}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
