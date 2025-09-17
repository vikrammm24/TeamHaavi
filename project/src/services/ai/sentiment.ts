// Lightweight sentiment heuristic (placeholder)

export interface SentimentResult {
  score: number; // -1 negative, 0 neutral, +1 positive
  label: 'negative' | 'neutral' | 'positive';
  keywords: string[];
}

const NEGATIVE = ['broken', 'danger', 'hazard', 'trash', 'pollution', 'accident', 'delay'];
const POSITIVE = ['improved', 'fixed', 'clean', 'safe', 'resolved'];

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  // Try backend aggregate sentiment first
  try {
    const resp = await fetch('/api/sentiment');
    if (resp.ok) {
      const data = await resp.json();
      // Map backend score (-1..1) to our structure
      const label = data.score > 0.05 ? 'positive' : data.score < -0.05 ? 'negative' : 'neutral';
      return { score: data.score, label, keywords: data.topTopics || [] };
    }
  } catch {
    // ignore and fallback
  }
  const lower = text.toLowerCase();
  let score = 0;
  const keywords: string[] = [];
  for (const w of NEGATIVE) {
    if (lower.includes(w)) {
      score -= 1;
      keywords.push(w);
    }
  }
  for (const w of POSITIVE) {
    if (lower.includes(w)) {
      score += 1;
      keywords.push(w);
    }
  }
  const norm = Math.max(-1, Math.min(1, score));
  const label = norm > 0 ? 'positive' : norm < 0 ? 'negative' : 'neutral';
  return { score: norm, label, keywords };
}

export default { analyzeSentiment };
