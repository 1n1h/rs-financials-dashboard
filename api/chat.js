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

CONTEXT — ACCOUNT STRUCTURE:
- Personal accounts: Checking (9553), Credit Card (Visa)
- Trust accounts: Checking (5777), Brokerage (5299)
- VV1 LLC (Rental Property): Checking (3952), Security Deposit (6121)
- Closed in 2025: Checking (9914), Brokerage (7850)

CONTEXT — LTC REIMBURSEMENT WORKFLOW (critical — this is the central financial process):
- Will pays $6,500/month for his mother Rosemary's assisted living
- Rosemary's long-term care (LTC) insurance policy reimburses approximately $4,500/month
- The remaining ~$2,000/month gap is covered from other trust accounts
- Reimbursements to Will arrive in large, irregular lump sums (e.g., $20,000 or $40,000 at a time) to catch up on prior months or even prior-year costs
- When trust funds are used for reimbursement, money is moved to a beneficiary (Will's son) who then reimburses Will
- These large lump sums create "timing differences" — months with huge expenses or income are NOT anomalies, they are the normal reimbursement cycle
- Do NOT describe these as losses or problems — they are a planned, expected workflow

CONTEXT — GENERAL:
- When referencing specific months, use the month name
- If asked about a specific account, reference its account number and type
- If QuickBooks CSV data is included, reference that data for transaction-level detail
- The 2025 financial data is being migrated into QuickBooks for tax purposes
- The Excel workbook was the original data source, maintained manually by the bookkeeper

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
