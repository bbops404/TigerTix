import React, { useEffect, useState } from "react";
import LoginPopup from "../Landing/LoginPopup";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Header_User from "../../components/Header_User";
import { FaChevronDown, FaArrowLeft } from "react-icons/fa";

const FAQs = () => {
  // 🔹 State for login popup
  const [loginPopup, setLoginPopup] = useState(false);

  const toggleLoginPopup = () => {
    setLoginPopup((prev) => !prev);
  };

  // 🔹 Check if login popup should be shown on load
  useEffect(() => {
    const shouldShowLogin = sessionStorage.getItem("showLoginPopup");
    if (shouldShowLogin === "true") {
      setLoginPopup(true);
      sessionStorage.removeItem("showLoginPopup");
    }
  }, []); // Dependency array ensures this runs only once on mount

  const isLoggedIn = !!sessionStorage.getItem("authToken"); // Replace with your token logic

  const [openIndex, setOpenIndex] = useState(null);

  const toggleDropdown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I claim my tickets?",
      answer: "Tickets can be claimed at the IPEA Office located at the Quadricentennial Pavilion (QPAV).",
    },
    {
      question: "How do I reserve as an alumni?",
      answer: (
        <>
          Alumni may reserve tickets by filling out the designated{" "}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSemF-A6DSbVljP1H9orzG484Ip9ZlBYEIf1mPibLBpt6XhRUA/viewform?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Google Form
          </a>{" "}
          and presenting a valid alumni card.
        </>
      ),
    },
    {
      question: "What to do when my account is restricted?",
      answer: "If your account has been restricted, please reach out to us through the Contact Us section for further assistance.",
    },
    {
      question: "How do I recover my banned account?",
      answer: "To recover a banned account, kindly contact us via the Contact Us section to initiate the recovery process.",
    },
  ];

  return (
    <div className="bg-[#202020] text-white min-h-screen font-Poppins">
      {/* Conditionally render the header */}
      {isLoggedIn ? <Header_User /> : <Header toggleLoginPopup={toggleLoginPopup} />}

      {/* Render LoginPopup if needed */}
      {loginPopup && (
        <LoginPopup
          loginPopup={loginPopup}
          toggleLoginPopup={toggleLoginPopup}
        />
      )}

      {/* Top Yellow Section */}
      <div className="bg-[#F09C32] w-full text-white">
        {/* Return Button */}
        <div className="px-6">
          <Link
            to="/"
            className="flex items-center text-white text-xl hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft className="text-2xl" />
          </Link>
        </div>

        <div className="text-center py-16">
          <h1 className="text-6xl font-bold">FAQs</h1>
          <h2 className="text-3xl mt-4">Got questions? We have answers!</h2>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full max-w-3xl mx-auto py-8 px-6">
        {faqs.map((item, index) => (
          <div key={index} className="mb-4">
            <button
              className="w-full text-left bg-[#FFAB40] text-black p-4 rounded-lg flex justify-between items-center"
              onClick={() => toggleDropdown(index)}
            >
              <span className="text-lg font-medium">{item.question}</span>
              <FaChevronDown
                className={`transform transition-transform ${
                  openIndex === index ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="bg-[#D9D9D9] text-black p-4 mt-2 rounded-lg">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View More Button */}
      <div className="flex justify-center pb-16">
        <button className="mt-8 px-6 py-3 bg-black text-white rounded-lg font-large border-2 border-[#FFAB40] hover:bg-[#FFAB40] hover:text-black transition">
          View More
        </button>
      </div>
    </div>
  );
};

export default FAQs;