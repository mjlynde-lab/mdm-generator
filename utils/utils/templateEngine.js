// ============================================
// TEMPLATE ENGINE v1.0
// MDM Generator v2 — utils/templateEngine.js
//
// Accepts parsed shorthand objects from the parser,
// looks up the correct template, assembles the base
// plan, applies add/remove modifiers, checks for
// blocked combinations, and returns assembled plan
// content ready for the Claude API to wrap with MDM.
//
// 11 Templates:
//   1. Heel Pain — First Visit
//   2. Heel Pain — Follow-Up
//   3. Morton's Neuroma — First Visit
//   4. Morton's Neuroma — Follow-Up
//   5. Achilles Tendonitis — First Visit
//   6. Achilles Tendonitis — Follow-Up
//   7. Peroneal Tendonitis — First Visit
//   8. Peroneal Tendonitis — Follow-Up
//   9. Comprehensive Diabetic Foot Exam (CDFE)
//  10. Wound Management
//  11. ABN / Routine Foot Care
// ============================================

// ============================================
// TEMPLATE DEFINITIONS
// ============================================

const TEMPLATES = {

  // ==========================================
  // TEMPLATE 1 — HEEL PAIN: FIRST VISIT
  // ==========================================
  heel_pain_first_visit: {
    label: 'Heel Pain — First Visit',
    basePlan: [
      'Patient education provided — diagnosis of plantar fasciitis, etiology involving repetitive microtrauma to the plantar fascial origin, and expected clinical course discussed',
      'Home exercise program reviewed — plantar fascia-specific stretching, gastrocnemius and soleus stretching (hold 30 seconds, 3 repetitions, 3 times daily). Morning routine: dorsiflex great toe 30 seconds before first steps',
      'Footwear counseling — supportive shoes with slight heel elevation and stiff midsole recommended. Printed shoe recommendation list provided. No barefoot walking, including at home. OOFOs sandals recommended for indoor use',
      'NSAIDs prescribed — Diclofenac ER 100mg daily for 10 days, then PRN for pain and inflammation',
      'OTC arch supports recommended — Purestride or Superfeet inserts for immediate biomechanical support. Custom orthotics discussed as option if OTC inadequate to address underlying mechanical contribution',
      'Future treatment options discussed if conservative measures insufficient — EPAT shockwave therapy and exosome regenerative therapy target underlying pathology rather than symptoms alone',
      'Follow-up 4-6 weeks for reassessment. Sooner if worsening pain, new symptoms, or inability to bear weight'
    ],
    availableModifiers: {
      injection: 'Cortisone injection administered to the plantar fascial origin under sterile technique — patient presenting with chronic symptoms warranting intervention at initial visit. Risks, benefits, and alternatives discussed. Modifier 25 appended for significant, separately identifiable E/M service with new diagnosis workup',
      nsaid: null, // Already in base plan
      epat: 'EPAT shockwave therapy discussed in detail — mechanism of action, expected treatment course (3 sessions, 1 week apart), and evidence base reviewed. Patient considering as treatment option',
      exosomes: 'Exosome regenerative therapy discussed — biologic mechanism, expected course, and current evidence reviewed. Patient considering as alternative to traditional interventions',
      mri: 'MRI ordered — evaluate for plantar fascial tear, stress fracture, or other structural pathology given clinical presentation',
      ultrasound: 'Diagnostic ultrasound performed — evaluated plantar fascial thickness, integrity, and perifascial edema to confirm diagnosis and guide treatment',
      cam_boot: 'CAM walker boot prescribed — immobilization indicated given severity of symptoms and functional limitation',
      night_splint: 'Dorsal night splint prescribed — maintains passive dorsiflexion during sleep to reduce first-step morning pain by preventing overnight fascial contracture',
      orthotics_ready: 'Custom orthotics dispensed and fitted today — functional devices to address biomechanical contribution and reduce fascial strain',
      surgical_consult: 'Surgical options discussed — given chronicity of symptoms and failed conservative measures, plantar fasciotomy with or without calcaneal spur resection remains an option if all non-operative treatments exhausted',
      improving: 'Patient reports improvement in symptoms — current conservative regimen effective. Continue present course with plan to reassess'
    },
    removeDefaults: {
      nsaid: 3 // Index of NSAID base plan line
    }
  },

  // ==========================================
  // TEMPLATE 2 — HEEL PAIN: FOLLOW-UP
  // ==========================================
  heel_pain_follow_up: {
    label: 'Heel Pain — Follow-Up',
    basePlan: [
      'Reassessment of plantar fasciitis — symptom trajectory, treatment compliance, and functional status evaluated',
      'Reinforced home exercise program — stretching compliance critical to long-term resolution. Continue plantar fascia and gastrocnemius/soleus stretching protocol',
      'Footwear and activity modification reinforced — no barefoot walking, supportive shoes at all times',
      'Follow-up 4-6 weeks for continued reassessment. Sooner if worsening or new symptoms'
    ],
    availableModifiers: {
      injection: 'Cortisone injection administered to the plantar fascial origin under sterile technique — persistent symptoms despite conservative measures warrant therapeutic intervention. Risks, benefits, and alternatives discussed',
      injection_2: 'Second cortisone injection administered — partial but incomplete relief from initial injection. Patient counseled that injection addresses the symptom (pain) but long-term resolution requires compliance with stretching, proper footwear, and no barefoot walking. Custom orthotics strongly encouraged at this stage to address underlying biomechanical cause',
      injection_3: 'Third and final cortisone injection administered — diminishing returns with repeated injections discussed. Patient strongly encouraged to consider EPAT shockwave therapy or exosome regenerative therapy as next treatment step. These modalities target the underlying pathology rather than masking symptoms. No further injections recommended',
      nsaid: 'NSAIDs continued/renewed — Diclofenac ER 100mg daily for pain and inflammation management',
      epat: 'EPAT shockwave therapy initiated — 3 treatment sessions, 1 week apart. Reassess 3 weeks after completion of series. Literature supports significant improvement by this timepoint in the majority of patients',
      exosomes: 'Exosome regenerative therapy administered — biologic injection to promote tissue repair at the plantar fascial origin. Post-procedure activity modification instructions provided',
      mri: 'MRI ordered — persistent symptoms despite adequate conservative trial warrant advanced imaging to evaluate for fascial tear, stress fracture, or alternative pathology',
      ultrasound: 'Diagnostic ultrasound performed — reassessing fascial thickness and integrity to monitor treatment response',
      cam_boot: 'CAM walker boot prescribed — immobilization indicated given inadequate response to conservative measures',
      night_splint: 'Night splint prescribed — maintains passive dorsiflexion during sleep to address persistent first-step pain',
      orthotics_ready: 'Custom orthotics dispensed and fitted today — addresses biomechanical contribution to fascial overload. Essential for long-term symptom prevention',
      surgical_consult: 'Surgical consultation discussed — patient has exhausted conservative and regenerative treatment options. Plantar fasciotomy with or without calcaneal spur resection discussed as definitive surgical option. Risks, benefits, expected recovery, and alternatives reviewed',
      improving: 'Patient reports meaningful improvement — current treatment regimen effective. Continue present course with emphasis on long-term compliance with stretching and proper footwear',
      oral_steroids: 'Medrol Dosepak prescribed — oral corticosteroid taper to address persistent inflammatory component when injection alone insufficient'
    },
    removeDefaults: {}
  },

  // ==========================================
  // TEMPLATE 3 — MORTON'S NEUROMA: FIRST VISIT
  // ==========================================
  neuroma_first_visit: {
    label: "Morton's Neuroma — First Visit",
    basePlan: [
      "Patient education provided — diagnosis of Morton's neuroma (intermetatarsal neuroma), etiology involving chronic nerve compression and perineural fibrosis at the intermetatarsal space, and expected clinical course discussed",
      'Footwear counseling — wide toe box shoes recommended to reduce transverse compression across the metatarsal heads. Avoid narrow, pointed, or high-heeled shoes. Printed shoe list provided',
      'Metatarsal pad placement discussed — positioned proximal to the metatarsal heads to splay the interspace and reduce nerve compression',
      'NSAIDs prescribed — Diclofenac ER 100mg daily for 10 days, then PRN for pain and inflammation management',
      'OTC arch supports with metatarsal pad recommended. Custom orthotics discussed as option for persistent symptoms — accommodative devices with metatarsal accommodation to redistribute forefoot pressure',
      'Future treatment options discussed if conservative measures insufficient — alcohol sclerosing injection series, EPAT shockwave therapy, and surgical neurectomy for refractory cases',
      'Follow-up 4-6 weeks for reassessment. Sooner if worsening pain, numbness, or new symptoms'
    ],
    availableModifiers: {
      injection: 'Diagnostic/therapeutic cortisone injection administered to the affected intermetatarsal space under sterile technique — both confirms clinical diagnosis and provides therapeutic relief. Risks, benefits, and alternatives discussed',
      nsaid: null, // Already in base plan
      alcohol_sclerosing: 'Alcohol sclerosing injection series discussed — 4% alcohol injections (typically 3-7 treatments, 1-2 weeks apart) to chemically reduce neuroma volume. Discussed as alternative to surgical neurectomy for persistent symptoms',
      mri: 'MRI ordered — evaluate neuroma size, morphology, and rule out alternative forefoot pathology',
      ultrasound: 'Diagnostic ultrasound performed — evaluated intermetatarsal space for neuroma size, bursitis, and surrounding soft tissue pathology',
      orthotics_ready: 'Custom orthotics dispensed and fitted today — accommodative devices with metatarsal relief to redistribute forefoot pressure and reduce intermetatarsal nerve compression',
      surgical_consult: 'Surgical neurectomy discussed — reserved for refractory cases that have failed comprehensive conservative management including injections and orthotics. Risks, benefits, expected recovery, and alternatives reviewed',
      epat: 'EPAT shockwave therapy discussed as treatment option — evidence supports reduction of perineural inflammation and pain',
      improving: 'Patient reports improvement in symptoms — current conservative measures effective. Continue present course'
    },
    removeDefaults: {
      nsaid: 3 // Index of NSAID base plan line
    }
  },

  // ==========================================
  // TEMPLATE 4 — MORTON'S NEUROMA: FOLLOW-UP
  // ==========================================
  neuroma_follow_up: {
    label: "Morton's Neuroma — Follow-Up",
    basePlan: [
      "Reassessment of Morton's neuroma — symptom trajectory, treatment compliance, and functional status evaluated",
      'Reinforced footwear guidance — wide toe box shoes, metatarsal pad placement, avoidance of compressive footwear',
      'Follow-up 4-6 weeks for continued reassessment. Sooner if worsening or new symptoms'
    ],
    availableModifiers: {
      injection: 'Cortisone injection administered to the affected intermetatarsal space — persistent symptoms despite conservative measures. Risks, benefits, and alternatives discussed',
      injection_2: 'Second cortisone injection administered — partial relief from initial injection. Alcohol sclerosing series discussed as next escalation if cortisone provides diminishing returns',
      injection_3: 'Third cortisone injection administered — diminishing returns with repeated cortisone discussed. Strongly recommend transitioning to alcohol sclerosing injection series or considering advanced imaging and surgical consultation',
      alcohol_sclerosing: 'Alcohol sclerosing injection administered — 4% alcohol series to chemically reduce neuroma volume. Treatment [X] of anticipated series. Reassess after completion for surgical decision-making',
      nsaid: 'NSAIDs continued/renewed for pain and inflammation management',
      mri: 'MRI ordered — persistent symptoms warrant advanced imaging to evaluate neuroma size and rule out alternative pathology',
      ultrasound: 'Diagnostic ultrasound performed — reassessing neuroma size and morphology to monitor treatment response and guide management decisions',
      orthotics_ready: 'Custom orthotics dispensed and fitted today — forefoot accommodation to reduce intermetatarsal compression',
      surgical_consult: 'Surgical neurectomy discussed — patient has failed comprehensive conservative management. Discussed operative approach, risks, expected recovery including potential stump neuroma, and alternatives',
      epat: 'EPAT shockwave therapy initiated for neuroma — evidence supports reduction of perineural inflammation and symptomatic improvement',
      improving: 'Patient reports meaningful improvement — current treatment approach effective. Continue present course'
    },
    removeDefaults: {}
  },

  // ==========================================
  // TEMPLATE 5 — ACHILLES TENDONITIS: FIRST VISIT
  // ==========================================
  achilles_first_visit: {
    label: 'Achilles Tendonitis — First Visit',
    basePlan: [
      'Patient education provided — diagnosis of Achilles tendonitis/tendinopathy, etiology involving repetitive overload and tendon degeneration, and expected clinical course discussed. Emphasized that Achilles tendon pathology requires patience and treatment compliance for resolution',
      'Eccentric loading protocol initiated — Alfredson protocol for Achilles tendon rehabilitation. Progressive heel drop exercises (3 sets of 15, twice daily) on a step or ledge. This is the gold standard conservative treatment for Achilles tendinopathy',
      'Footwear counseling — temporary heel lift to reduce tendon strain during acute phase. Avoid flat shoes and going barefoot. Supportive shoes with slight heel recommended',
      'NSAIDs prescribed — Diclofenac ER 100mg daily for 10 days, then PRN. NOTE: Cortisone injection is CONTRAINDICATED for Achilles tendonitis due to significant risk of tendon rupture',
      'Activity modification discussed — relative rest, avoid aggravating activities, gradual return to activity as symptoms allow',
      'Future treatment options discussed if conservative measures insufficient — EPAT shockwave therapy has strong evidence for Achilles tendinopathy. Exosome regenerative therapy also discussed as treatment option',
      'Follow-up 4-6 weeks for reassessment. Sooner if acute worsening, sudden pop, or inability to plantarflex'
    ],
    availableModifiers: {
      // NOTE: injection, injection_2, injection_3, injection_insertional ALL BLOCKED by parser safety rules
      nsaid: null, // Already in base plan
      epat: 'EPAT shockwave therapy discussed in detail — strong evidence base for Achilles tendinopathy. 3 treatment sessions, 1 week apart, reassess 3 weeks after completion',
      exosomes: 'Exosome regenerative therapy discussed — biologic approach to promote tendon healing and remodeling. Discussed as option if conservative measures and EPAT insufficient',
      mri: 'MRI ordered — evaluate for partial tear, insertional calcification, retrocalcaneal bursitis, or other structural pathology requiring modification of treatment approach',
      ultrasound: 'Diagnostic ultrasound performed — evaluated tendon thickness, echogenicity, integrity, and surrounding structures to confirm diagnosis and assess severity',
      cam_boot: 'CAM walker boot prescribed — immobilization indicated given severity of symptoms to allow acute inflammation to resolve before initiating rehabilitation protocol',
      ankle_brace: 'Ankle brace prescribed — provides support and proprioceptive feedback during activity to reduce tendon strain',
      orthotics_ready: 'Custom orthotics dispensed and fitted today — includes heel lift and rearfoot control to reduce Achilles tendon strain during gait',
      eccentric_loading: null, // Already in base plan
      surgical_consult: 'Surgical options discussed — if all conservative and regenerative measures exhausted, Achilles tendon debridement with or without augmentation may be indicated. Advanced imaging needed for surgical planning',
      improving: 'Patient reports improvement with current regimen — continue eccentric loading protocol and activity modification'
    },
    removeDefaults: {
      nsaid: 3 // Index of NSAID base plan line
    }
  },

  // ==========================================
  // TEMPLATE 6 — ACHILLES TENDONITIS: FOLLOW-UP
  // ==========================================
  achilles_follow_up: {
    label: 'Achilles Tendonitis — Follow-Up',
    basePlan: [
      'Reassessment of Achilles tendonitis/tendinopathy — symptom trajectory, eccentric loading compliance, and functional status evaluated',
      'Reinforced eccentric loading protocol — Alfredson heel drops remain the cornerstone of treatment. Compliance is critical for tendon remodeling',
      'Activity modification reviewed — gradual progressive loading as tolerated, avoiding sudden increases in activity intensity',
      'Follow-up 4-6 weeks for continued reassessment. Sooner if acute worsening, sudden pop, or loss of plantarflexion strength'
    ],
    availableModifiers: {
      // NOTE: All injection types BLOCKED by parser safety rules
      nsaid: 'NSAIDs continued/renewed — Diclofenac ER 100mg daily for pain and inflammation. Reminder: cortisone injection contraindicated for Achilles tendon',
      epat: 'EPAT shockwave therapy initiated — 3 treatment sessions, 1 week apart. Strong evidence for Achilles tendinopathy. Reassess 3 weeks after series completion',
      exosomes: 'Exosome regenerative therapy administered — biologic injection to promote tendon healing. Post-procedure activity modification instructions provided',
      mri: 'MRI ordered — persistent symptoms despite adequate conservative trial warrant advanced imaging to evaluate tendon integrity and rule out partial tear',
      ultrasound: 'Diagnostic ultrasound performed — reassessing tendon thickness, echogenicity, and integrity to monitor treatment response',
      cam_boot: 'CAM walker boot prescribed — immobilization indicated given inadequate response to conservative measures',
      ankle_brace: 'Ankle brace continued for ongoing support during activity',
      orthotics_ready: 'Custom orthotics dispensed and fitted today — heel lift and rearfoot control to reduce Achilles tendon strain',
      eccentric_loading: 'Eccentric loading protocol reinforced and progressed — increasing load as tolerated. This remains the primary rehabilitation intervention',
      surgical_consult: 'Surgical consultation discussed — persistent symptoms despite comprehensive conservative and regenerative treatment. Achilles tendon debridement with or without FHL augmentation may be indicated. Advanced imaging reviewed for surgical planning',
      improving: 'Patient reports meaningful improvement with eccentric loading and current treatment — continue present course with progressive activity advancement'
    },
    removeDefaults: {}
  },

  // ==========================================
  // TEMPLATE 7 — PERONEAL TENDONITIS: FIRST VISIT
  // ==========================================
  peroneal_first_visit: {
    label: 'Peroneal Tendonitis — First Visit',
    basePlan: [
      'Patient education provided — diagnosis of peroneal tendonitis/tendinopathy, etiology involving repetitive lateral ankle stress and tendon overload, anatomic considerations at the retromalleolar groove discussed',
      'Activity modification discussed — relative rest, avoid aggravating activities (lateral cutting, uneven terrain), ice application 15-20 minutes after activity',
      'Footwear counseling — stable, supportive shoes with good heel counter. Avoid flexible or worn footwear that allows excessive pronation/supination',
      'NSAIDs prescribed — Diclofenac ER 100mg daily for 10 days, then PRN for pain and inflammation',
      'Ankle brace or lateral ankle support recommended — proprioceptive feedback and mechanical support to reduce peroneal strain',
      'Future treatment options discussed if conservative measures insufficient — EPAT shockwave therapy, regenerative options, and in refractory cases, surgical exploration',
      'Follow-up 4-6 weeks for reassessment. Sooner if worsening pain, instability, or new symptoms. NOTE: Cortisone injection is generally avoided for peroneal tendons due to rupture risk, except in specific insertional pathology'
    ],
    availableModifiers: {
      injection: 'Cortisone injection administered — WARNING: only appropriate for insertional peroneal tendonitis, NOT retromalleolar pathology where rupture risk is significant. Site-specific indication confirmed prior to injection',
      injection_insertional: 'Cortisone injection administered to the peroneal tendon insertion — insertional tendinopathy confirmed on examination. Injection at the insertion site carries lower rupture risk than retromalleolar injection. Risks, benefits, and alternatives discussed',
      nsaid: null, // Already in base plan
      epat: 'EPAT shockwave therapy discussed — evidence supports treatment of tendinopathy. 3 treatment sessions, 1 week apart',
      exosomes: 'Exosome regenerative therapy discussed — biologic approach for tendon healing and remodeling',
      mri: 'MRI ordered — evaluate for peroneal tendon tear, split tear, subluxation, or other structural pathology that would change management',
      ultrasound: 'Diagnostic ultrasound performed — dynamic evaluation of peroneal tendons at the retromalleolar groove to assess integrity, subluxation, and surrounding structures',
      cam_boot: 'CAM walker boot prescribed — immobilization indicated given symptom severity and need for tendon rest',
      ankle_brace: null, // Already in base plan
      orthotics_ready: 'Custom orthotics dispensed and fitted today — lateral column support and rearfoot control to reduce peroneal tendon strain during gait',
      surgical_consult: 'Surgical options discussed — peroneal tendon debridement, repair, or groove deepening procedure may be indicated for refractory cases with structural pathology confirmed on advanced imaging',
      improving: 'Patient reports improvement with current conservative measures — continue present course'
    },
    removeDefaults: {
      nsaid: 3,
      ankle_brace: 4
    }
  },

  // ==========================================
  // TEMPLATE 8 — PERONEAL TENDONITIS: FOLLOW-UP
  // ==========================================
  peroneal_follow_up: {
    label: 'Peroneal Tendonitis — Follow-Up',
    basePlan: [
      'Reassessment of peroneal tendonitis/tendinopathy — symptom trajectory, treatment compliance, and functional status evaluated',
      'Activity modification reinforced — progressive return to activity as tolerated, continue avoiding aggravating movements',
      'Lateral ankle support continued — bracing for activity to reduce peroneal strain',
      'Follow-up 4-6 weeks for continued reassessment. Sooner if worsening, instability, or new symptoms'
    ],
    availableModifiers: {
      injection: 'Cortisone injection administered — WARNING: only appropriate for insertional pathology. Site-specific indication confirmed',
      injection_insertional: 'Cortisone injection administered to the peroneal tendon insertion — insertional tendinopathy confirmed. Lower rupture risk at insertion versus retromalleolar. Risks, benefits discussed',
      injection_2: 'Second cortisone injection administered to peroneal tendon insertion — partial relief from initial injection. Continued insertional pathology confirmed on examination. If inadequate response, will transition to EPAT or advanced imaging',
      nsaid: 'NSAIDs continued/renewed for pain and inflammation management',
      epat: 'EPAT shockwave therapy initiated — 3 treatment sessions, 1 week apart. Evidence supports treatment of tendinopathy. Reassess 3 weeks after series completion',
      exosomes: 'Exosome regenerative therapy administered — biologic injection to promote tendon healing. Post-procedure instructions provided',
      mri: 'MRI ordered — persistent symptoms warrant evaluation for tendon tear, split tear, subluxation, or other structural pathology',
      ultrasound: 'Diagnostic ultrasound performed — reassessing peroneal tendon integrity and subluxation status',
      cam_boot: 'CAM walker boot prescribed — inadequate response to conservative measures warrants immobilization',
      ankle_brace: 'Ankle brace continued/upgraded for lateral support during activity',
      orthotics_ready: 'Custom orthotics dispensed and fitted today — lateral column support and rearfoot control to reduce peroneal strain',
      surgical_consult: 'Surgical consultation discussed — persistent symptoms despite comprehensive conservative treatment. Peroneal tendon debridement, repair, or groove deepening discussed. Advanced imaging reviewed',
      improving: 'Patient reports meaningful improvement — current treatment approach effective. Continue present course with progressive activity'
    },
    removeDefaults: {}
  },

  // ==========================================
  // TEMPLATE 9 — COMPREHENSIVE DIABETIC FOOT EXAM (CDFE)
  // Standalone — no visit type prefix required
  // ==========================================
  cdfe: {
    label: 'Comprehensive Diabetic Foot Exam',
    standalone: true,
    basePlan: [
      'Comprehensive diabetic foot examination performed including vascular, neurological, dermatological, and musculoskeletal assessment',
      'Diabetic foot care education provided — daily foot inspection, proper nail care, moisturizing, avoidance of walking barefoot, appropriate footwear selection',
      'Glucose control importance discussed — correlation between glycemic management and peripheral neuropathy progression, wound healing, and infection risk',
      'Proper footwear education — diabetic-appropriate shoes with adequate depth and width, avoidance of constrictive footwear, OOFOs for sandals',
      'Risk category assigned based on examination findings — determines follow-up interval and preventive care intensity',
      'Follow-up interval established per risk stratification — low risk annually, moderate risk every 6 months, high risk every 3 months or more frequently'
    ],
    availableModifiers: {
      low_risk: 'Risk Category: Low (Category 0) — protective sensation intact, no deformity, no history of ulceration. Annual follow-up recommended',
      high_risk: 'Risk Category: High — loss of protective sensation, peripheral vascular disease, structural deformity, and/or history of prior ulceration identified. Increased surveillance frequency indicated',
      separate_em: 'Separate E/M service performed today for [additional diagnosis] — distinct from the preventive CDFE. Modifier 25 appended to E/M to indicate significant, separately identifiable service',
      diabetic_shoes: 'Patient qualifies for diabetic therapeutic footwear program (A5500). Prescription and fitting initiated — medical necessity established by presence of diabetes with qualifying condition',
      vascular_referral: 'Vascular surgery referral initiated — diminished pedal pulses and/or abnormal findings on vascular assessment warrant further arterial evaluation',
      endo_referral: 'Endocrinology referral initiated — suboptimal glycemic control identified, A1c optimization would benefit peripheral neuropathy management and reduce complication risk',
      orthotics_ready: 'Custom orthotics dispensed and fitted today — accommodative devices to redistribute pressure and reduce ulceration risk',
      nsaid: 'NSAIDs as needed for musculoskeletal complaints'
    },
    removeDefaults: {}
  },

  // ==========================================
  // TEMPLATE 10 — WOUND MANAGEMENT
  // Standalone — no visit type prefix required
  // ==========================================
  wound_care: {
    label: 'Wound Management',
    standalone: true,
    basePlan: [
      'Wound assessment performed — location, dimensions (length x width x depth), wound bed characteristics, periwound tissue status, and drainage documented',
      'Wound care instructions reviewed with patient — proper dressing technique, signs of infection requiring immediate contact, importance of offloading, and keeping wound clean and protected',
      'Follow-up scheduled for wound reassessment and continued management'
    ],
    availableModifiers: {
      debridement: 'Sharp debridement performed to viable tissue — removal of devitalized, necrotic, and/or fibrotic tissue to promote granulation and reduce bioburden. Wound bed prepared for healing',
      wound_vac: 'Negative pressure wound therapy (NPWT/wound VAC) applied — promotes granulation tissue formation, reduces edema, and manages exudate in wound with delayed healing trajectory',
      offloading: 'Offloading device prescribed — pressure redistribution is essential to wound healing. Non-compliance with offloading is the primary cause of diabetic foot ulcer treatment failure',
      wound_culture: 'Wound culture obtained — clinical signs of infection present. Culture and sensitivity results will guide targeted antibiotic therapy',
      antibiotics: 'Antibiotic therapy initiated — clinical signs of wound infection identified. Empiric coverage started pending culture results, will narrow based on sensitivity data',
      wound_improving: 'Wound demonstrates positive healing trajectory — granulation tissue present, wound contracting, no signs of infection. Continue current wound care protocol',
      wound_worsening: 'Wound not progressing as expected — stalled healing, increasing size, or clinical deterioration noted. Treatment plan escalation indicated, reassess contributing factors including vascular status, glucose control, offloading compliance, and nutritional status',
      xray_wound: 'Radiographs ordered / probe-to-bone testing performed — evaluating for osteomyelitis given wound depth and/or clinical suspicion of osseous involvement. MRI may be indicated if radiographs inconclusive',
      mri: 'MRI ordered — evaluate for osteomyelitis, abscess, or deep tissue involvement not apparent on clinical exam',
      cam_boot: 'CAM boot prescribed for offloading and wound protection',
      nsaid: 'NSAIDs as needed — addresses inflammatory component',
      surgical_consult: 'Surgical intervention discussed — wound chronicity, depth, or complications warrant consideration of operative debridement, closure, or amputation',
      improving: 'Current wound care protocol effective, continue present course'
    },
    removeDefaults: {}
  },

  // ==========================================
  // TEMPLATE 11 — ABN / ROUTINE FOOT CARE
  // Standalone — no visit type prefix required
  //
  // BILLING CONTEXT: Documentation must establish
  // WHY patient does not meet coverage criteria.
  // ==========================================
  abn_routine: {
    label: 'ABN / Routine Foot Care (Non-Covered)',
    standalone: true,
    billingContext: 'When generating MDM, documentation must clearly establish WHY the patient does not meet Medicare coverage criteria. The note must demonstrate that the provider assessed for class findings and determined they were absent, not simply that the provider chose not to bill Medicare.',
    basePlan: [
      'Patient does not meet Medicare class findings (A-C) for at-risk foot care — no systemic condition documented that qualifies routine foot care as medically necessary per CMS guidelines',
      'Advance Beneficiary Notice (ABN) reviewed and discussed with patient — patient informed that Medicare will not cover today\'s routine foot care services and that they are financially responsible',
      'Services rendered as self-pay per patient\'s request after ABN acknowledgment'
    ],
    availableModifiers: {
      abn_signed: 'ABN (Form CMS-R-131) signed by patient prior to services rendered. Patient selected Option 1 — requests services be submitted to Medicare with understanding that denial is expected and patient accepts financial responsibility',
      nail_care: 'Routine nail care performed — trimming and debridement of mycotic/dystrophic toenails. Non-covered service in absence of qualifying class findings',
      callus_care: 'Routine callus/corn debridement performed — removal of hyperkeratotic lesions. Non-covered service in absence of qualifying class findings',
      patient_education_abn: 'Patient education provided regarding Medicare coverage criteria for routine foot care — explained that class findings (peripheral neuropathy with loss of protective sensation, peripheral vascular disease, or systemic condition causing peripheral circulatory compromise) must be documented to qualify for covered services. Encouraged patient to discuss with PCP if they believe qualifying conditions may be present',
      diabetic_shoes: 'Discussed diabetic therapeutic footwear — if patient obtains qualifying diagnosis documentation, may be eligible for covered diabetic shoe program'
    },
    removeDefaults: {}
  }
};


