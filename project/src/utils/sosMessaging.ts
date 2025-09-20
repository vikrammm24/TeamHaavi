export const openWhatsAppAndMaybeSms = (
  numbers: string[],
  message: string,
  smsFallback: boolean
) => {
  const cleaned = numbers.map(n => n.replace(/[^+\d]/g, '')).filter(Boolean);
  const text = encodeURIComponent(message);
  cleaned.forEach((num, idx) => {
    const url = `https://wa.me/${num}?text=${text}`;
    setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          window.open(url, '_blank');
        }
      } catch (e) {
        void e; // non-blocking
      }
    }, idx * 500);
  });
  // Optional SMS fallback (best-effort)
  if (smsFallback && cleaned.length) {
    setTimeout(() => {
      try {
        const smsUrl = `sms:${cleaned.join(',')}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
        if (typeof window !== 'undefined') {
          window.open(smsUrl, '_self');
        }
      } catch (e) {
        void e;
      }
    }, cleaned.length * 600 + 200);
  }
};

export const openWhatsAppNow = (number: string, message: string) => {
  const cleaned = number.replace(/[^+\d]/g, '');
  const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
  try {
    if (typeof window !== 'undefined') {
      // Use same-tab navigation for better success during user gesture
      window.location.href = url;
    }
  } catch {
    // Fallback attempt with window.open
    try { if (typeof window !== 'undefined') window.open(url, '_self'); } catch { void 0; }
  }
};
