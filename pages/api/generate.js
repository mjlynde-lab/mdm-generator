import Anthropic from '@anthropic-ai/sdk';
import * as parserModule from '../../utils/shorthandParser';
import * as engineModule from '../../utils/templateEngine';

// Resolve the actual functions from whatever export format
const parseShorthand = parserModule.parseShorthand || parserModule.default;
const assemblePlan = engineModule.assemblePlan || engineModule.default;

const client = new Anthropic();

// ============================================
// MDM GENERATOR v4.0 — PROMPT 6 INTEGRATION
// Dual mode: Shorthand Templates + Legacy Free-Text
// ============================================

// ============================================
// SHORTHAND DETECTION
// ============================================
function isShorthandInput(input) {
  const lower = input.toLowerCase().trim();
  const shorthandPatterns = [
    /^(fv|fu|first visit|follow up|followup|1st visit|new pt|return visit)\b/,
    /\b(heel|neuroma|achilles|peroneal|cdfe|wound|abn)\b.*[+-]/,
    /^(heel|neuroma|achilles|peroneal|cdfe|wound|abn)\s+(fv|fu|first|follow)/,
  ];
  return shorthandPatterns.some(p => p.test(lower));
}

// ============================================
// MDM WRAPPER PROMPT (for shorthand template flow)
// ============================================
const MDM_WRAPPER_LEAN = `You are a board-certified podiatric surgeon. You are given a pre-assembled treatment plan from a clinical template engine. Your job is to WRAP this plan with proper MDM clinical reasoning documentation.

RULES:
- Keep ALL plan items exactly as provided — do not add, remove, or reword them
- Add an ASSESSMENT section BEFORE the plan that provides clinical reasoning context
- Add a FOLLOW-UP section AFTER the plan
- The assessment should demonstrate WHY these specific interventions were chosen
- Show the "considered → selected because" reasoning pattern
- Reference comorbidities and contraindications when relevant to the plan items

OUTPUT STRUCTURE:
ASSESSMENT:
[1-2 sentences: Diagnosis + chronicity/status + key complicating factor + what was considered/ruled out]

PLAN:
[Insert the provided plan items exactly as given]

FOLLOW-UP: [Timeframe]. Sooner if [1-2 specific red flags].

STYLE RULES:
- Plain text ONLY — NO bold, NO asterisks, NO markdown
- Tight clinical prose — every word earns its place
- Use em-dashes (—) not hyphens for rationale separation
- No counseling attestations ("discussed risks," "patient verbalized understanding")
- No "Discussed with patient..." statements

TARGET: 75-150 words total

CLINICAL PHILOSOPHY:
- Curative (EPAT, Exosome, Custom orthotics) vs Symptomatic (Injections, NSAIDs)
- Injection #3 = diminishing returns, pivot to regenerative options
- Corticosteroid injection in Achilles: ABSOLUTELY CONTRAINDICATED

After generating the note, add a separator line (---) and provide:
E/M Level: [99213/99214/99215] ([Low-moderate/Moderate/High] complexity)
Modifier 25: [YES/NO/NOT APPLICABLE] — [Audit-defensible rationale per rules below]

MODIFIER 25 RULES:
When YES, your rationale MUST include:
1. The procedure performed (e.g., "cortisone injection to 3rd intermetatarsal space")
2. The independent E/M component: what was evaluated, reassessed, or reconsidered diagnostically beyond performing the procedure
3. Plan modifications or clinical decisions separate from the procedure (e.g., custom orthotics ordered, imaging ordered, medication adjusted, treatment escalation pathway established, biomechanical intervention added)
4. Conclude with: "E/M constitutes separately identifiable medical decision-making distinct from the procedural component"
When NO: "No procedure performed; E/M billed independently"
When NOT APPLICABLE: state reason`;