// ============================================
// TEMPLATE KEY RESOLVER
// ============================================

/**
 * Resolve a template key from condition + visitType.
 * Standalone conditions (cdfe, wound_care, abn_routine) ignore visitType.
 *
 * @param {string|null} condition - Parsed condition
 * @param {string|null} visitType - Parsed visit type
 * @returns {string|null} Template key or null if not found
 */
function resolveTemplateKey(condition, visitType) {
  if (!condition) return null;

  const standaloneConditions = ['cdfe', 'wound_care', 'abn_routine'];

  if (standaloneConditions.includes(condition)) {
    return condition;
  }

  if (!visitType) return null;

  const keyMap = {
    heel_pain: { first_visit: 'heel_pain_first_visit', follow_up: 'heel_pain_follow_up' },
    neuroma: { first_visit: 'neuroma_first_visit', follow_up: 'neuroma_follow_up' },
    achilles: { first_visit: 'achilles_first_visit', follow_up: 'achilles_follow_up' },
    peroneal: { first_visit: 'peroneal_first_visit', follow_up: 'peroneal_follow_up' }
  };

  return keyMap[condition]?.[visitType] || null;
}


// ============================================
// PLAN ASSEMBLER
// ============================================

/**
 * Assemble a plan from a template by applying modifiers.
 *
 * @param {Object} template - The template object
 * @param {string[]} addModifiers - Modifiers to add
 * @param {string[]} removeModifiers - Modifiers to remove
 * @returns {Object} { planItems: string[], warnings: string[] }
 */
