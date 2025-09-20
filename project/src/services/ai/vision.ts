// Mock vision classification for uploaded issue images.

export interface VisionLabel {
  label: string;
  confidence: number; // 0-1
}

const MOCK_LABELS = [
  'pothole',
  'road-crack',
  'overflow-bin',
  'illegal-dumping',
  'water-logging',
  'street-light-out',
  'construction-debris',
];

export async function classifyImage(url: string): Promise<VisionLabel[]> {
  try {
    const resp = await fetch('/api/vision/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: [url] }),
    });
    if (resp.ok) {
      const data = await resp.json();
      return data.classifications?.[url] || [];
    }
  } catch {
    // ignore fallback
  }
  const shuffled = [...MOCK_LABELS].sort(() => Math.random() - 0.5);
  const take = Math.random() > 0.6 ? 2 : 1;
  return shuffled.slice(0, take).map((label, i) => ({
    label,
    confidence: 0.55 + Math.random() * 0.4 - i * 0.1,
  }));
}
export async function classifyBatch(urls: string[]): Promise<Record<string, VisionLabel[]>> {
  try {
    const resp = await fetch('/api/vision/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: urls }),
    });
    if (resp.ok) {
      const data = await resp.json();
      return data.classifications || {};
    }
  } catch {
    // fallback
  }
  const out: Record<string, VisionLabel[]> = {};
  for (const u of urls) out[u] = await classifyImage(u);
  return out;
}
export default { classifyImage, classifyBatch };
