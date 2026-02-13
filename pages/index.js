"use client";
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

// ============================================
// MDM GENERATOR v4.0 — FIRST RAY LABS EDITION
// Shorthand Templates + Legacy Free-Text
// ============================================

// ============================================
// FIRST RAY LABS DESIGN SYSTEM
// ============================================
const FRL = {
  navy: '#0D1B2A',
  navyMid: '#1B2D45',
  navyLight: '#243B56',
  navyDeep: '#091422',
  gold: '#C9A84C',
  goldLight: '#D4BA6A',
  goldPale: '#E8D9A0',
  goldFaded: 'rgba(201, 168, 76, 0.08)',
  goldBorder: 'rgba(201, 168, 76, 0.15)',
  goldBorderHover: 'rgba(201, 168, 76, 0.3)',
  cream: '#F5F0E8',
  creamDim: 'rgba(245, 240, 232, 0.6)',
  creamMuted: 'rgba(245, 240, 232, 0.35)',
  creamGhost: 'rgba(245, 240, 232, 0.12)',
  orange: '#E8853D',
  orangeFaded: 'rgba(232, 133, 61, 0.1)',
  orangeBorder: 'rgba(232, 133, 61, 0.25)',
  green: '#4ADE80',
  greenFaded: 'rgba(74, 222, 128, 0.1)',
  greenBorder: 'rgba(74, 222, 128, 0.2)',
  red: '#F87171',
  redFaded: 'rgba(248, 113, 113, 0.1)',
  redBorder: 'rgba(248, 113, 113, 0.2)',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  shadowLg: '0 12px 40px rgba(0, 0, 0, 0.4)',
  font: "'DM Sans', sans-serif",
  fontDisplay: "'Playfair Display', serif",
  fontMono: "'JetBrains Mono', monospace",
};

// ============================================
// FIRST RAY LABS LOGO
// ============================================

const DOCTORS = [
  { id: 'lynde', name: 'Dr. Lynde' },
  { id: 'lai', name: 'Dr. Lai' },
  { id: 'kerrins', name: 'Dr. Kerrins' },
];

// ============================================
// PATTERN LEARNING SYSTEM — SILENT OBSERVATION
// ============================================
const LearningStorage = {
  KEY: 'frl_learning_data',
  
  _getData: () => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(LearningStorage.KEY) || '{}'); }
    catch { return {}; }
  },
  
  _save: (data) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(LearningStorage.KEY, JSON.stringify(data)); }
    catch (e) { console.error('Learning save failed:', e); }
  },
  
  // Record a copy event — the quality signal
  recordCopy: (doctorId, condition, visitType, modifiers) => {
    if (!doctorId || !condition) return;
    const data = LearningStorage._getData();
    const key = `${doctorId}::${condition}::${visitType || 'any'}`;
    
    if (!data[key]) {
      data[key] = { count: 0, modifiers: {}, firstSeen: new Date().toISOString() };
    }
    
    data[key].count += 1;
    data[key].lastUsed = new Date().toISOString();
    
    // Track modifier frequency
    (modifiers || []).forEach(mod => {
      if (!data[key].modifiers[mod]) data[key].modifiers[mod] = 0;
      data[key].modifiers[mod] += 1;
    });
    
    LearningStorage._save(data);
  },
  
  // Get suggestions for a condition+visit combo
  getSuggestions: (doctorId, condition, visitType) => {
    if (!doctorId || !condition) return null;
    const data = LearningStorage._getData();
    const key = `${doctorId}::${condition}::${visitType || 'any'}`;
    const entry = data[key];
    
    if (!entry || entry.count < 5) return null; // Need 5+ observations
    
    // Return modifiers used >40% of the time, sorted by frequency
    const total = entry.count;
    const suggestions = Object.entries(entry.modifiers)
      .map(([mod, count]) => ({ mod, count, pct: Math.round((count / total) * 100) }))
      .filter(s => s.pct >= 40)
      .sort((a, b) => b.pct - a.pct);
    
    return suggestions.length > 0 ? { suggestions, totalObservations: total } : null;
  },

  // Get all learning stats for a doctor
  getStats: (doctorId) => {
    const data = LearningStorage._getData();
    return Object.entries(data)
      .filter(([key]) => key.startsWith(`${doctorId}::`))
      .map(([key, val]) => ({ key, ...val }));
  },
};
const FRLLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <img src="/FRLbadge-logo.png" alt="First Ray Labs" style={{ height: 42, width: 42, borderRadius: '50%', border: `1px solid ${FRL.goldBorder}` }} />
    <div>
      <div style={{
        fontFamily: FRL.fontDisplay, fontSize: 15, fontWeight: 700, color: FRL.cream, letterSpacing: '0.01em',
      }}>
        First Ray <span style={{ color: FRL.gold }}>Labs</span>
      </div>
      <div style={{
        fontFamily: FRL.fontMono, fontSize: 9, letterSpacing: '0.12em', color: FRL.creamMuted, textTransform: 'uppercase', marginTop: 1,
      }}>
        Clinical Intelligence
      </div>
    </div>
  </div>
);

