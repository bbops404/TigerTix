import React from "react";
import Header from "../../components/Header";
import sample_image from "../../assets/sample_image.png";

const SignUp_UserDetails = () => {
  return (
    <div>
      <Header showSearch={false} showAuthButtons={false} />
      <div className="flex">
        {/* Left Image Section */}
        <div className="w-1/2 relative h-[90vh]">
          <img
            src={sample_image}
            alt="UST IPEA"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(180deg,rgba(0,0,0,0.7),rgba(255,171,64,0.7))]"></div>
        </div>

        {/* Right Form Section */}
        <div className="w-1/2 bg-custom_black flex flex-col items-center justify-center font-Poppins h-[90vh]">
          <p className="font-bold text-4xl text-white pb-7">Sign Up</p>

          <div className="flex flex-col justify-center bg-custom_yellow p-6 rounded-lg shadow-lg w-[500px] h-auto text-custom_black">
            <div className="w-full ml-3 pr-4">
              <p className="text-custom_black/85 mb-2 text-lg font-semibold">
                Create your Tigertix Account!
              </p>
              <p className="text-custom_black/85 mb-4 text-[12px] font-light">
                Please enter your personal details to complete your profile
                setup.
              </p>
            </div>

            <button
              type="submit"
              className="bg-custom_black text-white px-4 py-2 mt-5 w-72 text-sm rounded-md font-semibold hover:text-custom_yellow transition-all duration-300 transform hover:scale-105"
            >
              Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp_UserDetails;
