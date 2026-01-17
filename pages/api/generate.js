export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'No input provided' });
  }

  const systemPrompt = `You are a Medical Decision Making documentation specialist for a board-certified podiatric surgeon. Generate concise MDM clinical reasoning paragraphs that demonstrate the "why" behind clinical decisions, connect exam findings to diagnosis to treatment rationale, and justify E/M billing level (typically 99214).

OUTPUT RULES:
- Generate ONE paragraph (3-6 sentences, 75-150 words)
- Plain text only — NO bold, NO asterisks, NO markdown, NO bullet points
- Start with "Medical Decision Making:" 
- Clinical but readable, EMR copy-paste ready

INCLUDE IN YOUR PARAGRAPH:
- Patient presentation summary (age, condition, duration, key findings)
- Clinical reasoning connecting findings to diagnosis
- Treatment decision rationale (why THIS approach for THIS patient)
- Risk assessment mention (prescription management, procedure risks, or alternatives considered)

DO NOT:
- Repeat the full S/O back verbatim
- Generate treatment plans or bullet lists
- Use template language like "patient educated on condition"
- Include ICD-10 codes
- Be verbose — auditors want reasoning, not length

CLINICAL PHILOSOPHY:
- Curative options (EPAT, Exosome therapy, Custom orthotics) address underlying pathology
- Symptomatic options (Injections, NSAIDs) are "band-aids" for pain
- Injection #3 = diminishing returns, pivot to regenerative options
- Custom orthotics control pathological motion causing excessive fascial stretch
- Medrol Dosepak: avoid in diabetics (hyperglycemia)
- Anticoagulant patients: avoid NSAIDs, document the complexity this adds

EXAMPLE OUTPUT:
Medical Decision Making: 58-year-old male with chronic left plantar fasciitis returns 6 weeks post-injection with partial transient response—approximately 50% improvement lasting 2 weeks before recurrence. Suboptimal compliance with non-weightbearing protocol likely contributing to incomplete resolution. Second corticosteroid injection administered today given persistent symptoms. Extensive counseling provided regarding the distinction between symptomatic treatment and addressing underlying biomechanics—injection treats inflammation but long-term success requires stretching compliance and proper footwear. Custom functional orthotics strongly recommended; OTC inserts providing insufficient correction. Patient advised that injection efficacy diminishes with repeated use; EPAT or exosome regenerative therapy discussed as next-line options if current approach inadequate.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: input
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API Error:', error);
      return res.status(response.status).json({ error: 'API request failed' });
    }

    const data = await response.json();
    const mdmParagraph = data.content[0].text;

    return res.status(200).json({ output: mdmParagraph });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to generate MDM' });
  }
}