const MDM_WRAPPER_DETAILED = `You are a board-certified podiatric surgeon. You are given a pre-assembled treatment plan from a clinical template engine. Your job is to WRAP this plan with comprehensive MDM documentation that explicitly justifies E/M complexity level.

RULES:
- Keep ALL plan items exactly as provided — do not add, remove, or reword them
- Add Assessment, MDM complexity section, and Follow-up around the plan
- Emphasize the THREE PILLARS: Problems, Data, Risk
- Show "considered X, ruled out Y, selected Z because..." reasoning

OUTPUT STRUCTURE:
ASSESSMENT:
[Diagnosis] with [chronicity/progression]. [Comorbidity impact]. [Differential considerations]. [Risk stratification].

MEDICAL DECISION MAKING: [Moderate/High] complexity
• Problems: [Chronic illness with progression/exacerbation] OR [Multiple conditions addressed]
• Data: [Imaging reviewed/External records/Medication reconciliation]
• Risk: [Prescription management with attention to ___] OR [Decision-making complicated by ___]

PLAN:
[Insert the provided plan items exactly as given]

Medication considerations: [1-2 sentences on interactions/contraindications if relevant]

FOLLOW-UP:
[Timeframe]. Return sooner if: [condition-specific red flags]. [Monitoring requirements].

STYLE RULES:
- Plain text ONLY — NO bold, NO asterisks, NO markdown
- MDM bullet section uses bullet points (•)
- Plan items use numbered list with colon separator
- Include specific quantified data where available
- No counseling attestations

TARGET: 200-350 words total

CLINICAL PHILOSOPHY:
- Curative (EPAT, Exosome, Custom orthotics) vs Symptomatic (Injections, NSAIDs)
- Injection #3 = diminishing returns, pivot to regenerative options
- Corticosteroid injection in Achilles: ABSOLUTELY CONTRAINDICATED

After generating the note, add a separator line (---) and provide:
E/M Level: [99213/99214/99215] ([Low-moderate/Moderate/High] complexity)
Modifier 25: [YES/NO/NOT APPLICABLE] — [Audit-defensible rationale per rules below]

MODIFIER 25 RULES:
When YES, your rationale MUST include:
1. The procedure performed (e.g., "cortisone injection to 3rd intermetatarsal space")
2. The independent E/M component: what was evaluated, reassessed, or reconsidered diagnostically beyond performing the procedure
3. Plan modifications or clinical decisions separate from the procedure (e.g., custom orthotics ordered, imaging ordered, medication adjusted, treatment escalation pathway established, biomechanical intervention added)
4. Conclude with: "E/M constitutes separately identifiable medical decision-making distinct from the procedural component"
When NO: "No procedure performed; E/M billed independently"
When NOT APPLICABLE: state reason`;

// ============================================
// LEGACY FREE-TEXT PROMPTS (unchanged from v3.0)
// ============================================
const LEAN_PROMPT = `You are a board-certified podiatric surgeon generating concise MDM documentation for the Plan section of a SOAP note.

CONTEXT:
- EMR: ModMed (ema) with protocol-driven counseling blocks
- ModMed ALREADY documents that counseling occurred via checkboxes and lean text
- Your job: Generate CLINICAL REASONING only — the "why" behind the plan
- DO NOT include counseling attestations ("discussed risks," "patient verbalized understanding," etc.)
- The protocol handles counseling proof; you handle decision-making proof

OUTPUT STRUCTURE:
ASSESSMENT:
[1-2 sentences: Diagnosis + chronicity/status + key complicating factor if present + what was ruled out]

PLAN:
1. [Intervention] — [brief rationale, tie to patient factors if relevant]
2. [Intervention] — [brief rationale]
3. [Intervention] — [brief rationale]
[Continue as needed, typically 3-5 items]

FOLLOW-UP: [Timeframe]. Sooner if [1-2 specific red flags].

STYLE RULES:
- No headers beyond ASSESSMENT, PLAN, FOLLOW-UP
- No bullet points for MDM complexity (save that for Protocol-Aware mode)
- No "Discussed with patient..." statements
- No medication interaction paragraphs (integrate briefly into plan rationale if critical)
- Tight, clinical prose — every word earns its place
- Use em-dashes (—) not hyphens for rationale separation
- Plain text ONLY — NO bold, NO asterisks, NO markdown

TARGET: 75-150 words

CLINICAL PHILOSOPHY:
- Curative (EPAT, Exosome, Custom orthotics) vs Symptomatic (Injections, NSAIDs)
- Injection #3 = diminishing returns, pivot to regenerative options
- Medrol Dosepak: Avoid in diabetics
- NSAIDs + Anticoagulants: Contraindicated
- Corticosteroid injection in Achilles: ABSOLUTELY CONTRAINDICATED

After generating the note, add a separator line (---) and provide:
E/M Level: [99213/99214/99215] ([Low-moderate/Moderate/High] complexity)
Modifier 25: [YES/NO/NOT APPLICABLE] — [Audit-defensible rationale per rules below]

MODIFIER 25 RULES:
When YES, your rationale MUST include:
1. The procedure performed (e.g., "cortisone injection to 3rd intermetatarsal space")
2. The independent E/M component: what was evaluated, reassessed, or reconsidered diagnostically beyond performing the procedure
3. Plan modifications or clinical decisions separate from the procedure (e.g., custom orthotics ordered, imaging ordered, medication adjusted, treatment escalation pathway established, biomechanical intervention added)
4. Conclude with: "E/M constitutes separately identifiable medical decision-making distinct from the procedural component"
When NO: "No procedure performed; E/M billed independently"
When NOT APPLICABLE: state reason`;

