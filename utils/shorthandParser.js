// ============================================
// SHORTHAND PARSER v1.0
// MDM Generator v2 — utils/shorthandParser.js
//
// Parses natural language clinical shorthand
// (typed or voice-dictated) into structured objects
// for the template engine.
//
// Order-independent: "fv heel pain" = "heel pain fv"
// Voice-friendly: handles extra spaces, run-on words
// Safety-aware: blocks dangerous modifier combos
// ============================================

// ============================================
// KEYWORD DICTIONARIES
// ============================================

const VISIT_TYPE_KEYWORDS = {
  first_visit: [
    'fv', 'first visit', '1st visit', 'new patient', 'initial',
    'new pt', 'first time', 'new consult', 'initial visit'
  ],
  follow_up: [
    'fu', 'follow up', 'followup', 'f/u', 'return visit', 'recheck',
    'follow-up', 'ret visit', 'return', 'fup', 'established',
    'established patient', 'est pt'
  ]
};

const CONDITION_KEYWORDS = {
  heel_pain: [
    'heel pain', 'plantar fasciitis', 'fasciitis', 'pf',
    'plantar fasciopathy', 'heel spur', 'fascial', 'plantar',
    'heel'
  ],
  neuroma: [
    "morton's neuroma", 'mortons neuroma', "morton's", 'mortons',
    'morton', 'neuroma', 'intermetatarsal neuroma',
    'interdigital neuroma', 'nerve pain forefoot'
  ],
  achilles: [
    'achilles', 'achilles tendonitis', 'achilles tendinitis',
    'achilles tendinopathy', 'achilles tendon', 'at',
    'posterior heel pain', 'achilles pain'
  ],
  peroneal: [
    'peroneal', 'peroneal tendonitis', 'peroneal tendinitis',
    'peroneal tendinopathy', 'peroneal tendon', 'pt',
    'lateral ankle pain', 'peroneal pain'
  ],
  cdfe: [
    'cdfe', 'comprehensive diabetic foot exam', 'diabetic foot exam',
    'dm education', 'diabetic exam', 'diabetic foot',
    'annual diabetic', 'annual dm', 'dm foot exam',
    'diabetic foot evaluation', 'dfe'
  ],
  wound_care: [
    'wound', 'wound care', 'wound management', 'ulcer', 'dfu',
    'diabetic foot ulcer', 'diabetic ulcer', 'venous ulcer',
    'venous stasis ulcer', 'stasis ulcer', 'chronic wound',
    'wound debridement', 'debridement'
  ],
  abn_routine: [
    'abn', 'routine foot care', 'self pay', 'self-pay', 'selfpay',
    'nail care', 'callus care', 'routine care', 'not at risk',
    'no class findings', 'does not meet class', 'non-covered',
    'noncovered', 'class findings', 'abn needed'
  ]
};

