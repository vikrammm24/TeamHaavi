import React from 'react';

const Contact: React.FC = () => (
  <main className="min-h-[60vh] container mx-auto px-4 py-12 space-y-10">
    <header>
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-slate-600 dark:text-slate-300 max-w-3xl">We’re here to help. Choose the best way to reach our team.</p>
    </header>

    <section className="grid md:grid-cols-3 gap-6">
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h3 className="font-semibold text-lg">Email</h3>
        <p className="text-slate-600 text-sm mt-1">haavi@cityconnect.com</p>
        <a href="mailto:haavi@cityconnect.com" className="inline-block mt-4 px-4 py-2 rounded bg-blue-600 text-white">Send Email</a>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h3 className="font-semibold text-lg">Phone</h3>
        <p className="text-slate-600 text-sm mt-1">+91 98765 43210</p>
        <a href="tel:+919876543210" className="inline-block mt-4 px-4 py-2 rounded border border-slate-300">Call Now</a>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h3 className="font-semibold text-lg">Hours</h3>
        <p className="text-slate-600 text-sm mt-1">Mon–Fri, 9:00–18:00 IST</p>
        <a
          href="https://maps.google.com/?q=CityConnect"
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-4 px-4 py-2 rounded border border-slate-300"
        >Find us on Maps</a>
      </div>
    </section>

    <section className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Quick Message</h2>
      <p className="text-slate-600 text-sm mb-4">This will open your email app with prefilled details.</p>
      <form
        action="mailto:haavi@cityconnect.com"
        method="GET"
        onSubmit={(e) => {
          // prevent default to construct mailto URL with subject/body
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const subject = (form.querySelector('[name=subject]') as HTMLInputElement)?.value || '';
          const body = (form.querySelector('[name=body]') as HTMLTextAreaElement)?.value || '';
          const mailto = `mailto:haavi@cityconnect.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.location.href = mailto;
        }}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <input name="name" placeholder="Your name" className="px-3 py-2 rounded border border-slate-200" />
          <input name="subject" placeholder="Subject" className="px-3 py-2 rounded border border-slate-200" />
        </div>
        <textarea name="body" placeholder="How can we help?" className="mt-4 w-full min-h-[120px] px-3 py-2 rounded border border-slate-200" />
        <button type="submit" className="mt-4 px-4 py-2 rounded bg-blue-600 text-white">Send</button>
      </form>
    </section>

    <section className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Social</h2>
      <div className="flex flex-wrap gap-4">
        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="underline">Twitter/X</a>
        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="underline">Facebook</a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="underline">Instagram</a>
        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="underline">LinkedIn</a>
      </div>
    </section>
  </main>
);

export default Contact;
