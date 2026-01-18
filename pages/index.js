"use client";
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

// ============================================
// THEME SYSTEM
// ============================================
const THEMES = {
  light: {
    name: 'light',
    bg: '#F8FAFC',
    bgAlt: '#FFFFFF',
    card: '#FFFFFF',
    cardAlt: '#F1F5F9',
    border: '#E2E8F0',
    text: '#1E3A5F',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    primary: '#1E7AB3',
    primaryLight: '#2B9CD8',
    primaryFaded: '#E0F2FE',
    success: '#059669',
    successFaded: '#D1FAE5',
    warning: '#D97706',
    warningFaded: '#FEF3C7',
    danger: '#DC2626',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  dark: {
    name: 'dark',
    bg: '#0F172A',
    bgAlt: '#1E293B',
    card: '#1E293B',
    cardAlt: '#334155',
    border: '#334155',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    primary: '#38BDF8',
    primaryLight: '#7DD3FC',
    primaryFaded: '#0C4A6E',
    success: '#34D399',
    successFaded: '#064E3B',
    warning: '#FBBF24',
    warningFaded: '#78350F',
    danger: '#F87171',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
  }
};


// NEWTOWN LOGO COMPONENT
// ================================================
const NewtownLogo = ({ size = 'normal' }) => {
  const height = size === 'small' ? 35 : size === 'large' ? 60 : 45;
  return (
    <img 
      src="/logo.png" 
      alt="Newtown Foot & Ankle Specialists" 
      style={{ height, width: 'auto' }} 
    />
  );
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
    } catch {
      return [];
    }
  },
  
  savePattern: (pattern) => {
    if (typeof window === 'undefined') return;
    try {
      const patterns = PatternStorage.getPatterns();
      const newPattern = {
        id: Date.now(),
        ...pattern,
        createdAt: new Date().toISOString(),
        usageCount: 0
      };
      patterns.push(newPattern);
      localStorage.setItem(PatternStorage.STORAGE_KEY, JSON.stringify(patterns));
      return newPattern;
    } catch (e) {
      console.error('Failed to save pattern:', e);
    }
  },
  
  findMatches: (input) => {
    const patterns = PatternStorage.getPatterns();
    const inputLower = input.toLowerCase();
    const keywords = inputLower.split(/\s+/).filter(w => w.length > 3);
    
    return patterns
      .map(pattern => {
        const patternKeywords = pattern.keywords || [];
        const matches = patternKeywords.filter(k => 
          inputLower.includes(k.toLowerCase()) || 
          keywords.some(kw => k.toLowerCase().includes(kw))
        );
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
    } catch (e) {
      console.error('Failed to update pattern:', e);
    }
  },
  
  deletePattern: (patternId) => {
    if (typeof window === 'undefined') return;
    try {
      const patterns = PatternStorage.getPatterns().filter(p => p.id !== patternId);
      localStorage.setItem(PatternStorage.STORAGE_KEY, JSON.stringify(patterns));
    } catch (e) {
      console.error('Failed to delete pattern:', e);
    }
  },
  
  extractKeywords: (text) => {
    const stopWords = new Set(['the', 'and', 'for', 'with', 'has', 'had', 'was', 'were', 'been', 'being', 'have', 'that', 'this', 'from', 'they', 'will', 'would', 'could', 'should', 'patient', 'note', 'today']);
    const clinicalTerms = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    const freq = {};
    clinicalTerms.forEach(term => { freq[term] = (freq[term] || 0) + 1; });
    
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term]) => term);
  }
};

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function MDMGenerator() {
  const [themeMode, setThemeMode] = useState('light');
  const theme = THEMES[themeMode];
  
  // Core state
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Mode state
  const [outputMode, setOutputMode] = useState('quick');
  const [isListening, setIsListening] = useState(false);
  
  // Pattern state
  const [matchedPatterns, setMatchedPatterns] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [patternName, setPatternName] = useState('');
  const [savedPatterns, setSavedPatterns] = useState([]);
  const [showPatternLibrary, setShowPatternLibrary] = useState(false);
  
  // NEW: Billing language state
  const [addMod25, setAddMod25] = useState(false);
  const [addEmLevel, setAddEmLevel] = useState(false);
  const [emLevel, setEmLevel] = useState('99214');
  
  // NEW: Refine state
  const [refineInput, setRefineInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeMode(prefersDark ? 'dark' : 'light');
      setSavedPatterns(PatternStorage.getPatterns());
    }
  }, []);
  
  useEffect(() => {
    if (input.length > 20) {
      const matches = PatternStorage.findMatches(input);
      setMatchedPatterns(matches);
    } else {
      setMatchedPatterns([]);
    }
  }, [input]);
  
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice input not supported in this browser. Try Chrome or Edge.');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      setIsListening(false);
      if (e.error !== 'no-speech') {
        setError('Voice recognition error: ' + e.error);
      }
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => {
        if (prev && !prev.endsWith(' ') && !prev.endsWith('\n')) {
          return prev + ' ' + transcript;
        }
        return prev + transcript;
      });
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };
  
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  const generateMDM = async (modeOverride) => {
    const useMode = modeOverride || outputMode;
    
    if (!input.trim()) {
      setError('Please enter clinical information first.');
      return;
    }
    
    setLoading(true);
    setError('');
    setOutput('');
    setRefineInput('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: input.trim(),
          mode: useMode,
          addMod25: addMod25,
          emLevel: addEmLevel ? emLevel : null
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }
      
      setOutput(data.output);
    } catch (e) {
      setError(e.message || 'Failed to generate MDM. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle mode toggle - auto-regenerate if there's input
  const handleModeChange = (newMode) => {
    setOutputMode(newMode);
    if (input.trim()) {
      generateMDM(newMode);
    }
  };
  
  // NEW: Refine output function
  const refineOutput = async () => {
    if (!refineInput.trim()) {
      setError('Please enter a refinement instruction.');
      return;
    }
    
    if (!output) {
      setError('No output to refine. Generate first.');
      return;
    }
    
    setIsRefining(true);
    setError('');
    
    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          originalOutput: output,
          instruction: refineInput.trim()
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to refine');
      }
      
      setOutput(data.output);
      setRefineInput('');
    } catch (e) {
      setError(e.message || 'Failed to refine. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy. Please select and copy manually.');
    }
  };
  
  const saveAsPattern = () => {
    if (!patternName.trim() || !output) return;
    
    const keywords = PatternStorage.extractKeywords(input + ' ' + output);
    const pattern = {
      name: patternName.trim(),
      keywords,
      inputSample: input.substring(0, 200),
      outputTemplate: output,
      mode: outputMode
    };
    
    PatternStorage.savePattern(pattern);
    setSavedPatterns(PatternStorage.getPatterns());
    setShowSaveDialog(false);
    setPatternName('');
  };
  
  const usePattern = (pattern) => {
    setOutput(pattern.outputTemplate);
    setOutputMode(pattern.mode || 'quick');
    PatternStorage.incrementUsage(pattern.id);
    setMatchedPatterns([]);
  };
  
  const deletePattern = (patternId) => {
    PatternStorage.deletePattern(patternId);
    setSavedPatterns(PatternStorage.getPatterns());
  };
  
  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setMatchedPatterns([]);
    setRefineInput('');
  };

  // Checkbox component for consistent styling
  const Checkbox = ({ checked, onChange, label, sublabel }) => (
    <label style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: 8, 
      cursor: 'pointer',
      padding: '8px 12px',
      background: checked ? theme.primaryFaded : theme.cardAlt,
      border: `1px solid ${checked ? theme.primary : theme.border}`,
      borderRadius: 8,
      transition: 'all 0.2s'
    }}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 2, accentColor: theme.primary }}
      />
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: theme.textMuted }}>{sublabel}</div>}
      </div>
    </label>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      color: theme.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'background 0.3s, color 0.3s'
    }}>
      <Head>
        <title>MDM Paragraph Generator | Newtown Foot & Ankle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <header style={{
        background: theme.card,
        borderBottom: `1px solid ${theme.border}`,
        padding: '12px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: theme.shadow
      }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NewtownLogo theme={theme} size="small" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: theme.text, lineHeight: 1.2 }}>
                NEWTOWN
              </div>
              <div style={{ fontSize: 11, color: theme.textSecondary, letterSpacing: '0.5px' }}>
                FOOT & ANKLE SPECIALISTS
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: theme.successFaded,
              color: theme.success,
              fontSize: 11,
              padding: '4px 8px',
              borderRadius: 4,
              fontWeight: 600
            }}>
              ✓ Audit-Ready
            </span>
            
            <button
              onClick={() => setShowPatternLibrary(!showPatternLibrary)}
              style={{
                background: savedPatterns.length > 0 ? theme.primaryFaded : theme.cardAlt,
                border: `1px solid ${theme.border}`,
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 12,
                color: savedPatterns.length > 0 ? theme.primary : theme.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              📚 {savedPatterns.length}
            </button>
            
            <button
              onClick={() => setThemeMode(t => t === 'light' ? 'dark' : 'light')}
              style={{
                background: theme.cardAlt,
                border: `1px solid ${theme.border}`,
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              {themeMode === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: theme.text }}>
            MDM Paragraph Generator
          </h1>
          <p style={{ fontSize: 14, color: theme.textSecondary, margin: '6px 0 0' }}>
            Paste S/O + your note → Get audit-ready MDM reasoning
          </p>
        </div>

        {/* Pattern Library Panel */}
        {showPatternLibrary && savedPatterns.length > 0 && (
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
            boxShadow: theme.shadowLg
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>📚 Saved Patterns ({savedPatterns.length})</h3>
              <button onClick={() => setShowPatternLibrary(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: theme.textMuted }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {savedPatterns.map(pattern => (
                <div key={pattern.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: theme.cardAlt, borderRadius: 8, gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{pattern.name}</div>
                    <div style={{ fontSize: 12, color: theme.textMuted }}>Used {pattern.usageCount || 0}x • {pattern.keywords?.slice(0, 4).join(', ')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => usePattern(pattern)} style={{ background: theme.primary, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Use</button>
                    <button onClick={() => deletePattern(pattern.id)} style={{ background: theme.warningFaded, color: theme.warning, border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pattern Match Suggestions */}
        {matchedPatterns.length > 0 && !output && (
          <div style={{ background: theme.warningFaded, border: `1px solid ${theme.warning}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.warning, marginBottom: 8 }}>💡 Similar patterns found:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {matchedPatterns.map(pattern => (
                <button key={pattern.id} onClick={() => usePattern(pattern)} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer', color: theme.text }}>{pattern.name}</button>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Input */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: theme.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Clinical Input</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={isListening ? stopVoiceInput : startVoiceInput} style={{ background: isListening ? theme.danger : theme.cardAlt, color: isListening ? '#fff' : theme.textSecondary, border: `1px solid ${isListening ? theme.danger : theme.border}`, borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {isListening ? '⏹ Stop' : '🎤 Voice'}
              </button>
              {input && <button onClick={clearAll} style={{ background: theme.cardAlt, color: theme.textSecondary, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>Clear</button>}
            </div>
          </div>
          
          {isListening && (
            <div style={{ background: theme.primaryFaded, color: theme.primary, padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, background: theme.danger, borderRadius: '50%', animation: 'pulse 1s infinite' }} />
              Listening... Speak your clinical notes
            </div>
          )}
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your S/O from ModMed here, then add your note...

Example:
S: 58 y/o male, left PF 4 months, had injection 6 wks ago — 50% better for 2 weeks then pain returned.

O: TTP medial tubercle. Windlass positive.

Note: Gave shot #2, stressed compliance, recommended custom orthotics`}
            style={{ width: '100%', minHeight: 180, padding: 14, fontSize: 14, lineHeight: 1.6, border: `1px solid ${theme.border}`, borderRadius: 8, background: theme.bgAlt, color: theme.text, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        {/* Quick/Detailed Mode Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <button 
            onClick={() => handleModeChange('quick')} 
            disabled={loading || isRefining}
            style={{ 
              background: outputMode === 'quick' ? theme.primary : theme.cardAlt, 
              color: outputMode === 'quick' ? '#fff' : theme.textSecondary, 
              border: `1px solid ${outputMode === 'quick' ? theme.primary : theme.border}`, 
              borderRadius: 8, 
              padding: '10px 20px', 
              fontSize: 14, 
              cursor: loading || isRefining ? 'wait' : 'pointer', 
              fontWeight: 500, 
              flex: 1, 
              maxWidth: 200,
              opacity: loading || isRefining ? 0.7 : 1
            }}
          >
            ⚡ Quick<div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>75-150 words</div>
          </button>
          <button 
            onClick={() => handleModeChange('detailed')} 
            disabled={loading || isRefining}
            style={{ 
              background: outputMode === 'detailed' ? theme.primary : theme.cardAlt, 
              color: outputMode === 'detailed' ? '#fff' : theme.textSecondary, 
              border: `1px solid ${outputMode === 'detailed' ? theme.primary : theme.border}`, 
              borderRadius: 8, 
              padding: '10px 20px', 
              fontSize: 14, 
              cursor: loading || isRefining ? 'wait' : 'pointer', 
              fontWeight: 500, 
              flex: 1, 
              maxWidth: 200,
              opacity: loading || isRefining ? 0.7 : 1
            }}
          >
            📋 Detailed<div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>200-350 words</div>
          </button>
        </div>

        {/* NEW: Billing Language Options */}
        <div style={{ 
          background: theme.card, 
          border: `1px solid ${theme.border}`, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          boxShadow: theme.shadow
        }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: theme.text }}>
            📋 Billing Language (Optional)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Checkbox 
              checked={addMod25} 
              onChange={setAddMod25}
              label="Add Modifier 25 Language"
              sublabel="Separate & identifiable E/M service"
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <Checkbox 
                checked={addEmLevel} 
                onChange={setAddEmLevel}
                label="Add E/M Level Justification"
                sublabel="Complexity-based billing support"
              />
              {addEmLevel && (
                <select
                  value={emLevel}
                  onChange={(e) => setEmLevel(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: 14,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 6,
                    background: theme.bgAlt,
                    color: theme.text,
                    cursor: 'pointer'
                  }}
                >
                  <option value="99213">99213 - Low Complexity</option>
                  <option value="99214">99214 - Moderate Complexity</option>
                  <option value="99215">99215 - High Complexity</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button 
          onClick={() => generateMDM()} 
          disabled={loading || isRefining || !input.trim()} 
          style={{ 
            width: '100%', 
            padding: '16px 24px', 
            fontSize: 16, 
            fontWeight: 600, 
            background: loading || isRefining ? theme.textMuted : theme.primary, 
            color: '#fff', 
            border: 'none', 
            borderRadius: 10, 
            cursor: loading || isRefining || !input.trim() ? 'not-allowed' : 'pointer', 
            marginBottom: 20, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 10, 
            boxShadow: theme.shadowLg 
          }}
        >
          {loading ? 'Generating...' : 'Generate MDM Paragraph'}
        </button>

        {/* Error Display */}
        {error && <div style={{ background: theme.warningFaded, color: theme.danger, padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

        {/* Output Section */}
        {output && (
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, boxShadow: theme.shadow, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <label style={{ fontWeight: 600, fontSize: 14 }}>
                MDM Output — {outputMode === 'quick' ? 'Quick' : 'Detailed'}
                {addMod25 && <span style={{ marginLeft: 8, fontSize: 11, background: theme.primaryFaded, color: theme.primary, padding: '2px 6px', borderRadius: 4 }}>+Mod 25</span>}
                {addEmLevel && <span style={{ marginLeft: 4, fontSize: 11, background: theme.successFaded, color: theme.success, padding: '2px 6px', borderRadius: 4 }}>+{emLevel}</span>}
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowSaveDialog(true)} style={{ background: theme.cardAlt, color: theme.textSecondary, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>💾 Save Pattern</button>
                <button onClick={copyToClipboard} style={{ background: copied ? theme.success : theme.primary, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, cursor: 'pointer', fontWeight: 500, minWidth: 100 }}>
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 16, fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: theme.text }}>{output}</div>
            
            {/* NEW: Refine Input */}
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !isRefining) refineOutput(); }}
                placeholder='✏️ Refine: "add failed conservative care" or "make it shorter"'
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  fontSize: 14,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  background: theme.bgAlt,
                  color: theme.text
                }}
              />
              <button
                onClick={refineOutput}
                disabled={isRefining || !refineInput.trim()}
                style={{
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  background: isRefining ? theme.textMuted : theme.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: isRefining || !refineInput.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {isRefining ? '...' : 'Refine'}
              </button>
            </div>
          </div>
        )}

        {/* Save Pattern Dialog */}
        {showSaveDialog && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div style={{ background: theme.card, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, boxShadow: theme.shadowLg }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>💾 Save as Pattern</h3>
              <p style={{ fontSize: 13, color: theme.textSecondary, margin: '0 0 16px' }}>Save this output as a reusable pattern.</p>
              <input type="text" value={patternName} onChange={(e) => setPatternName(e.target.value)} placeholder="Pattern name (e.g., 'PF - 2nd injection')" style={{ width: '100%', padding: '12px 14px', fontSize: 14, border: `1px solid ${theme.border}`, borderRadius: 8, background: theme.bgAlt, color: theme.text, marginBottom: 16, boxSizing: 'border-box' }} autoFocus />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setShowSaveDialog(false); setPatternName(''); }} style={{ flex: 1, padding: '12px 16px', fontSize: 14, background: theme.cardAlt, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveAsPattern} disabled={!patternName.trim()} style={{ flex: 1, padding: '12px 16px', fontSize: 14, fontWeight: 600, background: patternName.trim() ? theme.primary : theme.textMuted, color: '#fff', border: 'none', borderRadius: 8, cursor: patternName.trim() ? 'pointer' : 'not-allowed' }}>Save</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ maxWidth: 900, margin: '24px auto', textAlign: 'center', color: theme.textMuted, fontSize: 12, padding: '0 16px' }}>
        <div>Newtown Foot & Ankle Specialists • MDM Documentation Tool</div>
        <div style={{ marginTop: 4 }}>Type • Paste • Voice → Generate → Refine → Copy to ModMed</div>
      </footer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        textarea::placeholder, input::placeholder { color: ${theme.textMuted}; }
        textarea:focus, input:focus, select:focus { outline: none; border-color: ${theme.primary}; }
      `}</style>
    </div>
  );
}
