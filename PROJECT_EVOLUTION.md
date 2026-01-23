# MDM Paragraph Generator — Project Evolution & History

## Overview

**Purpose:** Generate concise Medical Decision Making paragraphs from ModMed S/O data + brief clinician notes. Output is pasted above/into Impression/Plan section to demonstrate clinical reasoning and justify E/M billing level (typically 99214).

**Live URL:** https://mdm-generator.vercel.app  
**GitHub:** https://github.com/mjlynde-lab/mdm-generator  
**Created:** January 16, 2026

---

## The Problem We Solved

### ModMed's Limitation
ModMed has pre-built "Counseling Block" templates that render as walls of boilerplate text:
- Plantar Fasciitis Care ✓
- Expectations ✓  
- NSAIDs ✓
- Home Exercise Program ✓
- Surgical Options ✓
- Conservative Options ✓

**What renders:** Generic checkbox regurgitation with no clinical reasoning.

**What's missing:** The "WHY" — why THIS patient, why THIS treatment, why NOW. No MDM. No audit defense.

### The Solution
A simple tool that:
1. Takes pasted S/O from ModMed + brief clinician note
2. Generates ONE concise MDM paragraph (75-150 words for Quick, 200-350 for Detailed)
3. Ready to copy/paste into ModMed above Impression/Plan

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 16, 2026 | Initial deployment - basic input/output UI, Claude API integration |
| 2.0.0 | Jan 16, 2026 | Added Quick/Detailed modes, Voice input, Pattern Learning, Dark/Light theme |

---

## Session 2: v2.0.0 Feature Build (January 16, 2026 Evening)

### Features Added
1. **Quick vs Detailed Toggle** - Quick mode (75-150 words) vs Detailed mode (200-350 words with differential diagnosis, risk stratification, data reviewed)
2. **Auto-regenerate on toggle** - Clicking Quick/Detailed automatically regenerates if input exists
3. **Voice Input** - Microphone button for dictation (non-continuous mode to prevent repeating)
4. **Pattern Learning System** - Save successful outputs as reusable patterns, keyword matching suggests similar patterns
5. **Dark/Light Theme** - System preference detection + manual toggle
6. **Audit-Ready Badge** - Visual indicator in header

### Deployment Challenges & Lessons Learned

| Problem | Cause | Solution |
|---------|-------|----------|
| Files uploaded flat | GitHub web UI doesn't preserve folder structure on drag-drop | Create folders manually, upload files one-by-one |
| Nested folder accident | Pasted code into filename field | Delete bad folders, recreate correctly |
| API auth error | Missing `ANTHROPIC_API_KEY` in Vercel | Re-add env variable, redeploy |
| Quick/Detailed not working | Frontend updated but API file (`generate.js`) wasn't | Update API to accept `mode` parameter |
| Voice repeating words | `continuous: true` setting | Changed to `continuous: false` |
| Logo mismatch | Attempted SVG recreation of brand logo | **TODO: Upload actual PNG to public folder** |

### Current File Structure
```
mdm-generator/
├── package.json
├── next.config.js
├── pages/
│   ├── _app.js           (CSS import wrapper)
│   ├── index.js          (Full v2 UI with all features)
│   └── api/
│       └── generate.js   (Claude API with mode support)
└── styles/
    └── globals.css       (Base styles)
```

### What's Working ✅
- Quick/Detailed mode toggle with auto-regenerate
- Voice input (single phrase, click again to continue)
- Pattern save/use/delete with keyword matching
- Dark/Light theme toggle
- Copy to clipboard with confirmation
- Claude API generation with clinical philosophy

### What's NOT Working ❌
- Logo is still approximated SVG (not actual brand image)

### Tomorrow's Fix (5 min)
1. Upload `IMG_0445.PNG` to repo root or `public/` folder
2. Change `NewtownLogo` component to: `<img src="/IMG_0445.PNG" height={35} />`

---

## System Prompt (Core Logic)

The system prompt encodes:

### Output Rules
- **Quick Mode:** ONE paragraph, 3-6 sentences, 75-150 words
- **Detailed Mode:** ONE paragraph, 6-10 sentences, 200-350 words + differential diagnosis, risk stratification, data reviewed
- Plain text only — NO bold, NO asterisks, NO markdown
- Start with "Medical Decision Making:"
- EMR copy-paste ready

### Clinical Philosophy (Dr. Lynde's approach)
- **Curative options** (EPAT, Exosome, Custom orthotics) address underlying pathology
- **Symptomatic options** (Injections, NSAIDs) are "band-aids" for pain
- Injection #3 = diminishing returns, pivot to regenerative
- Custom orthotics control pathological motion
- Medrol Dosepak: avoid in diabetics (hyperglycemia)
- Anticoagulant patients: avoid NSAIDs, increases MDM complexity

### What NOT to do
- Don't repeat the full S/O back
- Don't generate treatment plans or bullet lists
- Don't use template language like "patient educated"
- Don't include ICD-10 codes
- Don't be verbose

---

## Pattern Learning System (v1)

### How It Works
1. **Save Pattern** - After generating output you like, click "Save Pattern" and give it a name (e.g., "PF - 2nd injection")
2. **Keyword Extraction** - System automatically extracts top 10 clinical keywords from input + output
3. **Pattern Matching** - When typing new input, system compares keywords against saved patterns
4. **Suggestions** - If match score > 0, suggests similar patterns in yellow banner
5. **Usage Tracking** - Tracks how often each pattern is used