const MODIFIER_KEYWORDS = {
  // Injection modifiers
  injection: [
    '+injection', 'inj', 'injection', 'with injection',
    'gave injection', 'injected', 'cortisone', 'steroid injection',
    'csi', 'gave shot', 'shot'
  ],
  injection_2: [
    '+injection #2', 'inj 2', 'second injection', '2nd injection',
    'injection 2', 'shot 2', 'second shot', '2nd shot', 'inj #2'
  ],
  injection_3: [
    '+injection #3', 'inj 3', 'third injection', '3rd injection',
    'injection 3', 'shot 3', 'third shot', '3rd shot', 'inj #3'
  ],
  injection_insertional: [
    '+injection insertional', 'insertional injection', 'insertional inj',
    'insertional shot', 'insertional cortisone', 'insertion site injection'
  ],

  // Medication modifiers
  nsaid: [
    '+nsaid', 'nsaid', 'nsaids', 'with nsaid', 'anti-inflammatory',
    'anti inflammatory', 'ibuprofen', 'advil', 'aleve', 'naproxen',
    'meloxicam'
  ],
  remove_nsaid: [
    '-nsaid', 'no nsaid', 'no nsaids', 'without nsaid',
    'skip nsaid', 'hold nsaid', 'no anti-inflammatory'
  ],

  // Regenerative modifiers
  epat: [
    '+epat', 'epat', 'shockwave', 'eswt', 'shock wave',
    'extracorporeal', 'shockwave therapy'
  ],
  exosomes: [
    '+exosomes', 'exosomes', 'exosome', 'exosome therapy',
    'regenerative injection'
  ],
  remove_regenerative: [
    '-regenerative', 'no regenerative', 'skip regenerative',
    'no regen', 'without regenerative'
  ],

  // Imaging modifiers
  mri: [
    '+mri', 'mri', 'ordered mri', 'get mri', 'needs mri',
    'magnetic resonance', 'mri ordered'
  ],
  ultrasound: [
    '+ultrasound', 'ultrasound', 'us', 'diagnostic ultrasound',
    'sono', 'sonogram'
  ],

  // Device/support modifiers
  cam_boot: [
    '+cam boot', 'cam boot', 'boot', 'walking boot',
    'cam walker', 'fracture boot', 'immobilization boot'
  ],
  night_splint: [
    '+night splint', 'night splint', 'splint', 'dorsal night splint',
    'posterior night splint'
  ],
  ankle_brace: [
    '+ankle brace', 'ankle brace', 'brace', 'aso brace',
    'lateral brace', 'ankle support'
  ],
  orthotics_ready: [
    '+orthotics ready', 'orthotics dispensed', 'dispensed orthotics',
    'orthotics fitted', 'custom orthotics dispensed', 'orthotics today',
    'picked up orthotics', 'dispensed devices'
  ],

  // Treatment modifiers
  alcohol_sclerosing: [
    '+alcohol sclerosing', 'alcohol injection', 'sclerosing',
    'alcohol sclerosing injection', 'sclerosing injection',
    'alcohol series', 'sclerosing series', '4% alcohol'
  ],
  eccentric_loading: [
    '+eccentric loading', 'eccentric', 'alfredson',
    'alfredson protocol', 'eccentric exercises', 'eccentric loading protocol',
    'heel drops'
  ],

  // Surgical modifier
  surgical_consult: [
    '+surgical consult', 'surgical', 'surgery discussed',
    'surgical options', 'surgical consultation', 'surgery consult',
    'operative discussion', 'discussed surgery'
  ],

  // Status modifiers
  improving: [
    '+improving', 'improving', 'better', 'improved',
    'getting better', 'improvement', 'progressing',
    'responding well', 'good progress'
  ],

  // CDFE-specific modifiers
  low_risk: [
    'low risk', 'low-risk', 'category 0', 'cat 0',
    'no neuropathy', 'intact sensation'
  ],
  high_risk: [
    'high risk', 'high-risk', 'category 1', 'category 2', 'category 3',
    'cat 1', 'cat 2', 'cat 3', 'neuropathy', 'pvd', 'pad',
    'loss of protective sensation', 'lops', 'at risk'
  ],
  separate_em: [
    'separate em', 'separate e/m', 'with em', 'plus em',
    '25 modifier', 'mod 25', 'modifier 25', 'separate problem',
    'additional diagnosis'
  ],
  diabetic_shoes: [
    'diabetic shoes', 'dm shoes', 'therapeutic shoes',
    'depth shoes', 'shoe evaluation', 'a5500'
  ],
  vascular_referral: [
    'vascular referral', 'vascular consult', 'refer vascular',
    'abi', 'ankle brachial', 'arterial consult'
  ],
  endo_referral: [
    'endo referral', 'endocrine referral', 'refer endo',
    'a1c elevated', 'uncontrolled dm', 'poor glucose control'
  ],

  // Wound care-specific modifiers
  debridement: [
    'debridement', 'debrided', 'debride', 'sharp debridement',
    'wound debridement', 'excisional debridement'
  ],
  wound_vac: [
    'wound vac', 'npwt', 'negative pressure', 'vac therapy',
    'wound vacuum'
  ],
  offloading: [
    'offloading', 'offload', 'total contact cast', 'tcc',
    'healing shoe', 'surgical shoe', 'darco'
  ],
  wound_culture: [
    'wound culture', 'culture', 'culture obtained', 'swab',
    'culture and sensitivity', 'c&s'
  ],
  antibiotics: [
    'antibiotics', 'abx', 'antibiotic', 'oral antibiotics',
    'iv antibiotics', 'infected', 'infection'
  ],
  wound_improving: [
    'wound improving', 'granulating', 'granulation',
    'contracting', 'decreasing size', 'healing well',
    'wound smaller', 'epithelializing'
  ],
  wound_worsening: [
    'wound worsening', 'deteriorating', 'enlarging',
    'not healing', 'stalled', 'expanding', 'wound larger'
  ],
  xray_wound: [
    'xray wound', 'xray foot', 'rule out osteo',
    'osteomyelitis', 'probe to bone', 'ptb', 'bone involvement'
  ],

  // ABN/Routine foot care modifiers
  abn_signed: [
    'abn signed', 'signed abn', 'abn obtained', 'abn on file',
    'patient signed abn'
  ],
  nail_care: [
    'nail care', 'nail trim', 'nail debridement', 'mycotic nails',
    'onychomycosis', 'thick nails', 'dystrophic nails',
    '11721', '11719'
  ],
  callus_care: [
    'callus care', 'callus debridement', 'lesion care',
    'hyperkeratosis', 'tyloma', 'heloma', 'corn',
    '11055', '11056', '11057'
  ],
  patient_education_abn: [
    'patient education abn', 'explained coverage', 'explained non-coverage',
    'coverage explained', 'medicare limitation', 'not medically necessary'
  ]
};

