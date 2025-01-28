import React from "react";
import sample_image from "../../assets/sample_image.png";
import Header from "../../components/Header";
import { MdEmail } from "react-icons/md";

const SignUp = () => {
  return (
    <div>
      <Header showSearch={false} showAuthButtons={false} />
      <div className="flex">
        <div className="w-1/2 relative h-[90vh]">
          <img
            src={sample_image}
            alt="UST IPEA"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(180deg,rgba(0,0,0,0.7),rgba(255,171,64,0.7))]"></div>
        </div>

        <div className="w-1/2 bg-custom_black flex flex-col items-center justify-center font-Poppins h-[90vh]">
          <p className="font-bold text-4xl text-white pb-7">Sign Up</p>

          <div className="flex flex-col justify-center  bg-custom_yellow p-6 rounded-lg shadow-lg w-[500px] h-[270px] text-custom_black ">
            <div className="w-full ml-3 pr-4">
              <p className="text-custom_black/85 mb-2 text-lg font-semibold">
                Enter your UST Email
              </p>
              <p className="text-custom_black/85 mb-4 text-[12px] font-light">
                Enter your email address to receive a verification code and
                confirm that you are a Thomasian.
              </p>
            </div>

            {/* Centered Form Elements */}
            <div className="flex flex-col items-center w-full">
              {/* Email Input Field */}
              <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-lg border-2 border-[#D8DADC] h-10 w-72">
                <MdEmail className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="focus:outline-none text-sm w-full text-gray-600"
                  placeholder="Email"
                />
              </div>

              <button className="bg-custom_black text-white px-4 py-2 mt-5 w-72 text-sm rounded-md font-semibold hover:text-custom_yellow transition-all duration-300 transform hover:scale-105">
                Verify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
