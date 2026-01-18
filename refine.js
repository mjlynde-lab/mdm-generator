import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const REFINE_SYSTEM_PROMPT = `You are an expert medical documentation editor. Your task is to modify an MDM (Medical Decision Making) paragraph based on the user's instruction.

Rules:
- Maintain the clinical accuracy and professional tone
- Keep the output as a single paragraph unless instructed otherwise
- Preserve the "Medical Decision Making:" prefix
- Plain text ONLY — NO bold, NO asterisks, NO markdown
- EMR copy-paste ready
- Make ONLY the changes requested — don't rewrite everything unless asked
- If asked to add something, integrate it naturally into the existing text
- If asked to remove something, ensure the remaining text flows properly

Common requests you might receive:
- "add that patient failed conservative care"
- "remove the orthotics mention"
- "make it shorter"
- "add more detail about the injection"
- "mention the patient is diabetic"
- "emphasize the chronic nature"`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { originalOutput, instruction } = req.body;

  if (!originalOutput || typeof originalOutput !== 'string') {
    return res.status(400).json({ error: 'Original output is required' });
  }

  if (!instruction || typeof instruction !== 'string') {
    return res.status(400).json({ error: 'Instruction is required' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: REFINE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the current MDM paragraph:

${originalOutput.trim()}

---

Please modify it according to this instruction: "${instruction.trim()}"

Return ONLY the modified paragraph, nothing else.`
        }
      ]
    });

    const output = message.content[0]?.text || '';
    
    return res.status(200).json({ output });
  } catch (error) {
    console.error('Claude API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to refine MDM paragraph' 
    });
  }
}
