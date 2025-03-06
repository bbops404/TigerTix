import React, { useState } from "react";

import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { FaChevronDown, FaArrowLeft } from "react-icons/fa";

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleDropdown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [

    { question: "How do I claim my tickets?", answer: "You can claim your tickets by presenting your reservation confirmation at the event entrance." },
    { question: "How do I reserve as an alumni?", answer: "Alumni can reserve tickets by logging in with their alumni credentials and following the reservation process." },
    { question: "What to do when my account is restricted?", answer: "If your account is restricted, please contact support for assistance in resolving the issue." },
    { question: "How do I recover my banned account?", answer: "To recover a banned account, submit an appeal through the support page, stating your case for reactivation." }
  ];

  return (
    <div className="bg-[#202020] text-white min-h-screen font-Poppins">
      <Header />

      {/* Return Button (Icon Only) */}
      <div className="px-6 mt-6">
        <Link to="/" className="flex items-center text-white text-xl hover:opacity-80 transition-opacity">
          <FaArrowLeft className="text-2xl" />
        </Link>
      </div>

      <div className="text-center py-16">
        <h1 className="text-6xl font-bold">FAQs</h1>
        <h2 className="text-3xl mt-4">Got questions? We have answers!</h2>
      </div>

      <div className="w-full max-w-3xl mx-auto py-8 px-6">
        {faqs.map((item, index) => (
          <div key={index} className="mb-4">
            <button
              className="w-full text-left bg-[#D9D9D9] text-black p-4 rounded-lg flex justify-between items-center"
              onClick={() => toggleDropdown(index)}
            >
              <span className="text-lg font-medium">{item.question}</span>
              <FaChevronDown className={`transform transition-transform ${openIndex === index ? "rotate-180" : "rotate-0"}`} />
            </button>
            {openIndex === index && (
              <div className="bg-[#D9D9D9] text-black p-4 mt-2 rounded-lg">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center pb-16">
        <button className="mt-8 px-6 py-3 bg-[#FFAB40] text-black rounded-lg font-medium hover:bg-[#e69a36] transition">

          View More
        </button>
      </div>
    </div>
  );
};

export default FAQs;
