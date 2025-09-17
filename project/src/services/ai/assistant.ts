// Simple AI assistant service stub.
// In production, replace with calls to a backend LLM proxy or OpenAI/Azure endpoint.

export interface AssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AskOptions {
  stream?: boolean;
  // language code for localization context
  locale?: string;
}

export type AssistantCallback = (partial: string) => void;

const HINTS: Record<string, string[]> = {
  en: [
    'Remember to attach clear photos for faster resolution.',
    'Multiple similar reports can boost priority for authorities.',
    'You earn points for consistent, high-quality reporting!',
  ],
  es: [
    'Recuerda adjuntar fotos claras para una resolución más rápida.',
    'Múltiples informes similares pueden aumentar la prioridad.',
    '¡Ganas puntos por reportes constantes y de alta calidad!',
  ],
};

function pickRandom<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function askAssistant(
  prompt: string,
  _history: AssistantMessage[],
  options: AskOptions = {},
  onToken?: AssistantCallback
): Promise<string> {
  const locale = options.locale && HINTS[options.locale] ? options.locale : 'en';
  try {
    const resp = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt, language: locale })
    });
    if (!resp.ok) throw new Error('assistant backend failed');
    const data = await resp.json();
    const reply = data.reply || '';
    if (options.stream && onToken) {
      for (const token of reply.split(/\s+/)) {
        onToken(token + ' ');
        await new Promise(r => setTimeout(r, 15));
      }
    }
    return reply;
  } catch {
    // fallback to local stub
    const base = `You asked: "${prompt}".`;
    const advice = pickRandom(HINTS[locale]) || '';
    const answer = `${base}\n${advice}`.trim();
    if (options.stream && onToken) {
      for (const token of answer.split(/\s+/)) {
        await new Promise(res => setTimeout(res, 15));
        onToken(token + ' ');
      }
    }
    return answer;
  }
}

export default { askAssistant };