// ============================================
// FUZZY MATCHING — Common misspellings
// ============================================

const FUZZY_MAP = {
  // Plantar fasciitis misspellings
  'facsiitis': 'fasciitis',
  'fasciits': 'fasciitis',
  'fascitis': 'fasciitis',
  'faciitis': 'fasciitis',
  'fasciitus': 'fasciitis',
  'plantar fascitis': 'plantar fasciitis',
  'plantar facsiitis': 'plantar fasciitis',
  'planter fasciitis': 'plantar fasciitis',
  'planter fascitis': 'plantar fasciitis',

  // Neuroma misspellings
  'neurma': 'neuroma',
  'nuroma': 'neuroma',
  'nueroma': 'neuroma',
  'neurona': 'neuroma',
  'mortin': 'morton',
  'morten': 'morton',

  // Achilles misspellings
  'achiles': 'achilles',
  'achilies': 'achilles',
  'achillies': 'achilles',
  'acheilles': 'achilles',
  'acchilles': 'achilles',

  // Peroneal misspellings
  'peronial': 'peroneal',
  'pereoneal': 'peroneal',
  'pereneal': 'peroneal',
  'peroneel': 'peroneal',
  'peronal': 'peroneal',

  // Tendonitis misspellings
  'tendinitus': 'tendonitis',
  'tendonitus': 'tendonitis',
  'tendinits': 'tendonitis',
  'tendanitis': 'tendonitis',

  // Other common misspellings
  'cortezone': 'cortisone',
  'cortizone': 'cortisone',
  'injeciton': 'injection',
  'injecton': 'injection',
  'injction': 'injection',
  'shcokwave': 'shockwave',
  'shokwave': 'shockwave',
  'exosome therpy': 'exosome therapy',
  'orthoitcs': 'orthotics',
  'orthotics': 'orthotics',
  'othotics': 'orthotics',
  'alferdson': 'alfredson',
  'alfredsen': 'alfredson',

  // Diabetic misspellings
  'diabeic': 'diabetic',
  'diabtic': 'diabetic',
  'diabetc': 'diabetic',
  'diebetic': 'diabetic',
  'nueropathy': 'neuropathy',
  'nueropath': 'neuropathy',
  'nuropathy': 'neuropathy',

  // Wound misspellings
  'debridment': 'debridement',
  'debridment': 'debridement',
  'debredement': 'debridement',
  'debridemnt': 'debridement',
  'grandulation': 'granulation',
  'granualtion': 'granulation',
  'osteomelitis': 'osteomyelitis',
  'osteomylitis': 'osteomyelitis',

  // ABN misspellings
  'onychomicosis': 'onychomycosis',
  'onychomycois': 'onychomycosis',
  'hyperkeratsos': 'hyperkeratosis'
};

// ============================================
// SAFETY RULES
// ============================================

const SAFETY_RULES = {
  achilles: {
    blocked: ['injection', 'injection_2', 'injection_3', 'injection_insertional'],
    blockedKeywords: ['injection', 'cortisone', 'steroid', 'shot', 'inj', 'csi'],
    message: 'BLOCKED: Cortisone injection is NEVER appropriate for Achilles tendonitis — high risk of tendon rupture. Consider EPAT or exosome therapy instead.'
  },
  peroneal: {
    warned: ['injection', 'injection_2', 'injection_3'],
    warnedKeywords: ['injection', 'cortisone', 'steroid', 'shot', 'inj', 'csi'],
    // injection_insertional is ALLOWED for peroneal
    message: 'WARNING: Cortisone is ONLY safe for insertional peroneal tendonitis, NOT retromalleolar. Did you mean "insertional injection"? If retromalleolar, cortisone risks tendon rupture.'
  }
};

