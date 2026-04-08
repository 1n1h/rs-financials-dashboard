/**
 * Reads an SSE stream from a fetch Response and calls onToken for each text delta.
 * Properly buffers partial lines so no data is lost across chunk boundaries.
 */
export async function readSSEStream(response, onToken) {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete lines only — keep incomplete trailing line in buffer
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') continue;

      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content || '';
        if (delta) onToken(delta);
      } catch {
        // skip malformed JSON
      }
    }
  }

  // Process any remaining buffer
  if (buffer.trim().startsWith('data:')) {
    const payload = buffer.trim().slice(5).trim();
    if (payload && payload !== '[DONE]') {
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content || '';
        if (delta) onToken(delta);
      } catch {
        // skip
      }
    }
  }
}
