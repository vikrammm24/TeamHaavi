import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Minimal SpeechRecognition typings to avoid 'any'
type SpeechRecognitionCtor = new () => SpeechRecognition;
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
  // custom hook-in property for keyword callback
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  onkeyword?: () => void;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: ArrayLike<{ 0: { transcript: string }; length: number }>;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionCtor;
    SpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function useVoiceSOS(keyword = 'help me') {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recogRef = useRef<SpeechRecognition | null>(null);
  const key = useMemo(() => keyword.toLowerCase(), [keyword]);

  useEffect(() => {
    const SR: SpeechRecognitionCtor | undefined =
      (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) || undefined;
    if (!SR) { setSupported(false); return; }
    setSupported(true);
    const rec: SpeechRecognition = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res: { [key: number]: { transcript?: string } } = event.results[i] as unknown as { [key: number]: { transcript?: string } };
        const transcript = String(res?.[0]?.transcript || '').toLowerCase();
        if (transcript.includes(key)) {
          const rk = (rec as unknown as { onkeyword?: () => void }).onkeyword;
          if (typeof rk === 'function') rk();
        }
      }
    };
    rec.onerror = () => { /* best-effort: ignore */ };
    rec.onend = () => {
      if (listening) {
        try { rec.start(); } catch { /* ignore */ }
      }
    };
    recogRef.current = rec;
    return () => { try { rec.abort(); } catch { /* ignore */ } recogRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const start = useCallback((onKeyword: () => void) => {
    const rec = recogRef.current;
    if (!rec) return false;
  (rec as unknown as { onkeyword?: () => void }).onkeyword = onKeyword;
    try {
      rec.start();
      setListening(true);
      return true;
    } catch { return false; }
  }, []);

  const stop = useCallback(() => {
    const rec = recogRef.current;
    if (!rec) return;
  try { rec.stop(); } catch { /* ignore */ }
    setListening(false);
  }, []);

  return { listening, supported, start, stop };
}

export default useVoiceSOS;
