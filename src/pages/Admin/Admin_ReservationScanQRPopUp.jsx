import React, { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";

const Admin_ReservationScanQRPopUp = ({ showPopup, togglePopup }) => {
  const [playing, setPlaying] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (showPopup) {
      startVideo();
    } else {
      stopVideo();
    }
  }, [showPopup]);

  const HEIGHT = 600;
  const WIDTH = 600;

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        setPlaying(true);
        setStream(stream);
        let video = document.getElementsByClassName("app__videoFeed")[0];
        if (video) {
          video.srcObject = stream;
        }
      })
      .catch((err) => console.error(err));
  };

  const stopVideo = () => {
    setPlaying(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleClose = () => {
    stopVideo();
    togglePopup();
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
        showPopup ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg w-[700px] h-[600px] p-6 relative flex flex-col items-center">
        <button onClick={handleClose} className="absolute top-4 left-4 text-gray-600">
          <IoArrowBack size={20} />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {playing ? (
            <>
              <video
                height={HEIGHT}
                width={WIDTH}
                muted
                autoPlay
                className="app__videoFeed"
              ></video>
              <p className="mt-2 text-lg text-[12px] text-black mt-2">Please show your QR code on the Webcam</p>
            </>
          ) : (
            <p className="text-lg font-medium text-gray-700">Scanning stopped</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="mt-1 px-[70px] py-1 bg-[#383636] text-[15px] text-white rounded-xl hover:bg-gray-700 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Admin_ReservationScanQRPopUp;