// ============================================
// SHORTHAND DETECTION (client-side preview)
// ============================================
function detectShorthand(input) {
  if (!input || input.length < 3) return null;
  const lower = input.toLowerCase().trim();
  
  const shorthandPatterns = [
    /^(fv|fu|first visit|follow up|followup|1st visit|new pt|return visit)\b/,
    /\b(heel|neuroma|achilles|peroneal|cdfe|wound|abn)\b.*[+-]/,
    /^(heel|neuroma|achilles|peroneal|cdfe|wound|abn)\s+(fv|fu|first|follow)/,
  ];
  
  if (!shorthandPatterns.some(p => p.test(lower))) return null;
  
  const visitType = /\b(fv|first visit|1st visit|new pt|initial)\b/i.test(lower) ? 'First Visit' :
                    /\b(fu|follow up|followup|return|recheck)\b/i.test(lower) ? 'Follow-Up' : null;
  
  const conditionMap = {
    'heel': 'Heel Pain', 'plantar': 'Heel Pain', 'pf': 'Heel Pain',
    'neuroma': "Morton's Neuroma", 'morton': "Morton's Neuroma",
    'achilles': 'Achilles Tendonitis',
    'peroneal': 'Peroneal Tendonitis',
    'cdfe': 'Diabetic Foot Exam', 'diabetic': 'Diabetic Foot Exam',
    'wound': 'Wound Management', 'ulcer': 'Wound Management', 'dfu': 'Wound Management',
    'abn': 'ABN / Routine Foot Care'
  };
  
  let condition = null;
  for (const [key, val] of Object.entries(conditionMap)) {
    if (lower.includes(key)) { condition = val; break; }
  }
  
  if (!visitType && !condition) return null;
  
  const addMods = [];
  const removeMods = [];
  const modRegex = /([+-])\s*(\w+)/g;
  let match;
  while ((match = modRegex.exec(lower)) !== null) {
    if (match[1] === '+') addMods.push(match[2]);
    else removeMods.push(match[2]);
  }
  
  return { visitType, condition, addMods, removeMods, isShorthand: true };
}

// ============================================
// SHORTHAND QUICK REFERENCE DATA
// ============================================
const SHORTHAND_REF = {
  visitTypes: [
    { code: 'fv', label: 'First Visit' },
    { code: 'fu', label: 'Follow-Up' },
  ],
  conditions: [
    { code: 'heel', label: 'Heel Pain / PF' },
    { code: 'neuroma', label: "Morton's Neuroma" },
    { code: 'achilles', label: 'Achilles Tendonitis' },
    { code: 'peroneal', label: 'Peroneal Tendonitis' },
    { code: 'cdfe', label: 'Diabetic Foot Exam' },
    { code: 'wound', label: 'Wound Management' },
    { code: 'abn', label: 'ABN / Routine Care' },
  ],
  commonModifiers: [
    { code: '+inj', label: 'Add injection' },
    { code: '+epat', label: 'Add EPAT' },
    { code: '+orthotics', label: 'Add custom orthotics' },
    { code: '+xray', label: 'Add X-ray' },
    { code: '+mri', label: 'Add MRI' },
    { code: '+nsaid', label: 'Add NSAIDs' },
    { code: '-nsaid', label: 'Remove NSAIDs' },
    { code: '-inj', label: 'Remove injection' },
    { code: '+improving', label: 'Patient improving' },
    { code: '+worse', label: 'Patient worsening' },
  ],
  examples: [
    'fv heel +inj +orthotics',
    'fu neuroma +inj -nsaid',
    'fu achilles +epat +improving',
    'fv peroneal +mri +brace',
    'fu wound +debride +improving',
  ]
};

