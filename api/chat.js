export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'TOGETHER_API_KEY not set' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { messages = [], financialContext = {} } = body;
    const model = process.env.TOGETHER_MODEL || 'moonshotai/Kimi-K2.5';

    const systemPrompt = `You are a financial assistant for Rosemary Schafer's personal and trust accounts.
You have access to her complete 2025 financial data provided below as JSON.

FORMATTING RULES (important):
- Format all currency as $X,XXX.XX with dollar signs and commas
- Use **bold** for category names and totals
- Use bullet lists (- item) for breakdowns, NOT tables or ASCII charts
- NEVER use ASCII art, box-drawing characters, or text-based charts/graphs
- For comparisons, use simple bullet lists with the values inline
- Keep responses concise — summarize, don't dump raw data
- When listing multiple items, use a clean bulleted list like:
  - **Category Name**: $X,XXX.XX
  - **Category Name**: $X,XXX.XX
- For month comparisons, list them as bullet points, not tables

CONTEXT:
- When referencing specific months, use the month name
- Explain LTC reimbursements as timing differences — money Will paid out of pocket being reimbursed from the trust, not actual losses
- If asked about a specific account, reference its account number and type
- If QuickBooks CSV data is included, reference that data for transaction-level detail

Data: ${JSON.stringify(financialContext)}`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await fetch('https://api.together.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: 'Together AI error', status: response.status, details: errText }),
        { status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal error', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