const PROTOCOL_AWARE_PROMPT = `You are a board-certified podiatric surgeon generating comprehensive MDM documentation that explicitly justifies E/M complexity level.

CONTEXT:
- This output is for complex cases, audit defense, or standalone documentation
- Emphasize the THREE PILLARS of MDM: Problems, Data, Risk
- Integrate comorbidity impact on every treatment decision
- Show clinical reasoning explicitly — "considered X, ruled out Y, selected Z because..."

DEFAULT ASSUMPTION:
This is a chronic/progressive condition in a patient with relevant comorbidities, requiring clinical judgment around medication interactions, treatment escalation, and risk management.

OUTPUT STRUCTURE:
ASSESSMENT:
[Diagnosis] with [chronicity/progression]. [Comorbidity impact on presentation or treatment]. [Differential considerations — what was considered and ruled out]. [Risk stratification if applicable].

MEDICAL DECISION MAKING: [Moderate/High] complexity
• Problems: [Chronic illness with progression/exacerbation] OR [Multiple conditions addressed]
• Data: [Imaging reviewed/External records/Medication reconciliation performed]
• Risk: [Prescription management with attention to ___] OR [Decision-making complicated by ___]

PLAN:
1. [Intervention]: [Rationale with explicit attention to comorbidities/interactions]
2. [Intervention]: [Rationale]
3. [Intervention]: [Rationale]
[Continue as needed]

Medication considerations: [Specific interactions, contraindications, or monitoring needs based on patient's comorbidities/medication list — 1-2 sentences max]

FOLLOW-UP:
[Timeframe]. Return sooner if: [condition-specific red flags]. [Monitoring requirements related to treatment/comorbidities if applicable].

STYLE RULES:
- Use the exact headers shown above
- MDM bullet section uses bullet points (•) — this is the exception
- Plan items use numbered list with colon separator
- "Medication considerations" is a single brief paragraph, not a list
- Include specific quantified data where available (A1c values, eGFR, BMI, etc.)
- Mention specific drug names, not classes, when documenting interactions
- Plain text ONLY — NO bold, NO asterisks, NO markdown

TARGET: 200-350 words

CLINICAL PHILOSOPHY:
- Curative (EPAT, Exosome, Custom orthotics) vs Symptomatic (Injections, NSAIDs)
- Injection #3 = diminishing returns, pivot to regenerative options
- Medrol Dosepak: Avoid in diabetics
- NSAIDs + Anticoagulants: Contraindicated
- Corticosteroid injection in Achilles: ABSOLUTELY CONTRAINDICATED

After generating the note, add a separator line (---) and provide:
E/M Level: [99213/99214/99215] ([Low-moderate/Moderate/High] complexity)
Modifier 25: [YES/NO/NOT APPLICABLE] — [Audit-defensible rationale per rules below]

MODIFIER 25 RULES:
When YES, your rationale MUST include:
1. The procedure performed (e.g., "cortisone injection to 3rd intermetatarsal space")
2. The independent E/M component: what was evaluated, reassessed, or reconsidered diagnostically beyond performing the procedure
3. Plan modifications or clinical decisions separate from the procedure (e.g., custom orthotics ordered, imaging ordered, medication adjusted, treatment escalation pathway established, biomechanical intervention added)
4. Conclude with: "E/M constitutes separately identifiable medical decision-making distinct from the procedural component"
When NO: "No procedure performed; E/M billed independently"
When NOT APPLICABLE: state reason`;