### Storage
- localStorage (browser-based, device-specific)
- No PHI stored — only clinical logic patterns
- Patterns persist across sessions on same device

### Future v2 (Roadmap)
- Automatic pattern extraction (no manual save)
- Edit tracking (learn from user corrections)
- Cloud sync across devices
- Confidence scoring for suggestions

---

## Deployment & Environment

### Vercel Settings
- **Framework:** Next.js 14
- **Build Command:** (default)
- **Output Directory:** (default)
- **Environment Variable:** `ANTHROPIC_API_KEY` (required)

### To Update
1. Edit files in GitHub repo (web UI or git push)
2. Vercel auto-deploys on commit to main branch
3. Check Deployments tab for build status

### Troubleshooting
| Issue | Check |
|-------|-------|
| "Failed to generate" | Verify `ANTHROPIC_API_KEY` in Vercel env vars |
| Blank output | Ensure input has S/O + "Note:" line |
| Old version showing | Hard refresh (Cmd+Shift+R) or wait for deploy |
| Voice not working | Use Chrome or Edge, allow microphone permission |

---

## Usage Instructions

1. Open https://mdm-generator.vercel.app
2. Copy S/O section from ModMed patient note
3. Paste into input box
4. Add brief note: "Note: [what you did/decided]"
5. Select **Quick** or **Detailed** mode
6. Click **Generate MDM Paragraph** (or just click the mode button)
7. Click **Copy** 
8. Paste into ModMed above Impression/Plan section

### Optional: Save as Pattern
- If you like the output, click **Save Pattern**
- Give it a descriptive name
- Next time you have similar input, it will suggest the pattern

---

## Related Projects

- **MDM Workstation** (newtown-mdm.vercel.app) - More comprehensive tool with preferences system
- **Continuum** - Future clinical intelligence platform (MDM tools will integrate as microservices)

---# MDM Generator - PROJECT_EVOLUTION Update

## Add This Entry to Your Existing PROJECT_EVOLUTION.md

---

### Session: January 23, 2026

**Focus:** MDM Generator v3.0 Architecture — Lean Mode + Auto E/M Interpretation

#### What Changed

Completed major architectural rethink aligning MDM Generator with ModMed EMR workflow.

**Key Insight:** ModMed protocols handle counseling documentation via checkboxes. MDM Generator output should focus purely on clinical reasoning—no redundant "discussed with patient" attestations.

#### New Architecture (v3.0)

| Mode | Word Count | Purpose |
|------|------------|---------|
| **⚡ Lean** | 75-150 | "ModMed Mode" — assumes protocols handle counseling; outputs ASSESSMENT → PLAN → FOLLOW-UP only |
| **📋 Protocol-Aware** | 200-350 | Full MDM justification with complexity bullets, medication considerations, comorbidity integration |

**Existing Quick/Detailed toggle maps directly to Lean/Protocol-Aware.** No UI change needed.

#### Auto E/M + Modifier 25 Detection

App now interprets its own output and appends:

```
---
E/M Level: 99214 (Moderate complexity)
Modifier 25: YES — Significant, separately identifiable E/M service; 
clinical reasoning distinct from procedure performed.
```

**Manual toggles to remove:**
- "Add Modifier 25 Language" checkbox → DELETE (now auto-detected)
- "Add E/M Level Justification" checkbox → DELETE (now always included)

#### Documents Created

- `mdm-generator-prompts-v3.md` — Complete system prompts for both modes + condition-specific modifiers (.pf, .neuroma, .achilles, .peroneal, .df, .wc)

#### UI Decision

Reviewed proposal to apply Continuum design system (Pearl boxes, Evidence Notes, etc.). **Rejected** — those components are for surgical case cards with literature citations. MDM Generator is a utility tool; current dark theme works fine.

#### Current State

- ✅ Architecture defined
- ✅ Prompts written
- ⏳ API implementation pending
- ⏳ UI updates pending (remove checkboxes, add footer)
- ⏳ Testing pending

#### Next Steps

1. Implement v3.0 prompts in API
2. Remove billing checkboxes from UI
3. Add E/M + Mod25 footer display
4. Test with real scenarios
5. Deploy to Vercel

---

## Condensed Version (for History file)

```markdown
# 2026-01-23 Session Summary

**Focus:** MDM Generator v3.0 — Lean Mode + Auto E/M Interpretation

## Key Outcomes
- Defined two-mode architecture: Lean (ModMed-aware, 75-150 words) vs Protocol-Aware (full MDM, 200-350 words)
- Added auto E/M level interpretation (99213/99214/99215)
- Added auto Modifier 25 detection (procedure + separate E/M work)
- Created complete v3.0 system prompts with condition-specific modifiers
- Decided against UI redesign — current design works

## Decisions
- Manual billing toggles become redundant (auto-detected now)
- Quick/Detailed toggle maps directly to Lean/Protocol-Aware
- No Continuum design system for MDM Generator (overkill)

## Files Created
- `mdm-generator-prompts-v3.md` — Complete system prompts

## Current State
Architecture and prompts ready; implementation pending

## Next Up
1. Implement v3.0 prompts in API
2. Update UI (remove checkboxes, add footer)
3. Test and deploy

## Restart Prompt
> MDM Generator v3.0 implementation. Prompts ready in mdm-generator-prompts-v3.md. 
> Need to: update API with new prompts, remove billing checkboxes, add E/M+Mod25 
> footer display, test, deploy. Repo: github.com/mjlynde-lab/mdm-generator
```

*Last updated: January 16, 2026 — Session 2 (v2.0.0)*