// ============================================
// CORE PARSER
// ============================================

/**
 * Normalize input text for parsing
 * - lowercase
 * - collapse whitespace
 * - apply fuzzy corrections
 * - strip unnecessary punctuation
 */
function normalizeInput(raw) {
  let text = raw.toLowerCase().trim();

  // Collapse multiple spaces (common from voice input)
  text = text.replace(/\s+/g, ' ');

  // Remove common voice artifacts
  text = text.replace(/^(um|uh|okay|so|and|please|claude)\s+/g, '');

  // Normalize common punctuation
  text = text.replace(/[,;:]+/g, ' ');
  text = text.replace(/\./g, ' ');

  // Apply fuzzy corrections
  for (const [misspelling, correction] of Object.entries(FUZZY_MAP)) {
    // Use word boundary-aware replacement
    const regex = new RegExp(escapeRegex(misspelling), 'gi');
    text = text.replace(regex, correction);
  }

  // Collapse spaces again after corrections
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find the best matching entry from a keyword dictionary.
 * Returns the key if found, null otherwise.
 * Prefers longer (more specific) matches.
 */
function findMatch(text, keywordDict) {
  let bestMatch = null;
  let bestLength = 0;

  for (const [key, keywords] of Object.entries(keywordDict)) {
    for (const keyword of keywords) {
      if (text.includes(keyword) && keyword.length > bestLength) {
        bestMatch = key;
        bestLength = keyword.length;
      }
    }
  }

  return bestMatch;
}

/**
 * Find ALL matching modifiers from the input text.
 * Returns { addModifiers: [], removeModifiers: [] }
 */
function findModifiers(text) {
  const addModifiers = [];
  const removeModifiers = [];
  const matched = new Set();

  // Sort modifier keywords by length (longest first) to prefer specific matches
  const sortedEntries = Object.entries(MODIFIER_KEYWORDS)
    .flatMap(([key, keywords]) =>
      keywords.map(kw => ({ key, keyword: kw }))
    )
    .sort((a, b) => b.keyword.length - a.keyword.length);

  for (const { key, keyword } of sortedEntries) {
    if (matched.has(key)) continue;
    if (text.includes(keyword)) {
      matched.add(key);

      // Determine if this is an add or remove modifier
      if (key.startsWith('remove_')) {
        removeModifiers.push(key.replace('remove_', ''));
      } else {
        addModifiers.push(key);
      }
    }
  }

  // Handle precedence: specific injection types override generic
  // If injection_2 or injection_3 matched, remove generic injection
  if (matched.has('injection_2') || matched.has('injection_3') || matched.has('injection_insertional')) {
    const idx = addModifiers.indexOf('injection');
    if (idx !== -1) addModifiers.splice(idx, 1);
    matched.delete('injection');
  }

  return { addModifiers, removeModifiers };
}

/**
 * Identify unrecognized words in the input after parsing.
 * These are words that didn't match any known keyword.
 */
function findUnrecognized(text, visitType, condition, addModifiers, removeModifiers) {
  let remaining = text;

  // Remove matched visit type keywords
  if (visitType) {
    for (const kw of VISIT_TYPE_KEYWORDS[visitType]) {
      remaining = remaining.replace(new RegExp(escapeRegex(kw), 'g'), ' ');
    }
  }

  // Remove matched condition keywords
  if (condition) {
    for (const kw of CONDITION_KEYWORDS[condition]) {
      remaining = remaining.replace(new RegExp(escapeRegex(kw), 'g'), ' ');
    }
  }

  // Remove matched modifier keywords
  const allModifierKeys = [...addModifiers, ...removeModifiers.map(m => 'remove_' + m)];
  for (const modKey of allModifierKeys) {
    const keywords = MODIFIER_KEYWORDS[modKey] || [];
    for (const kw of keywords) {
      remaining = remaining.replace(new RegExp(escapeRegex(kw), 'g'), ' ');
    }
  }

  // Remove common noise words
  const noise = new Set([
    'with', 'without', 'and', 'the', 'a', 'an', 'for', 'to',
    'no', 'yes', 'not', 'also', 'plus', 'gave', 'ordered',
    'recommend', 'discussed', 'continue', 'start', 'get', 'needs'
  ]);

  const leftover = remaining
    .split(/\s+/)
    .filter(w => w.length > 1 && !noise.has(w))
    .filter(w => w.trim().length > 0);

  return leftover;
}

/**
 * Apply safety rules based on condition + modifiers.
 * Returns { errors: [], warnings: [] }
 */
function applySafetyRules(condition, addModifiers, text) {
  const errors = [];
  const warnings = [];

  if (!condition || !SAFETY_RULES[condition]) {
    return { errors, warnings };
  }

  const rules = SAFETY_RULES[condition];

  // Check for blocked modifiers
  if (rules.blocked) {
    for (const blockedMod of rules.blocked) {
      if (addModifiers.includes(blockedMod)) {
        errors.push({
          type: 'blocked_modifier',
          modifier: blockedMod,
          condition,
          message: rules.message
        });
      }
    }

    // Also check if blocked keywords appear in raw text even if not parsed as modifier
    if (rules.blockedKeywords) {
      for (const kw of rules.blockedKeywords) {
        if (text.includes(kw) && !addModifiers.some(m => rules.blocked.includes(m))) {
          // Keyword present but not captured as modifier — still block
          const alreadyErrored = errors.some(e => e.condition === condition);
          if (!alreadyErrored) {
            errors.push({
              type: 'blocked_keyword',
              keyword: kw,
              condition,
              message: rules.message
            });
          }
          break;
        }
      }
    }
  }

  // Check for warned modifiers (peroneal injection without insertional)
  if (rules.warned) {
    const hasInsertional = addModifiers.includes('injection_insertional');
    if (!hasInsertional) {
      for (const warnedMod of rules.warned) {
        if (addModifiers.includes(warnedMod)) {
          warnings.push({
            type: 'warned_modifier',
            modifier: warnedMod,
            condition,
            message: rules.message
          });
        }
      }

      // Also check warned keywords in raw text
      if (rules.warnedKeywords && warnings.length === 0) {
        for (const kw of rules.warnedKeywords) {
          if (text.includes(kw)) {
            warnings.push({
              type: 'warned_keyword',
              keyword: kw,
              condition,
              message: rules.message
            });
            break;
          }
        }
      }
    }
  }

  return { errors, warnings };
}

// ============================================
// MAIN PARSE FUNCTION
// ============================================

/**
 * Parse clinical shorthand into a structured object.
 *
 * @param {string} rawInput - The raw shorthand text (typed or voice)
 * @returns {Object} Parsed result:
 *   {
 *     visitType: "first_visit" | "follow_up" | null,
 *     condition: "heel_pain" | "neuroma" | "achilles" | "peroneal" | null,
 *     addModifiers: string[],
 *     removeModifiers: string[],
 *     unrecognized: string[],
 *     errors: Object[],      // Blocked actions (e.g., Achilles + injection)
 *     warnings: Object[],    // Needs clarification (e.g., peroneal + injection)
 *     normalized: string,    // The cleaned input text
 *     isTemplate: boolean    // Whether a template match was found
 *   }
 */
export function parseShorthand(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      visitType: null,
      condition: null,
      addModifiers: [],
      removeModifiers: [],
      unrecognized: [],
      errors: [],
      warnings: [],
      normalized: '',
      isTemplate: false
    };
  }

  const normalized = normalizeInput(rawInput);

  // Parse components
  const visitType = findMatch(normalized, VISIT_TYPE_KEYWORDS);
  const condition = findMatch(normalized, CONDITION_KEYWORDS);
  const { addModifiers, removeModifiers } = findModifiers(normalized);

  // Apply safety rules
  const { errors, warnings } = applySafetyRules(condition, addModifiers, normalized);

  // Remove blocked modifiers from addModifiers
  const blockedMods = errors
    .filter(e => e.type === 'blocked_modifier')
    .map(e => e.modifier);
  const cleanedAddModifiers = addModifiers.filter(m => !blockedMods.includes(m));

  // Find unrecognized tokens
  const unrecognized = findUnrecognized(
    normalized, visitType, condition, addModifiers, removeModifiers
  );

  // CDFE, wound_care, and abn_routine are standalone — don't require visit type
  const standaloneConditions = ['cdfe', 'wound_care', 'abn_routine'];
  const isTemplate = standaloneConditions.includes(condition) ? !!condition : !!(visitType && condition);

  return {
    visitType,
    condition,
    addModifiers: cleanedAddModifiers,
    removeModifiers,
    unrecognized,
    errors,
    warnings,
    normalized,
    isTemplate
  };
}

