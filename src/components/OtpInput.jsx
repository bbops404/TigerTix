/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

const OtpInput = ({ length = 4, setOtp }) => {
  const [otp, localSetOtp] = useState(new Array(length).fill("")); // Store OTP values
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus(); // Auto-focus first input
    }
  }, []);

  const handleChange = (index, e) => {
    const value = e.target.value;

    // Allow only numeric input
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Store only 1 digit
    localSetOtp(newOtp);
    setOtp(newOtp.join("")); // Store OTP as a string in parent component state

    // Move focus to the next input field
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  return (
    <div className="flex space-x-2">
      {otp.map((value, index) => (
        <input
          key={index}
          type="text"
          ref={(input) => (inputRefs.current[index] = input)}
          value={value}
          onChange={(e) => handleChange(index, e)}
          className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-md focus:outline-none focus:border-custom_black"
          maxLength="1"
        />
      ))}
    </div>
  );
};

export default OtpInput;
