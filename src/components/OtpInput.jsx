/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

const OtpInput = ({ length = 4, onOtpSubmit = () => {} }) => {
  const [otp, setOtp] = useState(new Array(length).fill("")); // Store OTP values
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus(); // Focus on the first input when component mounts
    }
  }, []);

  const handleChange = (index, e) => {
    const value = e.target.value;

    // Allow only numeric input
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Limit to 1 digit
    setOtp(newOtp);

    // Trigger onOtpSubmit when all fields are filled
    const combinedOtp = newOtp.join(""); // Combine the array into a string
    if (combinedOtp.length === length) {
      console.log("OTP entered: ", combinedOtp); // Log the OTP
      onOtpSubmit(combinedOtp); // Submit OTP only when all fields are filled
    }

    // Move focus to the next input if the current field is filled
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleClick = (index) => {
    // Optional: Move focus to empty field if clicked
    if (!otp[index] && index > 0 && !otp[index - 1]) {
      inputRefs.current[otp.indexOf("")].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !otp[index] && // If current input is empty
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      // Move focus to the previous input on backspace if the current field is empty
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex space-x-2">
      {otp.map((value, index) => {
        return (
          <input
            key={index}
            type="text"
            ref={(input) => (inputRefs.current[index] = input)}
            value={value}
            onChange={(e) => handleChange(index, e)}
            onClick={() => handleClick(index)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-md focus:outline-none focus:border-custom_black"
            maxLength="1"
          />
        );
      })}
    </div>
  );
};

export default OtpInput;