function assemblePlan(template, addModifiers, removeModifiers) {
  const warnings = [];

  // Start with base plan (copy)
  let planItems = [...template.basePlan];

  // Apply removeModifiers — remove default base plan items
  for (const removeMod of removeModifiers) {
    const removeIndex = template.removeDefaults[removeMod];
    if (removeIndex !== undefined && removeIndex !== null) {
      planItems[removeIndex] = null; // Mark for removal
    }
  }

  // Filter out nulled items
  planItems = planItems.filter(item => item !== null);

  // Apply addModifiers — append modifier text to plan
  for (const addMod of addModifiers) {
    const modText = template.availableModifiers[addMod];

    if (modText === undefined) {
      // Modifier not available for this template
      warnings.push(`Modifier "${addMod}" is not available for ${template.label}. Ignored.`);
      continue;
    }

    if (modText === null) {
      // Already covered in base plan — silent skip
      continue;
    }

    planItems.push(modText);
  }

  return { planItems, warnings };
}


// ============================================
// MAIN ENGINE FUNCTION
// ============================================

/**
 * Process a parsed shorthand object and return assembled plan content.
 *
 * @param {Object} parsed - Output from parseShorthand()
 * @returns {Object} Result with planText ready for Claude API
 */
export function processTemplate(parsed) {
  const errors = [...(parsed.errors || [])];
  const warnings = [...(parsed.warnings || []).map(w => w.message || w)];

  if (!parsed.isTemplate) {
    return {
      success: false,
      templateKey: null,
      templateLabel: null,
      planItems: [],
      planText: '',
      billingContext: null,
      errors: errors.length > 0 ? errors : [{
        type: 'no_template',
        message: 'Could not match a template. Need both a condition and visit type (e.g., "fv heel pain"), or use a standalone condition (cdfe, wound care, abn).'
      }],
      warnings,
      metadata: {
        condition: parsed.condition,
        visitType: parsed.visitType,
        modifiersApplied: [],
        modifiersRemoved: [],
        isStandalone: false
      }
    };
  }

  const templateKey = resolveTemplateKey(parsed.condition, parsed.visitType);

  if (!templateKey || !TEMPLATES[templateKey]) {
    return {
      success: false,
      templateKey,
      templateLabel: null,
      planItems: [],
      planText: '',
      billingContext: null,
      errors: [{
        type: 'template_not_found',
        message: `Template not found for condition "${parsed.condition}" with visit type "${parsed.visitType}".`
      }],
      warnings,
      metadata: {
        condition: parsed.condition,
        visitType: parsed.visitType,
        modifiersApplied: [],
        modifiersRemoved: [],
        isStandalone: false
      }
    };
  }

  const template = TEMPLATES[templateKey];

  const { planItems, warnings: assemblyWarnings } = assemblePlan(
    template,
    parsed.addModifiers || [],
    parsed.removeModifiers || []
  );

  const allWarnings = [...warnings, ...assemblyWarnings];

  // Numbered list format for Claude API
  const planText = planItems
    .map((item, i) => `${i + 1}. ${item}`)
    .join('\n');

  const standaloneConditions = ['cdfe', 'wound_care', 'abn_routine'];

  return {
    success: true,
    templateKey,
    templateLabel: template.label,
    planItems,
    planText,
    billingContext: template.billingContext || null,
    errors,
    warnings: allWarnings,
    metadata: {
      condition: parsed.condition,
      visitType: parsed.visitType,
      modifiersApplied: parsed.addModifiers || [],
      modifiersRemoved: parsed.removeModifiers || [],
      isStandalone: standaloneConditions.includes(parsed.condition)
    }
  };
}


/**
 * Get a template definition by key.
 * @param {string} key - Template key
 * @returns {Object|null}
 */
export function getTemplate(key) {
  return TEMPLATES[key] || null;
}


/**
 * List all available templates.
 * @returns {Object[]} Array of { key, label, standalone }
 */
export function listTemplates() {
  return Object.entries(TEMPLATES).map(([key, tmpl]) => ({
    key,
    label: tmpl.label,
    standalone: !!tmpl.standalone
  }));
}


/**
 * Get available modifiers for a template.
 * @param {string} key - Template key
 * @returns {string[]|null}
 */
export function getAvailableModifiers(key) {
  const template = TEMPLATES[key];
  if (!template) return null;
  return Object.keys(template.availableModifiers).filter(
    mod => template.availableModifiers[mod] !== null
  );
}


// ============================================
// EXPORTS
// ============================================

export default processTemplate;
