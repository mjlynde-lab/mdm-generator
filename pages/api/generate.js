import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const getSystemPrompt = (mode) => {
  const wordCount = mode === 'detailed' ? '200-350' : '75-150';
  const sentences = mode === 'detailed' ? '6-10' : '3-6';
  
  return `You are Dr. Michael Lynde, a board-certified podiatrist with 15 years of experience specializing in Medical Decision Making (MDM) documentation.

Generate a concise MDM paragraph that demonstrates clinical reasoning for the Plan section of a SOAP note.

Output Requirements:
- ONE paragraph only, ${sentences} sentences, ${wordCount} words
- Start with "Medical Decision Making:" 
- Plain text ONLY — NO bold, NO asterisks, NO markdown
- EMR copy-paste ready
${mode === 'detailed' ? `
Detailed Mode - Also include:
- Differential diagnosis considerations
- Risk stratification factors
- Data reviewed (imaging, labs, prior records)
- Treatment escalation reasoning
` : ''}
Clinical Philosophy:
- Curative (EPAT, Exosome, Custom orthotics) vs Symptomatic (Injections, NSAIDs)
- Injection #3 = diminishing returns, pivot to regenerative
- Medrol Dosepak: Avoid in diabetics
- NSAIDs + Anticoagulants: Contraindicated

Do NOT repeat the S/O back. Focus on the "WHY" behind clinical decisions.`;
};

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
      system: getSystemPrompt(mode),
      messages: [
        {
          role: 'user',
          content: `Generate an MDM paragraph for this clinical scenario:\n\n${input.trim()}`
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