// ============================================
// CONDITION MODIFIERS (legacy free-text only)
// ============================================
const CONDITION_MODIFIERS = {
  pf: `\nCONDITION CONTEXT: Plantar fasciitis\nAssume CHRONIC (3+ months) and RECALCITRANT unless stated otherwise.\nKey decision points: Treatment phase, comorbidity impact (diabetes/steroid glucose, obesity/mechanical, CKD/NSAID limits), injection threshold, EPAT consideration, custom orthotics medical necessity.\nDifferential to rule out: Plantar fascia rupture, tarsal tunnel syndrome, calcaneal stress fracture, fat pad atrophy.`,
  neuroma: `\nCONDITION CONTEXT: Morton's neuroma (interdigital neuroma)\nKey decision points: Injection series tracking (which number), diminishing returns at #3, response quantification, anticoagulation impact, diagnostic uncertainty.\nDifferential to rule out: MTP synovitis/capsulitis, stress fracture, peripheral neuropathy, 2nd interspace involvement.`,
  achilles: `\nCONDITION CONTEXT: Achilles tendinopathy\n⚠️ CRITICAL: Corticosteroid injection is ABSOLUTELY CONTRAINDICATED for Achilles tendon. Document this explicitly.\nKey decision points: Location (insertional vs midsubstance), rupture risk factors (age, fluoroquinolones, statins, diabetes), medication review for tendon-toxic drugs, eccentric loading protocol.\nDifferential to rule out: Partial tear, retrocalcaneal bursitis, Haglund's deformity.`,
  peroneal: `\nCONDITION CONTEXT: Peroneal tendinopathy\nKey decision points: Tear consideration (when MRI needed), subluxation assessment, instability relationship, biomechanical factors (hindfoot varus), injection caution.\nDifferential to rule out: Lateral ankle instability, subluxation, longitudinal split tear, os peroneum syndrome, stress fracture.`,
  df: `\nCONDITION CONTEXT: Diabetic foot evaluation\nKey decision points: Risk stratification (neuropathy, vascular, deformity, prior ulcer/amputation), protective sensation testing, vascular assessment, footwear evaluation, glycemic context.\nRisk categories: Low (intact sensation, no deformity, no PAD), Moderate (any single factor), High (prior ulcer/amputation OR neuropathy + deformity OR neuropathy + PAD).`,
  wc: `\nCONDITION CONTEXT: Wound care / chronic ulcer\nKey decision points: Wound trajectory (improving/stable/deteriorating with quantification), debridement rationale, infection assessment, offloading adequacy, healing barriers.\n⚠️ For serial debridements: Document why continued debridement is medically necessary, what changed, objective measurements, plan modification if not progressing.`
};

function detectCondition(input) {
  const text = input.toLowerCase();
  if (text.includes('plantar fasciitis') || text.includes(' pf ') || (text.includes('heel pain') && text.includes('plantar'))) return 'pf';
  if (text.includes('neuroma') || text.includes("morton") || text.includes('interspace') || text.includes("mulder")) return 'neuroma';
  if (text.includes('achilles') && (text.includes('tendin') || text.includes('tendon'))) return 'achilles';
  if (text.includes('peroneal') && text.includes('tendin')) return 'peroneal';
  if (text.includes('diabetic foot') || text.includes(' dfe') || text.includes('neuropathy exam') || text.includes('diabetic eval')) return 'df';
  if (text.includes('wound') || text.includes('ulcer') || text.includes(' dfu') || text.includes('debridement')) return 'wc';
  return null;
}

function getLegacySystemPrompt(mode, input) {
  const basePrompt = mode === 'detailed' ? PROTOCOL_AWARE_PROMPT : LEAN_PROMPT;
  const condition = detectCondition(input);
  const conditionModifier = condition ? CONDITION_MODIFIERS[condition] : '';
  return basePrompt + conditionModifier;
}

