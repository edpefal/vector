'use client';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Privacy Policy</h1>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6 text-slate-700 leading-relaxed">
          <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString('en-US')}</p>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">1. Introduction</h2>
            <p>
              Image to SVG ("we", "us", "our", or "Company") operates the img2svg.com website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">2. Information Collection and Use</h2>
            <p>
              We collect certain information about your visit to our website. The information we collect includes:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>Image files you upload for vectorization (temporarily processed and deleted)</li>
              <li>Log data (IP address, browser type, pages visited, time and date stamps)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">3. How We Use Your Information</h2>
            <p>Image to SVG uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To process your image vectorization requests</li>
              <li>To track usage patterns and improve our service</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">4. Google AdSense and Advertising</h2>
            <p>
              We use Google AdSense to display advertisements on our website. Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising by visiting{' '}
              <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline">
                Google Ad Settings
              </a>
              .
            </p>
            <p className="mt-2">
              Google may collect and use information (including your IP address) about your visits to this and other websites in order to provide, measure and improve our ads and other Google services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">5. Data Security</h2>
            <p>
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">6. Image Files</h2>
            <p>
              Images uploaded to our service are processed on our servers and are not stored permanently. After vectorization is complete, your image file is deleted from our servers. We do not share your images with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">7. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please{' '}
              <a href="/contact" className="text-blue-600 hover:underline">
                contact us
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
