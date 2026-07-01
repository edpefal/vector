'use client';

import { useState } from 'react';

export default function Contact() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, you would send this to your backend
    console.log(&quot;Contact form submitted:&quot;, { email, message });
    setSubmitted(true);
    setTimeout(() => {
      setEmail(&quot;&quot;);
      setMessage(&quot;&quot;);
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-6 text-center">Contact Us</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-slate-700 text-center mb-8">
            Have questions, feedback, or need help? We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.
          </p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-800 font-semibold">Thank you for your message!</p>
              <p className="text-green-700 text-sm mt-2">We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Your message here..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Send Message
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Other Ways to Reach Us</h3>
            <p className="text-slate-700">
              Email:{&quot; &quot;}
              <a href="mailto:support@img2svg.com" className="text-blue-600 hover:underline">
                support@img2svg.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
