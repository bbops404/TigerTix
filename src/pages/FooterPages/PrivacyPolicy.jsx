import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Header from "../../components/Header";

const PrivacyPolicy = () => {
  return (
    <div className="bg-[#202020] text-white min-h-screen">
      <Header />

      {/* Back Button */}
      <div className="px-6 mt-6">
        <Link to="/" className="flex items-center text-white text-xl hover:opacity-80 transition-opacity">
          <FaArrowLeft className="text-2xl" />
        </Link>
      </div>

      <div className="p-16 max-w-5xl mx-auto text-gray-300 font-Poppins relative">
        <h1 className="text-4xl font-bold text-center">Privacy Policy</h1>
        <div className="w-full h-0.5 bg-yellow-500 mx-auto mt-2 max-w-4xl"></div>

        <div className="mt-10 space-y-10">
          <section className="text-left">
            <h3 className="text-xl font-bold">1. Information We Collect</h3>
            <p className="mt-2 font-bold">1.1 Personal Information</p>
            <ul className="list-disc pl-8 font-normal">
              <li>Name</li>
              <li>Email Address</li>
              <li>Contact Number</li>
              <li>University/School ID Number</li>
              <li>Profile Photo (if applicable)</li>
            </ul>
            <p className="mt-2 font-bold">1.2 Non-Personal Information</p>
            <ul className="list-disc pl-8 font-normal">
              <li>Device Information (e.g., browser type, operating system)</li>
              <li>Usage Data (e.g., pages visited, features used)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
            <p className="mt-2 font-bold">1.3 Payment Information</p>
            <p className="font-normal">
              If applicable, we may collect payment details for ticket reservations. Payment processing is handled by third-party providers and is subject to their privacy policies.
            </p>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-bold">2. How We Use Your Information</h3>
            <ul className="list-disc pl-8 font-normal">
              <li>Facilitate ticket reservations and event registration.</li>
              <li>Communicate with you regarding your reservations.</li>
              <li>
                Send updates, notifications, or promotional content (with your
                consent).
              </li>
              <li>Improve our system’s features and user experience.</li>
              <li>Comply with legal and regulatory requirements.</li>
            </ul>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-bold">3. How We Share Your Information</h3>
            <p className="font-normal">
              We do not sell or rent your personal information. We may share your data with:
            </p>
            <ul className="list-disc pl-8 font-normal">
              <li><strong>Event Organizers:</strong> To confirm and manage your reservation.</li>
              <li><strong>Service Providers:</strong> For payment processing, data analytics, and other operational purposes.</li>
              <li><strong>Legal Authorities:</strong> If required by law or to protect our legal rights.</li>
            </ul>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-bold">4. Data Retention</h3>
            <p className="font-normal">
              We retain your information only as long as necessary for the purposes outlined in this Privacy Policy or as required by law. Upon request, we will delete your data unless it is required for legitimate business or legal purposes.
            </p>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-bold">5. Your Privacy Rights</h3>
            <p className="font-normal">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-8 font-normal">
              <li>Access, update, or delete your personal information.</li>
              <li>Opt-out of marketing communications.</li>
              <li>Restrict or object to certain data processing activities.</li>
              <li>Withdraw consent for data collection and use.</li>
            </ul>
            <p className="font-normal">
              To exercise these rights, contact us at [Insert Contact Email].
            </p>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-bold">6. Security Measures</h3>
            <p className="font-normal">
              We implement appropriate technical and organizational measures to protect your data from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission or storage is 100% secure.
            </p>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-bold">7. Third-Party Links</h3>
            <p className="font-normal">
              TigerTix may contain links to third-party websites or services. We are not responsible for their privacy practices or content. Please review their privacy policies before sharing your information.
            </p>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-bold">8. Updates to This Privacy Policy</h3>
            <p className="font-normal">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated effective date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-bold">9. Contact Us</h3>
            <p className="font-normal">
              If you have any questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <p className="font-bold">TigerTix Support Team</p>
            <p className="font-normal">Email: [Insert Email Address]</p>
            <p className="font-normal">Phone: [Insert Phone Number]</p>
          </section>

          <p className="mt-10 text-center font-normal">
            By using TigerTix, you agree to the terms of this Privacy Policy. If you do not agree, please refrain from using our services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
