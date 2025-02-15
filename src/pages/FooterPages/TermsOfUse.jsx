import React from "react";
import Header from "../../components/Header";

const TermsOfUse = () => {
  return (
    <div className="bg-[#202020] text-white min-h-screen">
      <Header />
      <div className="p-16 max-w-5xl mx-auto text-gray-300 font-Poppins">
        <h1 className="text-4xl font-bold text-center">TigerTix</h1>
        <h2 className="text-2xl font-semibold text-center mt-2">Terms of Use</h2>

        <div className="mt-10 space-y-10">
          <section className="text-left">
            <h3 className="text-xl font-semibold">1. Use of TigerTix</h3>
            <p className="mt-2"><strong>1.1 Eligibility</strong></p>
            <p>You must be a currently enrolled student, staff member, or an authorized user to access and use TigerTix. By using the platform, you confirm that all information you provide is accurate and up-to-date.</p>

            <p className="mt-2"><strong>1.2 Account Responsibility</strong></p>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.</p>

            <p className="mt-2"><strong>1.3 Prohibited Activities</strong></p>
            <ul className="list-disc pl-8">
              <li>Use the platform for unlawful purposes.</li>
              <li>Tamper with or hack the system.</li>
              <li>Misrepresent your identity or provide false information.</li>
              <li>Resell tickets or exploit the platform for commercial purposes.</li>
            </ul>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-semibold">2. Reservations and Payments</h3>
            <p className="mt-2"><strong>2.1 Ticket Availability</strong></p>
            <p>Ticket reservations are subject to availability and are allocated on a first-come, first-served basis.</p>

            <p className="mt-2"><strong>2.2 Fees and Payments</strong></p>
            <p>Some events may require payment. All transactions are final unless otherwise stated. We are not responsible for errors in payment processing by third-party services.</p>

            <p className="mt-2"><strong>2.3 Cancellations and Refunds</strong></p>
            <p>Cancellation and refund policies vary by event. Refer to the event organizer’s terms for specifics.</p>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-semibold">3. Intellectual Property</h3>
            <p>All content on TigerTix, including logos, designs, text, and software, is our property or that of our licensors and is protected by copyright and intellectual property laws. You may not reproduce, distribute, or modify any content without prior written consent.</p>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-semibold">4. Liability Disclaimer</h3>
            <p>TigerTix is provided on an "as-is" and "as-available" basis. We make no warranties of any kind, express or implied, about:</p>
            <ul className="list-disc pl-8">
              <li>The accuracy or reliability of the platform.</li>
              <li>The uninterrupted or error-free operation of the system.</li>
            </ul>
            <p>To the extent permitted by law, we are not liable for damages arising from your use of TigerTix, including data loss, unauthorized access, or issues with third-party services.</p>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-semibold">5. Termination</h3>
            <p>We reserve the right to suspend or terminate your access to TigerTix at our discretion if you violate these Terms of Use or engage in activities that harm the platform or its users.</p>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-semibold">6. Changes to Terms</h3>
            <p>We may update these Terms of Use from time to time. Any changes will be posted here, with an updated effective date. Continued use of TigerTix signifies your acceptance of the revised terms.</p>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-semibold">7. Governing Law</h3>
            <p>These Terms of Use are governed by the laws of [Insert Jurisdiction], without regard to conflict of law principles.</p>
          </section>

          <section className="text-left">
            <h3 className="text-xl font-semibold">8. Contact Us</h3>
            <p>If you have any questions or concerns regarding these Terms of Use, contact us at:</p>
            <p className="mt-2 font-semibold">TigerTix Support Team</p>
            <p>Email: [Insert Email Address]</p>
            <p>Phone: [Insert Phone Number]</p>
          </section>

          <p className="mt-10 text-center">By using TigerTix, you agree to these Terms of Use. If you do not agree, please refrain from using our services.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