// ============================================
// MAIN HANDLER
// ============================================
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, mode = 'quick', subjective = '' } = req.body;

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Input is required' });
  }

  try {
    // ========================================
    // DETECT: Shorthand or Legacy free-text?
    // ========================================
    const useShorthand = isShorthandInput(input);

    if (useShorthand) {
      // ====================================
      // SHORTHAND TEMPLATE FLOW
      // ====================================
      
      // Check that imports loaded successfully
      if (typeof parseShorthand !== 'function' || typeof assemblePlan !== 'function') {
        console.error('Utils not loaded. parseShorthand:', typeof parseShorthand, 'assemblePlan:', typeof assemblePlan);
        // Fall through to legacy mode
        return handleLegacy(input, mode, subjective, res);
      }
      
      const parsed = parseShorthand(input);

      // Check for parser errors
      if (parsed.errors && parsed.errors.length > 0) {
        return res.status(400).json({
          error: parsed.errors.map(e => e.message || e).join('; '),
          flow: 'shorthand',
          parsed
        });
      }

      // Check if we got a valid template match
      if (!parsed.isTemplate) {
        // Fall through to legacy if parser didn't find a template match
        return handleLegacy(input, mode, subjective, res);
      }

      // Assemble the plan from templates
      const assembled = assemblePlan(parsed);

      // Debug: log what assemblePlan returns
      console.log('assemblePlan returned:', JSON.stringify(assembled, null, 2).substring(0, 500));

      // Check for template engine errors
      if (assembled.errors && assembled.errors.length > 0) {
        return res.status(400).json({
          error: assembled.errors.map(e => e.message || e).join('; '),
          flow: 'shorthand',
          parsed
        });
      }

      // Serialize the plan content — handles string, array, or object formats
      function serializePlan(plan) {
        if (!plan) return '';
        if (typeof plan === 'string') return plan;
        if (Array.isArray(plan)) {
          return plan.map((item, i) => {
            if (typeof item === 'string') return `${i + 1}. ${item}`;
            if (item && typeof item === 'object') {
              // Handle { text: '...' }, { item: '...' }, { content: '...' }, { description: '...' } etc.
              const text = item.text || item.item || item.content || item.description || item.label || item.name || JSON.stringify(item);
              const rationale = item.rationale || item.reason || item.mdm || '';
              return rationale ? `${i + 1}. ${text} — ${rationale}` : `${i + 1}. ${text}`;
            }
            return `${i + 1}. ${String(item)}`;
          }).join('\n');
        }
        if (typeof plan === 'object') {
          // Maybe it has a planText, items, or content property
          return plan.planText || plan.text || plan.items || plan.content || JSON.stringify(plan, null, 2);
        }
        return String(plan);
      }

      const planText = serializePlan(assembled.plan || assembled.planText || assembled.items || assembled);

      // Build the user message with assembled plan + optional subjective
      let userMessage = `Here is the pre-assembled treatment plan to wrap with MDM documentation:\n\n`;
      userMessage += `CONDITION: ${parsed.condition || 'General'}\n`;
      userMessage += `VISIT TYPE: ${parsed.visitType || 'Follow-up'}\n\n`;

      if (subjective && subjective.trim()) {
        userMessage += `PATIENT CONTEXT (from S/O):\n${subjective.trim()}\n\n`;
      }

      userMessage += `ASSEMBLED PLAN:\n${planText}\n`;

      if (assembled.warnings && assembled.warnings.length > 0) {
        userMessage += `\nCLINICAL WARNINGS:\n${assembled.warnings.map(w => `- ${w.message || w}`).join('\n')}\n`;
      }

      // Send to Claude for MDM wrapping
      const wrapperPrompt = mode === 'detailed' ? MDM_WRAPPER_DETAILED : MDM_WRAPPER_LEAN;

      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: wrapperPrompt,
        messages: [{ role: 'user', content: userMessage }]
      });

      const output = message.content[0]?.text || '';

      return res.status(200).json({
        output,
        flow: 'shorthand',
        parsed: {
          visitType: parsed.visitType,
          condition: parsed.condition,
          addModifiers: parsed.addModifiers,
          removeModifiers: parsed.removeModifiers,
          warnings: parsed.warnings || [],
        }
      });

    } else {
      // ====================================
      // LEGACY FREE-TEXT FLOW (unchanged)
      // ====================================
      return handleLegacy(input, mode, subjective, res);
    }

  } catch (error) {
    console.error('Generate error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate MDM paragraph'
    });
  }
}

async function handleLegacy(input, mode, subjective, res) {
  const fullInput = subjective && subjective.trim()
    ? `${subjective.trim()}\n\n${input.trim()}`
    : input.trim();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: getLegacySystemPrompt(mode, fullInput),
    messages: [
      {
        role: 'user',
        content: `Generate MDM documentation for this clinical scenario:\n\n${fullInput}`
      }
    ]
  });

  const output = message.content[0]?.text || '';

  return res.status(200).json({
    output,
    flow: 'legacy'
  });
}
