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
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  const { messages, financialContext } = await req.json();
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4-6';

  const systemPrompt = `You are a financial assistant for Rosemary Schafer's personal and trust accounts.
You have access to her complete 2025 financial data provided below as JSON.
Answer questions clearly and concisely. Format all currency with $ and commas.
When referencing specific months, use the month name. Explain LTC reimbursements
as timing differences — money Will paid out of pocket being reimbursed from the
trust, not actual losses. If asked about a specific account, reference its
account number and type.

Data: ${JSON.stringify(financialContext)}`;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://rs-financials.vercel.app',
      'X-Title': 'RS Financials Dashboard',
    },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(JSON.stringify({ error: 'OpenRouter API error', details: err }), { status: 502 });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
