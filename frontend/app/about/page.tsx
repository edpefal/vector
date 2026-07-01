'use client';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">About Image to SVG</h1>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">What is Image to SVG?</h2>
            <p className="text-slate-700 leading-relaxed">
              Image to SVG is a free online tool that converts PNG and JPEG images into scalable SVG (Scalable Vector Graphics) format. SVG files are resolution-independent, making them perfect for web design, logos, illustrations, and any graphics that need to scale without losing quality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">How It Works</h2>
            <p className="text-slate-700 leading-relaxed">
              Our service uses vtracer, a state-of-the-art vectorization engine powered by Rust, to trace the contours of your images and convert them into smooth, clean vector paths. The result is a professional-quality SVG that you can use in design software, web projects, or further modification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Features</h2>
            <ul className="text-slate-700 space-y-2 list-disc list-inside">
              <li>Fast processing (typically 2-5 seconds per image)</li>
              <li>High-quality vectorization with color preservation</li>
              <li>Support for PNG and JPEG formats</li>
              <li>Side-by-side comparison of original and vectorized images</li>
              <li>Instant download in SVG format</li>
              <li>Completely free to use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Technology</h2>
            <p className="text-slate-700 leading-relaxed">
              Image to SVG is built with modern web technologies including Next.js for the frontend, FastAPI for the backend, and vtracer for image vectorization. We prioritize speed, reliability, and user privacy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Support</h2>
            <p className="text-slate-700 leading-relaxed">
              Have questions or feedback? Visit our{' '}
              <a href="/contact" className="text-blue-600 hover:underline">
                contact page
              </a>{' '}
              to get in touch with us.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
