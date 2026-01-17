import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setOutput('');
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setOutput('Error: ' + data.error);
      } else {
        setOutput(data.output);
      }
    } catch (err) {
      setOutput('Error: Failed to connect to API');
    }
    
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <>
      <Head>
        <title>MDM Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: '#f1f5f9',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        padding: 20
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>MDM Generator</h1>
            <p style={{ color: '#94a3b8', marginTop: 8 }}>Paste S/O + your note → Get MDM paragraph</p>
          </div>

          {/* Input */}
          <div style={{
            background: '#1e293b',
            borderRadius: 12,
            border: '1px solid #334155',
            marginBottom: 16
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#94a3b8', fontSize: 14 }}>Paste S/O from ModMed + your note</span>
              {input && (
                <button 
                  onClick={handleClear}
                  style={{
                    background: '#334155',
                    border: 'none',
                    color: '#94a3b8',
                    padding: '6px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Example:

S: 58 y/o male, left PF 4 months, had injection 6 wks ago — 50% better for 2 weeks then pain returned. Not consistent with stretching. Still walking barefoot at home.

O: TTP medial tubercle, less than prior visit. Windlass positive.

Note: Gave shot #2, stressed compliance, recommended custom orthotics`}
              style={{
                width: '100%',
                minHeight: 200,
                padding: 16,
                background: 'transparent',
                border: 'none',
                color: '#f1f5f9',
                fontSize: 15,
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            style={{
              width: '100%',
              padding: 16,
              background: loading ? '#334155' : '#3b82f6',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              marginBottom: 16,
              opacity: !input.trim() ? 0.5 : 1
            }}
          >
            {loading ? 'Generating...' : 'Generate MDM Paragraph'}
          </button>

          {/* Output */}
          {output && (
            <div style={{
              background: '#1e293b',
              borderRadius: 12,
              border: '1px solid #334155'
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#94a3b8', fontSize: 14 }}>MDM Paragraph — Copy to ModMed</span>
                <button 
                  onClick={handleCopy}
                  style={{
                    background: copied ? '#22c55e' : '#3b82f6',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <div style={{
                padding: 16,
                fontSize: 15,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap'
              }}>
                {output}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