// ============================================
// PATTERN LEARNING SYSTEM
// ============================================
const PatternStorage = {
  STORAGE_KEY: 'mdm_learned_patterns',
  getPatterns: () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(PatternStorage.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },
  savePattern: (pattern) => {
    if (typeof window === 'undefined') return;
    try {
      const patterns = PatternStorage.getPatterns();
      const newPattern = { id: Date.now(), ...pattern, createdAt: new Date().toISOString(), usageCount: 0 };
      patterns.push(newPattern);
      localStorage.setItem(PatternStorage.STORAGE_KEY, JSON.stringify(patterns));
      return newPattern;
    } catch (e) { console.error('Failed to save pattern:', e); }
  },
  findMatches: (input) => {
    const patterns = PatternStorage.getPatterns();
    const inputLower = input.toLowerCase();
    const keywords = inputLower.split(/\s+/).filter(w => w.length > 3);
    return patterns
      .map(pattern => {
        const patternKeywords = pattern.keywords || [];
        const matches = patternKeywords.filter(k => inputLower.includes(k.toLowerCase()) || keywords.some(kw => k.toLowerCase().includes(kw)));
        return { ...pattern, matchScore: matches.length };
      })
      .filter(p => p.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  },
  incrementUsage: (patternId) => {
    if (typeof window === 'undefined') return;
    try {
      const patterns = PatternStorage.getPatterns();
      const idx = patterns.findIndex(p => p.id === patternId);
      if (idx !== -1) {
        patterns[idx].usageCount = (patterns[idx].usageCount || 0) + 1;
        patterns[idx].lastUsed = new Date().toISOString();
        localStorage.setItem(PatternStorage.STORAGE_KEY, JSON.stringify(patterns));
      }
    } catch (e) { console.error('Failed to update pattern:', e); }
  },
  deletePattern: (patternId) => {
    if (typeof window === 'undefined') return;
    try {
      const patterns = PatternStorage.getPatterns().filter(p => p.id !== patternId);
      localStorage.setItem(PatternStorage.STORAGE_KEY, JSON.stringify(patterns));
    } catch (e) { console.error('Failed to delete pattern:', e); }
  },
  extractKeywords: (text) => {
    const stopWords = new Set(['the', 'and', 'for', 'with', 'has', 'had', 'was', 'were', 'been', 'being', 'have', 'that', 'this', 'from', 'they', 'will', 'would', 'could', 'should', 'patient', 'note', 'today']);
    const clinicalTerms = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(word => word.length > 3 && !stopWords.has(word));
    const freq = {};
    clinicalTerms.forEach(term => { freq[term] = (freq[term] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([term]) => term);
  }
};

// ============================================
// BILLING INFO PARSER
// ============================================
const parseBillingInfo = (output) => {
  if (!output) return { mainContent: output, emLevel: null, modifier25: null, billingText: '' };
  const parts = output.split(/\n---\n/);
  if (parts.length < 2) return { mainContent: output, emLevel: null, modifier25: null, billingText: '' };
  const mainContent = parts[0].trim();
  const billingSection = parts.slice(1).join('\n---\n').trim();
  const emMatch = billingSection.match(/E\/M Level:\s*(99\d{3})\s*\(([^)]+)\)/i);
  const emLevel = emMatch ? { code: emMatch[1], complexity: emMatch[2] } : null;
  // Multi-line Mod 25 capture — grab everything after the status marker
  const mod25Match = billingSection.match(/Modifier 25:\s*(YES|NO|NOT APPLICABLE)\s*[—-]\s*([\s\S]+)/i);
  const modifier25 = mod25Match ? { status: mod25Match[1].toUpperCase(), rationale: mod25Match[2].trim() } : null;
  return { mainContent, emLevel, modifier25, billingText: billingSection };
};

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function MDMGenerator() {
  const [input, setInput] = useState('');
  const [subjective, setSubjective] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [outputMode, setOutputMode] = useState('quick');
  const [shorthandPreview, setShorthandPreview] = useState(null);
  const [showQuickRef, setShowQuickRef] = useState(false);
  const [flowUsed, setFlowUsed] = useState(null);
  const [matchedPatterns, setMatchedPatterns] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [patternName, setPatternName] = useState('');
  const [savedPatterns, setSavedPatterns] = useState([]);
  const [showPatternLibrary, setShowPatternLibrary] = useState(false);
  const [refineInput, setRefineInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [billingInfo, setBillingInfo] = useState({ mainContent: '', emLevel: null, modifier25: null, billingText: '' });
  
  // Prompt 7: Doctor identity + learning
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [learningSuggestions, setLearningSuggestions] = useState(null);
  
  const textareaRef = useRef(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSavedPatterns(PatternStorage.getPatterns());
      // Load persisted doctor selection
      const savedDoc = localStorage.getItem('frl_active_doctor');
      if (savedDoc && DOCTORS.find(d => d.id === savedDoc)) {
        setActiveDoctor(savedDoc);
      }
    }
  }, []);
  
  useEffect(() => {
    const preview = detectShorthand(input);
    setShorthandPreview(preview);
    if (!preview && input.length > 20) setMatchedPatterns(PatternStorage.findMatches(input));
    else setMatchedPatterns([]);
    
    // Update learning suggestions when shorthand detected
    if (preview && activeDoctor && preview.condition) {
      const sug = LearningStorage.getSuggestions(activeDoctor, preview.condition, preview.visitType);
      setLearningSuggestions(sug);
    } else {
      setLearningSuggestions(null);
    }
  }, [input, activeDoctor]);
  
  useEffect(() => { setBillingInfo(parseBillingInfo(output)); }, [output]);

  const generateMDM = async (modeOverride) => {
    const useMode = modeOverride || outputMode;
    if (!input.trim()) { setError('Please enter clinical information or shorthand.'); return; }
    setLoading(true); setError(''); setOutput(''); setRefineInput(''); setFlowUsed(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim(), mode: useMode, subjective: subjective.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      setOutput(data.output); setFlowUsed(data.flow || 'legacy');
    } catch (e) { setError(e.message || 'Failed to generate MDM.'); }
    finally { setLoading(false); }
  };
  
  const handleModeChange = (m) => { setOutputMode(m); if (input.trim()) generateMDM(m); };
  
  const refineOutput = async () => {
    if (!refineInput.trim()) { setError('Please enter a refinement instruction.'); return; }
    if (!output) { setError('No output to refine.'); return; }
    setIsRefining(true); setError('');
    try {
      const res = await fetch('/api/refine', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalOutput: output, instruction: refineInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to refine');
      setOutput(data.output); setRefineInput('');
    } catch (e) { setError(e.message || 'Failed to refine.'); }
    finally { setIsRefining(false); }
  };
  
  const copyToClipboard = async () => {
    try {
      // Build copy text: MDM content + billing block
      let copyText = billingInfo.mainContent || output;
      if (billingInfo.billingText) {
        copyText += '\n\n---\n' + billingInfo.billingText;
      }
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Stage 1: Silent observation — record this copy event for learning
      if (activeDoctor && shorthandPreview) {
        const allMods = [
          ...(shorthandPreview.addMods || []).map(m => `+${m}`),
          ...(shorthandPreview.removeMods || []).map(m => `-${m}`),
        ];
        LearningStorage.recordCopy(
          activeDoctor,
          shorthandPreview.condition,
          shorthandPreview.visitType,
          allMods
        );
      }
    } catch { setError('Failed to copy.'); }
  };
  
  const insertShorthand = (code) => { setInput(input ? input + ' ' + code : code); textareaRef.current?.focus(); };
  
  const saveAsPattern = () => {
    if (!patternName.trim() || !output) return;
    PatternStorage.savePattern({ name: patternName.trim(), keywords: PatternStorage.extractKeywords(input + ' ' + output), inputSample: input.substring(0, 200), outputTemplate: billingInfo.mainContent || output, mode: outputMode });
    setSavedPatterns(PatternStorage.getPatterns()); setShowSaveDialog(false); setPatternName('');
  };
  
  const usePattern = (p) => { setOutput(p.outputTemplate); setOutputMode(p.mode || 'quick'); PatternStorage.incrementUsage(p.id); setMatchedPatterns([]); };
  
  const clearAll = () => { setInput(''); setSubjective(''); setOutput(''); setError(''); setMatchedPatterns([]); setRefineInput(''); setFlowUsed(null); setShorthandPreview(null); setLearningSuggestions(null); };

  const handleDoctorChange = (doctorId) => {
    setActiveDoctor(doctorId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('frl_active_doctor', doctorId);
    }
  };

  // ── Style helpers ──
  const card = { background: FRL.navyMid, border: `1px solid ${FRL.goldBorder}`, borderRadius: 8, padding: 20, marginBottom: 16 };
  const inp = { width: '100%', padding: '12px 14px', fontSize: 14, lineHeight: 1.6, border: `1px solid ${FRL.goldBorder}`, borderRadius: 6, background: FRL.navy, color: FRL.cream, fontFamily: FRL.font, boxSizing: 'border-box', resize: 'vertical', outline: 'none', transition: 'border-color 0.3s' };
  const chip = (active, c = FRL.gold) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: FRL.fontMono, letterSpacing: '0.04em', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', background: active ? `${c}15` : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? `${c}40` : FRL.goldBorder}`, color: active ? c : FRL.creamDim, transition: 'all 0.2s' });
  const btnP = (d) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px', fontSize: 14, fontWeight: 600, letterSpacing: '0.02em', background: d ? FRL.navyLight : FRL.gold, color: d ? FRL.creamMuted : FRL.navy, border: 'none', borderRadius: 6, cursor: d ? 'not-allowed' : 'pointer', fontFamily: FRL.font, transition: 'all 0.3s', width: '100%' });
  const btnG = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 12, fontWeight: 500, background: 'transparent', color: FRL.creamDim, border: `1px solid ${FRL.goldBorder}`, borderRadius: 4, cursor: 'pointer', fontFamily: FRL.font, transition: 'all 0.2s' };
  const mono = { fontFamily: FRL.fontMono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: FRL.gold, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 };

  const FlowBadge = ({ flow }) => (<span style={{ fontSize: 10, fontWeight: 500, padding: '3px 10px', borderRadius: 3, fontFamily: FRL.fontMono, letterSpacing: '0.06em', background: flow === 'shorthand' ? FRL.goldFaded : 'rgba(255,255,255,0.03)', color: flow === 'shorthand' ? FRL.gold : FRL.creamMuted, border: `1px solid ${flow === 'shorthand' ? FRL.goldBorder : 'rgba(255,255,255,0.06)'}` }}>{flow === 'shorthand' ? '⚡ TEMPLATE' : '✍ FREE-TEXT'}</span>);

  const BillingBadge = ({ label, value, status }) => { const c = status === 'YES' ? FRL.green : status === 'NO' ? FRL.orange : FRL.gold; const bg = status === 'YES' ? FRL.greenFaded : status === 'NO' ? FRL.orangeFaded : FRL.goldFaded; const bdr = status === 'YES' ? FRL.greenBorder : status === 'NO' ? FRL.orangeBorder : FRL.goldBorder; return (<div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 4, fontSize: 11, fontFamily: FRL.fontMono, fontWeight: 500, letterSpacing: '0.04em', background: bg, color: c, border: `1px solid ${bdr}` }}>{label}: {value}</div>); };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={{ minHeight: '100vh', background: FRL.navy, color: FRL.cream, fontFamily: FRL.font, WebkitFontSmoothing: 'antialiased' }}>
      <Head>
        <title>MDM Generator v4.1 — First Ray Labs</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      {/* Blueprint Grid */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.025, backgroundImage: 'linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* HEADER */}
      <header style={{ background: 'rgba(13,27,42,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${FRL.goldBorder}`, padding: '12px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <FRLLogo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Doctor Picker */}
            <select
              value={activeDoctor || ''}
              onChange={(e) => handleDoctorChange(e.target.value)}
              style={{
                backgroundColor: activeDoctor ? 'rgba(201, 168, 76, 0.08)' : 'rgba(255,255,255,0.03)',
                color: activeDoctor ? FRL.gold : FRL.creamMuted,
                border: `1px solid ${activeDoctor ? FRL.goldBorder : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 4, padding: '6px 10px', fontSize: 12,
                fontFamily: FRL.font, fontWeight: 500, cursor: 'pointer',
                outline: 'none', appearance: 'none',
                WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='${encodeURIComponent(activeDoctor ? FRL.gold : FRL.creamMuted)}'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '10px 6px',
                paddingRight: 24,
              }}
            >
              <option value="" style={{ background: FRL.navyMid, color: FRL.creamMuted }}>Select Doctor</option>
              {DOCTORS.map(d => (
                <option key={d.id} value={d.id} style={{ background: FRL.navyMid, color: FRL.cream }}>{d.name}</option>
              ))}
            </select>
            <span style={{ fontFamily: FRL.fontMono, fontSize: 10, letterSpacing: '0.1em', padding: '4px 8px', borderRadius: 3, background: FRL.goldFaded, color: FRL.gold, border: `1px solid ${FRL.goldBorder}` }}>v4.1</span>
            <button onClick={() => setShowQuickRef(!showQuickRef)} style={{ ...btnG, background: showQuickRef ? FRL.goldFaded : 'transparent', color: showQuickRef ? FRL.gold : FRL.creamDim, borderColor: showQuickRef ? FRL.gold : FRL.goldBorder }}>
              {showQuickRef ? '✕' : '⚡'} Shorthand
            </button>
            <button onClick={() => setShowPatternLibrary(!showPatternLibrary)} style={{ ...btnG, color: savedPatterns.length > 0 ? FRL.goldLight : FRL.creamMuted }}>
              📚 {savedPatterns.length}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px', position: 'relative', zIndex: 1 }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: FRL.fontDisplay, fontSize: 24, fontWeight: 600, color: FRL.cream, margin: 0, letterSpacing: '-0.02em' }}>MDM Paragraph Generator</h1>
          <p style={{ fontSize: 13, color: FRL.creamMuted, margin: '8px 0 0', fontWeight: 300 }}>
            Type shorthand <span style={{ fontFamily: FRL.fontMono, color: FRL.gold, fontSize: 12, padding: '2px 6px', background: FRL.goldFaded, borderRadius: 3 }}>fv heel +inj</span> or paste full S/O → Get audit-ready MDM
          </p>
        </div>

        {/* QUICK REFERENCE */}
        {showQuickRef && (
          <div style={{ ...card, border: `1px solid ${FRL.gold}40`, boxShadow: '0 0 30px rgba(201,168,76,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={mono}><span style={{ width: 20, height: 1, background: FRL.gold, display: 'inline-block' }} />Shorthand Reference</div>
              <button onClick={() => setShowQuickRef(false)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: FRL.creamMuted, padding: 4 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ ...mono, fontSize: 9, color: FRL.creamMuted }}>Visit Type</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SHORTHAND_REF.visitTypes.map(v => (<button key={v.code} onClick={() => insertShorthand(v.code)} style={chip(false)}><span style={{ color: FRL.gold, fontWeight: 500 }}>{v.code}</span> {v.label}</button>))}
                </div>
              </div>
              <div>
                <div style={{ ...mono, fontSize: 9, color: FRL.creamMuted }}>Condition</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SHORTHAND_REF.conditions.map(c => (<button key={c.code} onClick={() => insertShorthand(c.code)} style={chip(false)}><span style={{ color: FRL.gold, fontWeight: 500 }}>{c.code}</span> {c.label}</button>))}
                </div>
              </div>
              <div>
                <div style={{ ...mono, fontSize: 9, color: FRL.creamMuted }}>Modifiers</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SHORTHAND_REF.commonModifiers.map(m => (<button key={m.code} onClick={() => insertShorthand(m.code)} style={chip(false, m.code.startsWith('-') ? FRL.red : FRL.gold)}><span style={{ fontWeight: 500, color: m.code.startsWith('-') ? FRL.red : FRL.gold }}>{m.code}</span></button>))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: '12px 14px', background: FRL.navy, borderRadius: 6, border: `1px solid ${FRL.goldBorder}` }}>
              <div style={{ ...mono, fontSize: 9, color: FRL.creamMuted, marginBottom: 8 }}>Examples — Click to Try</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SHORTHAND_REF.examples.map(ex => (<button key={ex} onClick={() => { setInput(ex); setShowQuickRef(false); }} style={{ ...chip(false), fontFamily: FRL.fontMono, fontSize: 11, color: FRL.goldLight }}>{ex}</button>))}
              </div>
            </div>
          </div>
        )}

        {/* PATTERN LIBRARY */}
        {showPatternLibrary && savedPatterns.length > 0 && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={mono}>📚 Saved Patterns ({savedPatterns.length})</div>
              <button onClick={() => setShowPatternLibrary(false)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: FRL.creamMuted }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {savedPatterns.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: FRL.navy, borderRadius: 6, border: `1px solid ${FRL.goldBorder}`, gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: FRL.cream }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: FRL.creamMuted, fontFamily: FRL.fontMono }}>Used {p.usageCount || 0}×</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => usePattern(p)} style={{ background: FRL.gold, color: FRL.navy, border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: FRL.font }}>Use</button>
                    <button onClick={() => { PatternStorage.deletePattern(p.id); setSavedPatterns(PatternStorage.getPatterns()); }} style={{ background: FRL.orangeFaded, color: FRL.orange, border: `1px solid ${FRL.orangeBorder}`, borderRadius: 4, padding: '6px 10px', fontSize: 11, cursor: 'pointer' }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pattern Suggestions */}
        {matchedPatterns.length > 0 && !output && (
          <div style={{ background: FRL.orangeFaded, border: `1px solid ${FRL.orangeBorder}`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: FRL.orange, marginBottom: 8, fontFamily: FRL.fontMono }}>Similar patterns found:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {matchedPatterns.map(p => (<button key={p.id} onClick={() => usePattern(p)} style={chip(false, FRL.orange)}>{p.name}</button>))}
            </div>
          </div>
        )}

        {/* SUBJECTIVE INPUT */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={{ fontWeight: 500, fontSize: 13, color: FRL.cream }}>S/O from ModMed <span style={{ fontWeight: 300, color: FRL.creamMuted, fontSize: 11 }}>(optional — paste for richer MDM)</span></label>
            {subjective && <button onClick={() => setSubjective('')} style={btnG}>Clear</button>}
          </div>
          <textarea value={subjective} onChange={(e) => setSubjective(e.target.value)} placeholder="Paste S/O here for patient-specific context (or leave blank for template-only output)" style={{ ...inp, minHeight: 56 }} />
        </div>

        {/* MAIN INPUT */}
        <div style={{ ...card, borderColor: shorthandPreview ? `${FRL.gold}50` : FRL.goldBorder, boxShadow: shorthandPreview ? '0 0 20px rgba(201,168,76,0.06)' : 'none', transition: 'border-color 0.3s, box-shadow 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={{ fontWeight: 500, fontSize: 13, color: FRL.cream, display: 'flex', alignItems: 'center', gap: 8 }}>
              {shorthandPreview ? <><span style={{ color: FRL.gold }}>⚡</span> Shorthand Input</> : 'Clinical Input'}
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {shorthandPreview && <span style={{ fontSize: 10, fontFamily: FRL.fontMono, fontWeight: 500, padding: '3px 10px', borderRadius: 3, letterSpacing: '0.08em', background: FRL.goldFaded, color: FRL.gold, border: `1px solid ${FRL.goldBorder}` }}>TEMPLATE MODE</span>}
              {input && <button onClick={clearAll} style={btnG}>Clear All</button>}
            </div>
          </div>
          <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Type shorthand:  fv heel +inj +orthotics\nOr paste your full clinical note here...`} style={{ ...inp, minHeight: shorthandPreview ? 48 : 130, fontFamily: shorthandPreview ? FRL.fontMono : FRL.font, fontSize: shorthandPreview ? 15 : 14, transition: 'min-height 0.2s' }} />
          
          {shorthandPreview && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: FRL.goldFaded, borderRadius: 6, border: `1px solid ${FRL.goldBorder}` }}>
              <div style={{ ...mono, fontSize: 9, marginBottom: 6, color: FRL.goldLight }}>Parsed Preview:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {shorthandPreview.visitType && <span style={{ padding: '3px 10px', borderRadius: 20, background: FRL.navyMid, border: `1px solid ${FRL.goldBorder}`, color: FRL.cream, fontFamily: FRL.fontMono, fontSize: 11 }}>📋 {shorthandPreview.visitType}</span>}
                {shorthandPreview.condition && <span style={{ padding: '3px 10px', borderRadius: 20, background: FRL.navyMid, border: `1px solid ${FRL.goldBorder}`, color: FRL.cream, fontFamily: FRL.fontMono, fontSize: 11 }}>🦶 {shorthandPreview.condition}</span>}
                {shorthandPreview.addMods.map(m => <span key={m} style={{ padding: '3px 10px', borderRadius: 20, background: FRL.greenFaded, border: `1px solid ${FRL.greenBorder}`, color: FRL.green, fontWeight: 500, fontFamily: FRL.fontMono, fontSize: 11 }}>+ {m}</span>)}
                {shorthandPreview.removeMods.map(m => <span key={m} style={{ padding: '3px 10px', borderRadius: 20, background: FRL.redFaded, border: `1px solid ${FRL.redBorder}`, color: FRL.red, fontWeight: 500, fontFamily: FRL.fontMono, fontSize: 11 }}>− {m}</span>)}
              </div>
            </div>
          )}

          {/* Stage 2: Learning Suggestion Chips */}
          {learningSuggestions && shorthandPreview && (
            <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(232, 133, 61, 0.06)', borderRadius: 6, border: `1px solid ${FRL.orangeBorder}` }}>
              <div style={{ ...mono, fontSize: 9, marginBottom: 6, color: FRL.orange }}>
                You usually add ({learningSuggestions.totalObservations} observations):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {learningSuggestions.suggestions.map(s => {
                  const alreadyAdded = shorthandPreview.addMods.some(m => `+${m}` === s.mod) ||
                                       shorthandPreview.removeMods.some(m => `-${m}` === s.mod);
                  return (
                    <button
                      key={s.mod}
                      onClick={() => !alreadyAdded && insertShorthand(s.mod)}
                      disabled={alreadyAdded}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 4, cursor: alreadyAdded ? 'default' : 'pointer',
                        fontFamily: FRL.fontMono, fontSize: 11, fontWeight: 500,
                        background: alreadyAdded ? 'rgba(74, 222, 128, 0.08)' : 'rgba(232, 133, 61, 0.08)',
                        border: `1px solid ${alreadyAdded ? FRL.greenBorder : FRL.orangeBorder}`,
                        color: alreadyAdded ? FRL.green : FRL.orange,
                        opacity: alreadyAdded ? 0.6 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      {alreadyAdded ? '✓' : ''} {s.mod} <span style={{ fontSize: 9, opacity: 0.7 }}>({s.pct}%)</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* MODE TOGGLE */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          {['quick', 'detailed'].map(m => (
            <button key={m} onClick={() => handleModeChange(m)} disabled={loading || isRefining} style={{ flex: 1, maxWidth: 200, padding: '12px 20px', fontSize: 13, fontWeight: 500, fontFamily: FRL.font, background: outputMode === m ? FRL.goldFaded : 'rgba(255,255,255,0.02)', color: outputMode === m ? FRL.gold : FRL.creamMuted, border: `1px solid ${outputMode === m ? FRL.gold : FRL.goldBorder}`, borderRadius: 6, cursor: loading || isRefining ? 'wait' : 'pointer', opacity: loading || isRefining ? 0.6 : 1, transition: 'all 0.2s' }}>
              {m === 'quick' ? '⚡ Quick' : '📋 Detailed'}
              <div style={{ fontSize: 10, fontFamily: FRL.fontMono, marginTop: 2, opacity: 0.6, letterSpacing: '0.05em' }}>{m === 'quick' ? '75–150 words' : '200–350 words'}</div>
            </button>
          ))}
        </div>

        {/* GENERATE */}
        <button onClick={() => generateMDM()} disabled={loading || isRefining || !input.trim()} style={{ ...btnP(loading || isRefining || !input.trim()), marginBottom: 20, boxShadow: loading || isRefining || !input.trim() ? 'none' : '0 4px 20px rgba(201,168,76,0.2)' }}>
          {loading ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Generating...</> : shorthandPreview ? '⚡ Generate from Template' : 'Generate MDM Paragraph'}
        </button>

        {error && <div style={{ background: FRL.redFaded, color: FRL.red, padding: '12px 16px', borderRadius: 6, marginBottom: 16, fontSize: 13, border: `1px solid ${FRL.redBorder}` }}>{error}</div>}

        {/* OUTPUT */}
        {output && (
          <div style={{ ...card, borderColor: FRL.goldBorderHover, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontFamily: FRL.fontDisplay, fontWeight: 600, fontSize: 15, color: FRL.cream }}>MDM Output — {outputMode === 'quick' ? 'Quick' : 'Detailed'}</label>
                {flowUsed && <FlowBadge flow={flowUsed} />}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowSaveDialog(true)} style={btnG}>💾 Save</button>
                <button onClick={copyToClipboard} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, background: copied ? FRL.green : FRL.gold, color: FRL.navy, border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: FRL.font, minWidth: 100, transition: 'background 0.2s' }}>
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
            
            <div style={{ background: FRL.navy, border: `1px solid ${FRL.goldBorder}`, borderRadius: 6, padding: 18, fontSize: 13.5, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: FRL.cream, fontWeight: 300 }}>
              {billingInfo.mainContent || output}
            </div>
            
            {(billingInfo.emLevel || billingInfo.modifier25) && (
              <div style={{ marginTop: 14, padding: '14px 16px', background: FRL.navy, borderRadius: 6, border: `1px solid ${FRL.goldBorder}` }}>
                <div style={{ ...mono, fontSize: 9, color: FRL.creamMuted, marginBottom: 10 }}>Billing Assessment (Auto-Detected)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start' }}>
                  {billingInfo.emLevel && <BillingBadge label="E/M Level" value={`${billingInfo.emLevel.code} (${billingInfo.emLevel.complexity})`} />}
                  {billingInfo.modifier25 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <BillingBadge label="Modifier 25" value={billingInfo.modifier25.status} status={billingInfo.modifier25.status} />
                      <div style={{ fontSize: 10, color: FRL.creamDim, paddingLeft: 4, fontFamily: FRL.fontMono, whiteSpace: 'pre-wrap', lineHeight: 1.5, maxWidth: 600 }}>{billingInfo.modifier25.rationale}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <input type="text" value={refineInput} onChange={(e) => setRefineInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !isRefining) refineOutput(); }} placeholder='Refine: "add failed conservative care" or "make it shorter"' style={{ ...inp, flex: 1, minHeight: 'auto', resize: 'none', fontSize: 13 }} />
              <button onClick={refineOutput} disabled={isRefining || !refineInput.trim()} style={{ padding: '12px 22px', fontSize: 13, fontWeight: 600, background: isRefining || !refineInput.trim() ? FRL.navyLight : FRL.gold, color: isRefining || !refineInput.trim() ? FRL.creamMuted : FRL.navy, border: 'none', borderRadius: 6, fontFamily: FRL.font, cursor: isRefining || !refineInput.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                {isRefining ? '...' : 'Refine'}
              </button>
            </div>
          </div>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9,20,34,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div style={{ background: FRL.navyMid, border: `1px solid ${FRL.goldBorder}`, borderRadius: 10, padding: 28, width: '100%', maxWidth: 420, boxShadow: FRL.shadowLg }}>
              <h3 style={{ margin: '0 0 20px', fontFamily: FRL.fontDisplay, fontSize: 18, fontWeight: 600, color: FRL.cream }}>Save as Pattern</h3>
              <input type="text" value={patternName} onChange={(e) => setPatternName(e.target.value)} placeholder="Pattern name (e.g., 'PF — 2nd injection')" style={{ ...inp, marginBottom: 20, resize: 'none', minHeight: 'auto' }} autoFocus />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setShowSaveDialog(false); setPatternName(''); }} style={{ ...btnG, flex: 1, justifyContent: 'center', padding: '12px 16px' }}>Cancel</button>
                <button onClick={saveAsPattern} disabled={!patternName.trim()} style={{ ...btnP(!patternName.trim()), flex: 1, width: 'auto' }}>Save</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ maxWidth: 900, margin: '20px auto 0', padding: '20px 16px', borderTop: `1px solid ${FRL.goldBorder}`, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontFamily: FRL.fontDisplay, fontSize: 13, color: FRL.creamMuted }}>First Ray <span style={{ color: FRL.gold }}>Labs</span> <span style={{ fontFamily: FRL.fontMono, fontSize: 10, color: FRL.creamGhost }}>· MDM v4.1</span></div>
          <div style={{ fontFamily: FRL.fontMono, fontSize: 9, letterSpacing: '0.08em', color: FRL.creamGhost, textTransform: 'uppercase' }}>Shorthand ⚡ or Free-Text → Generate → Refine → Copy to ModMed</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(201,168,76,0.05)' }}>
          <p style={{ fontFamily: FRL.fontDisplay, fontSize: 12, fontStyle: 'italic', color: FRL.gold, opacity: 0.4, margin: 0 }}>Built for Podiatry, by Podiatry.</p>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        textarea::placeholder, input::placeholder { color: ${FRL.creamMuted} !important; }
        textarea:focus, input:focus { outline: none; border-color: ${FRL.gold} !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${FRL.navy}; }
        ::-webkit-scrollbar-thumb { background: ${FRL.goldBorder}; border-radius: 3px; }
        ::selection { background: rgba(201,168,76,0.25); color: ${FRL.cream}; }
      `}</style>
    </div>
  );
}
