import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import Header from "../../components/Header";

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleDropdown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    "How do I claim my tickets?",
    "How do I reserve as an alumni?",
    "What to do when my account is restricted?",
    "How do I recover my banned account?",
  ];

  return (
    <div>
      <Header showSearch={false} showAuthButtons={false} />
      <div className="bg-[#202020] text-white min-h-screen font-Poppins flex flex-col items-center py-16 px-6">
        <h1 className="text-6xl font-bold mb-4">FAQs</h1>
        <h2 className="text-3xl mb-12">Got Questions?</h2>

        <div className="w-full max-w-3xl">
          {faqs.map((question, index) => (
            <div key={index} className="mb-4">
              <button
                className="w-full text-left bg-[#D9D9D9] text-black p-4 rounded-lg flex justify-between items-center"
                onClick={() => toggleDropdown(index)}
              >
                <span className="text-lg font-medium">{question}</span>
                <FaChevronDown
                  className={`transform transition-transform ${
                    openIndex === index ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="bg-[#D9D9D9] text-black p-4 mt-2 rounded-lg">
                  <p>Placeholder text for {question}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="mt-8 px-6 py-3 bg-[#D9D9D9] text-black rounded-lg font-medium hover:bg-gray-400 transition">
          View More
        </button>
      </div>
    </div>
  );
};

export default FAQs;