/**
 * Generate a human-readable summary of the parsed result.
 * Used for the live preview in the UI.
 *
 * @param {Object} parsed - Output from parseShorthand()
 * @returns {string} Human-readable summary
 */
export function formatParsedSummary(parsed) {
  if (!parsed.isTemplate) {
    if (!parsed.condition && !parsed.visitType) {
      return '';
    }
    const parts = [];
    if (parsed.visitType) parts.push(formatVisitType(parsed.visitType));
    if (parsed.condition) parts.push(formatCondition(parsed.condition));
    // Standalone conditions (cdfe, wound_care, abn_routine) won't reach here since isTemplate=true
    return '⚠️ Partial match: ' + parts.join(' • ') + ' (missing ' +
      (!parsed.visitType ? 'visit type' : 'condition') + ')';
  }

  // Standalone conditions don't show visit type prefix
  const standaloneConditions = ['cdfe', 'wound_care', 'abn_routine'];
  let summary;
  if (standaloneConditions.includes(parsed.condition)) {
    summary = '✓ ' + formatCondition(parsed.condition);
  } else {
    summary = '✓ ' + formatVisitType(parsed.visitType) + ' ' + formatCondition(parsed.condition);
  }

  if (parsed.addModifiers.length > 0) {
    summary += ' + ' + parsed.addModifiers.map(formatModifier).join(' + ');
  }

  if (parsed.removeModifiers.length > 0) {
    summary += ' - ' + parsed.removeModifiers.map(m => formatModifier(m)).join(' - ');
  }

  if (parsed.errors.length > 0) {
    summary += ' 🚫 ' + parsed.errors.map(e => e.message.split(':')[0] + ':' + e.message.split(':')[1]).join('; ');
  }

  if (parsed.warnings.length > 0) {
    summary += ' ⚠️ ' + parsed.warnings.map(w => w.message.split('.')[0]).join('; ');
  }

  return summary;
}

