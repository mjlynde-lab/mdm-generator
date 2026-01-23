import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// ============================================
// MDM GENERATOR v3.0
// Lean + Protocol-Aware modes with Auto E/M & Modifier 25
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
Modifier 25: [YES/NO/NOT APPLICABLE] — [One-line rationale based on whether a procedure was performed and whether E/M is separately identifiable]`;

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
Modifier 25: [YES/NO/NOT APPLICABLE] — [One-line rationale based on whether a procedure was performed and whether E/M is separately identifiable]`;

// Condition-specific prompt additions
const CONDITION_MODIFIERS = {
  pf: `
CONDITION CONTEXT: Plantar fasciitis
Assume CHRONIC (3+ months) and RECALCITRANT unless stated otherwise.
Key decision points: Treatment phase, comorbidity impact (diabetes/steroid glucose, obesity/mechanical, CKD/NSAID limits), injection threshold, EPAT consideration, custom orthotics medical necessity.
Differential to rule out: Plantar fascia rupture, tarsal tunnel syndrome, calcaneal stress fracture, fat pad atrophy.`,

  neuroma: `
CONDITION CONTEXT: Morton's neuroma (interdigital neuroma)
Key decision points: Injection series tracking (which number), diminishing returns at #3, response quantification, anticoagulation impact, diagnostic uncertainty.
Differential to rule out: MTP synovitis/capsulitis, stress fracture, peripheral neuropathy, 2nd interspace involvement.`,

  achilles: `
CONDITION CONTEXT: Achilles tendinopathy
⚠️ CRITICAL: Corticosteroid injection is ABSOLUTELY CONTRAINDICATED for Achilles tendon. Document this explicitly.
Key decision points: Location (insertional vs midsubstance), rupture risk factors (age, fluoroquinolones, statins, diabetes), medication review for tendon-toxic drugs, eccentric loading protocol.
Differential to rule out: Partial tear, retrocalcaneal bursitis, Haglund's deformity.`,

  peroneal: `
CONDITION CONTEXT: Peroneal tendinopathy
Key decision points: Tear consideration (when MRI needed), subluxation assessment, instability relationship, biomechanical factors (hindfoot varus), injection caution.
Differential to rule out: Lateral ankle instability, subluxation, longitudinal split tear, os peroneum syndrome, stress fracture.`,

  df: `
CONDITION CONTEXT: Diabetic foot evaluation
Key decision points: Risk stratification (neuropathy, vascular, deformity, prior ulcer/amputation), protective sensation testing, vascular assessment, footwear evaluation, glycemic context.
Risk categories: Low (intact sensation, no deformity, no PAD), Moderate (any single factor), High (prior ulcer/amputation OR neuropathy + deformity OR neuropathy + PAD).`,

  wc: `
CONDITION CONTEXT: Wound care / chronic ulcer
Key decision points: Wound trajectory (improving/stable/deteriorating with quantification), debridement rationale, infection assessment, offloading adequacy, healing barriers.
⚠️ For serial debridements: Document why continued debridement is medically necessary, what changed, objective measurements, plan modification if not progressing.`
};

// Detect condition from input text
function detectCondition(input) {
  const text = input.toLowerCase();
  
  if (text.includes('plantar fasciitis') || text.includes(' pf ') || 
      (text.includes('heel pain') && text.includes('plantar'))) {
    return 'pf';
  }
  if (text.includes('neuroma') || text.includes("morton") || 
      text.includes('interspace') || text.includes("mulder")) {
    return 'neuroma';
  }
  if (text.includes('achilles') && (text.includes('tendin') || text.includes('tendon'))) {
    return 'achilles';
  }
  if (text.includes('peroneal') && text.includes('tendin')) {
    return 'peroneal';
  }
  if (text.includes('diabetic foot') || text.includes(' dfe') || 
      text.includes('neuropathy exam') || text.includes('diabetic eval')) {
    return 'df';
  }
  if (text.includes('wound') || text.includes('ulcer') || 
      text.includes(' dfu') || text.includes('debridement')) {
    return 'wc';
  }
  
  return null;
}

function getSystemPrompt(mode, input) {
  const basePrompt = mode === 'detailed' ? PROTOCOL_AWARE_PROMPT : LEAN_PROMPT;
  const condition = detectCondition(input);
  const conditionModifier = condition ? CONDITION_MODIFIERS[condition] : '';
  
  return basePrompt + conditionModifier;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, mode = 'quick' } = req.body;

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Input is required' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: getSystemPrompt(mode, input),
      messages: [
        {
          role: 'user',
          content: `Generate MDM documentation for this clinical scenario:\n\n${input.trim()}`
        }
      ]
    });

    const output = message.content[0]?.text || '';
    
    return res.status(200).json({ output });
  } catch (error) {
    console.error('Claude API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate MDM paragraph' 
    });
  }
}