// ============================================
// FORMATTING HELPERS
// ============================================

function formatVisitType(vt) {
  const map = {
    first_visit: 'First Visit',
    follow_up: 'Follow-Up'
  };
  return map[vt] || vt;
}

function formatCondition(c) {
  const map = {
    heel_pain: 'Heel Pain',
    neuroma: "Morton's Neuroma",
    achilles: 'Achilles Tendonitis',
    peroneal: 'Peroneal Tendonitis',
    cdfe: 'Comprehensive Diabetic Foot Exam',
    wound_care: 'Wound Management',
    abn_routine: 'ABN / Routine Foot Care'
  };
  return map[c] || c;
}

function formatModifier(m) {
  const map = {
    injection: 'Injection',
    injection_2: 'Injection #2',
    injection_3: 'Injection #3',
    injection_insertional: 'Insertional Injection',
    nsaid: 'NSAIDs',
    epat: 'EPAT',
    exosomes: 'Exosomes',
    mri: 'MRI',
    ultrasound: 'Ultrasound',
    cam_boot: 'CAM Boot',
    night_splint: 'Night Splint',
    ankle_brace: 'Ankle Brace',
    orthotics_ready: 'Orthotics Dispensed',
    alcohol_sclerosing: 'Alcohol Sclerosing',
    eccentric_loading: 'Eccentric Loading',
    surgical_consult: 'Surgical Consult',
    improving: 'Improving',
    regenerative: 'Regenerative',
    // CDFE modifiers
    low_risk: 'Low Risk',
    high_risk: 'High Risk',
    separate_em: 'Separate E/M (Mod 25)',
    diabetic_shoes: 'Diabetic Shoes',
    vascular_referral: 'Vascular Referral',
    endo_referral: 'Endo Referral',
    // Wound care modifiers
    debridement: 'Debridement',
    wound_vac: 'Wound VAC',
    offloading: 'Offloading',
    wound_culture: 'Wound Culture',
    antibiotics: 'Antibiotics',
    wound_improving: 'Wound Improving',
    wound_worsening: 'Wound Worsening',
    xray_wound: 'X-ray (R/O Osteo)',
    // ABN modifiers
    abn_signed: 'ABN Signed',
    nail_care: 'Nail Care',
    callus_care: 'Callus Care',
    patient_education_abn: 'Coverage Explained'
  };
  return map[m] || m;
}

// ============================================
// EXPORTS
// ============================================

export default parseShorthand;
