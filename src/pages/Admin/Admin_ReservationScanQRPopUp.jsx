import React, { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { BiBadgeCheck } from "react-icons/bi";
import { BsQrCodeScan } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-toastify";
import axios from "axios";

// Import the ConfirmMarkAsClaimedModal that was used in Admin_ClaimedReservationModal
const ConfirmMarkAsClaimedModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-[400px] max-w-full shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Confirm Action
        </h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to mark this reservation as claimed?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Admin_ClaimedReservationModal = ({
  reservations,
  onClose,
  onScanAgain,
  onMarkAsClaimed,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleMarkAsClaimed = () => {
    // Open the confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmMarkAsClaimed = async () => {
    try {
      setProcessing(true);
      // Call the parent's markAsClaimed function
      const success = await onMarkAsClaimed();

      // Close the confirmation modal
      setShowConfirmModal(false);

      if (success) {
        // Close the entire modal after a short delay to let the toast be visible
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error in mark as claimed:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Format reservation data for display
  const formatReservationForDisplay = (reservation) => {
    return {
      id: reservation.reservation_id,
      name: reservation.name,
      role: reservation.role || "Attendee", // Default to Attendee if role not provided
      event: reservation.event_name,
      tier: reservation.ticket_tier,
      date: reservation.claiming_date,
      time: reservation.claiming_time,
      amount: `₱${reservation.amount}`,
      status: reservation.claiming_status.toUpperCase(),
    };
  };

  // Create an array of formatted reservations (could be one or more)
  const formattedReservations = Array.isArray(reservations)
    ? reservations.map(formatReservationForDisplay)
    : [formatReservationForDisplay(reservations)];

  return (
    <>
      {/* Only render the parent modal if the confirmation modal is not open */}
      {!showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-[#EFF3F0] rounded-xl p-6 w-[900px] max-w-full shadow-lg relative">
            {/* Back Icon */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 text-[#F09C32] text-2xl hover:text-[#CD8428] transition duration-300"
            >
              <FaArrowLeft />
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold text-[#3B3B3B] mb-2 text-left mt-8">
              ✅ Reservation successfully retrieved!
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-gray-600 mb-4 text-left">
              Below are the details:
            </p>

            {/* Scrollable Table */}
            <div className="overflow-y-auto max-h-[300px] border border-[#D6D3D3] rounded-md">
              <table className="w-full text-sm bg-white">
                <thead className="bg-[#F09C32] text-[#333333]">
                  <tr>
                    {[
                      "Reservation ID",
                      "Name",
                      "Role",
                      "Event Name",
                      "Ticket Tier",
                      "Claiming Date",
                      "Claiming Time",
                      "Amount",
                      "Claiming Status",
                    ].map((header, index) => (
                      <th
                        key={index}
                        className="py-2 px-3 border border-[#D6D3D3]"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formattedReservations.map((reservation) => (
                    <tr key={reservation.id} className="text-center text-black">
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.id}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.name}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.role}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.event}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.tier}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.date}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.time}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.amount}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={onScanAgain}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
              >
                Scan Another QR
              </button>

              {formattedReservations[0].status !== "CLAIMED" && (
                <button
                  onClick={handleMarkAsClaimed}
                  disabled={processing}
                  className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md ${
                    processing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {processing ? "Processing..." : "Mark as Claimed"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmMarkAsClaimedModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmMarkAsClaimed}
      />
    </>
  );
};

const Admin_ReservationScanQRPopUp = ({
  showPopup,
  togglePopup,
  onSuccessfulClaim,
}) => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [claimStatus, setClaimStatus] = useState("pending");
  const [processingClaim, setProcessingClaim] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");

  // Add a new state for showing the claimed reservation modal
  const [showClaimedModal, setShowClaimedModal] = useState(false);

  // Keep track of the scanner instance - don't use React state for this
  // to avoid re-renders and ensure immediate updates
  let scannerInstance = null;

  const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

  // Initialize available cameras when component mounts
  useEffect(() => {
    if (showPopup && !scanned && !reservation && !showClaimedModal) {
      checkCameras();
    }

    // On unmount, make sure we're cleaning up
    return () => {
      if (scannerInstance) {
        scannerInstance
          .stop()
          .catch((err) =>
            console.error("Error stopping scanner on unmount:", err)
          );
        scannerInstance = null;
      }
      // Reset global flag
      window.qrDetectionProcessing = false;
    };
  }, [showPopup, scanned, reservation, showClaimedModal]);

  // Check for available cameras
  const checkCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      console.log("Available cameras:", devices);

      if (devices && devices.length > 0) {
        setCameras(devices);
        setSelectedCamera(devices[0].id); // Select the first camera by default
      } else {
        setError("No cameras found on your device");
      }
    } catch (err) {
      console.error("Error getting cameras:", err);
      setError(
        "Could not access camera. Please ensure camera permissions are granted."
      );
    }
  };

  // Start scanning with the selected camera
  const startScanner = async () => {
    try {
      if (!selectedCamera) {
        setError("No camera selected");
        return;
      }

      // Reset states
      setScanned(false);
      setError(null);
      window.qrDetectionProcessing = false;

      // Make sure any existing scanner is stopped first
      if (scannerInstance) {
        await scannerInstance.stop();
        scannerInstance = null;
      }

      setScanning(true);

      // Clear the QR reader element
      const qrElement = document.getElementById("qr-reader");
      if (qrElement) {
        qrElement.innerHTML = "";
      }

      // Create a new scanner instance
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerInstance = html5QrCode;

      console.log("Starting camera with ID:", selectedCamera);

      // Simplest configuration
      const config = {
        fps: 2, // Low FPS to reduce processing
        qrbox: { width: 250, height: 250 },
      };

      // Define a safe success handler that won't be called multiple times
      const onSuccess = (decodedText) => {
        // Check global flag to prevent multiple parallel processing
        if (window.qrDetectionProcessing) {
          console.log("Already processing a QR code, ignoring new scan");
          return;
        }

        // Set flag immediately
        window.qrDetectionProcessing = true;
        setScanned(true);

        console.log("QR Code detected, stopping scanner...");

        // Stop scanner FIRST, before any other processing
        if (scannerInstance) {
          scannerInstance
            .stop()
            .then(() => {
              console.log("Scanner stopped successfully");
              scannerInstance = null;
              setScanning(false);

              // Now that scanner is stopped, process the QR code
              processQrCode(decodedText);
            })
            .catch((err) => {
              console.error("Error stopping scanner:", err);
              scannerInstance = null;
              setScanning(false);

              // Process anyway
              processQrCode(decodedText);
            });
        } else {
          // If no scanner instance, just process
          setScanning(false);
          processQrCode(decodedText);
        }
      };

      // Start scanning
      await html5QrCode.start(selectedCamera, config, onSuccess, (err) => {
        // Ignore normal scanning errors
        console.debug("QR scan error:", err);
      });

      console.log("Camera started successfully");
    } catch (err) {
      console.error("Error starting scanner:", err);
      setError(`Camera error: ${err.message || "Could not start camera"}`);
      setScanning(false);
      scannerInstance = null;
    }
  };

  // Stop the scanner
  const stopScanner = () => {
    if (scannerInstance) {
      const scanner = scannerInstance;
      scannerInstance = null; // Clear reference immediately

      scanner
        .stop()
        .then(() => {
          console.log("Scanner stopped successfully");
          setScanning(false);
        })
        .catch((err) => {
          console.error("Error stopping scanner:", err);
          setScanning(false);
        });
    } else {
      setScanning(false);
    }
  };

  // Process QR code (separated from scanning)
  const processQrCode = async (decodedText) => {
    try {
      console.log("Processing QR Code:", decodedText);
      setLoading(true);

      // Verify it's a valid reservation ID
      let reservationId = decodedText;

      // Try parsing for common QR code formats
      if (decodedText.includes("UST-TICKET-")) {
        // Format: UST-TICKET-ID-EVENT-TYPE-COUNT
        const parts = decodedText.split("-");
        if (parts.length >= 3) {
          reservationId = parts[2];
          console.log(
            "Extracted reservation ID from UST-TICKET format:",
            reservationId
          );
        }
      }

      // Validate that we have an ID
      if (!reservationId) {
        throw new Error("Invalid QR code format");
      }

      // Fetch reservation details from backend
      const token = sessionStorage.getItem("authToken");
      console.log("Sending validation request with ID:", reservationId);

      const response = await axios.post(
        `${API_BASE_URL}/api/reservations/validate-qr`,
        { reservation_id: reservationId },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Validation API response:", response.data);

      if (response.data && response.data.success && response.data.data) {
        setReservation(response.data.data);
        setClaimStatus(response.data.data.claiming_status);

        // Show the claimed reservation modal after successful validation
        setShowClaimedModal(true);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch reservation details"
        );
      }
    } catch (err) {
      console.error("Error processing QR code:", err);

      if (err.response) {
        console.error(
          "Server responded with error status:",
          err.response.status
        );
        console.error("Error response data:", err.response.data);
      } else if (err.request) {
        console.error("No response received:", err.request);
      }

      setError(err.message || "Failed to process QR code");
    } finally {
      setLoading(false);
    }
  };

  // Manual QR code input
  const handleManualInput = (e) => {
    e.preventDefault();

    // Stop any running scanner first
    stopScanner();

    const formData = new FormData(e.target);
    const manualCode = formData.get("manualCode");

    if (manualCode && manualCode.trim() !== "") {
      setScanned(true);
      window.qrDetectionProcessing = true;
      processQrCode(manualCode.trim());
    }
  };

  const handleMarkAsClaimed = async () => {
    if (!reservation || !reservation.reservation_id || processingClaim)
      return false;

    try {
      setProcessingClaim(true);
      const token = sessionStorage.getItem("authToken");

      console.log(
        `Attempting to mark reservation ${reservation.reservation_id} as claimed`
      );

      const response = await axios.post(
        `${API_BASE_URL}/api/reservations/claim-qr`,
        { reservation_id: reservation.reservation_id },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Claim response:", response.data);

      if (response.data.success) {
        setClaimStatus("claimed");
        setReservation((prev) => ({ ...prev, claiming_status: "claimed" }));

        // Show success toast
        toast.success("Reservation marked as claimed!", {
          style: {
            backgroundColor: "#FFFFFF",
            color: "#000",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "10px",
            marginTop: "70px",
          },
          autoClose: 2000,
        });

        // Call the callback function if provided to refresh parent component
        if (typeof onSuccessfulClaim === "function") {
          onSuccessfulClaim();
        }

        return true;
      } else {
        throw new Error(response.data.message || "Failed to mark as claimed");
      }
    } catch (err) {
      console.error("Error marking as claimed:", err);

      if (err.response) {
        console.error("Server response error:", err.response.status);
        console.error("Error response data:", err.response.data);
      } else if (err.request) {
        console.error("No response received:", err.request);
      }

      setError(err.message || "Failed to mark reservation as claimed");

      // Show error toast
      toast.error("Failed to mark as claimed", {
        style: {
          backgroundColor: "#FFFFFF",
          color: "#000",
          fontWeight: "bold",
          borderRadius: "8px",
          padding: "10px",
          marginTop: "70px",
        },
        autoClose: 2000,
      });

      return false;
    } finally {
      setProcessingClaim(false);
    }
  };

  const handleClose = () => {
    stopScanner();
    setScanned(false);
    setReservation(null);
    setError(null);
    setShowClaimedModal(false);
    window.qrDetectionProcessing = false;
    togglePopup();
  };

  const handleScanAgain = () => {
    stopScanner();
    setScanned(false);
    setReservation(null);
    setError(null);
    setShowClaimedModal(false);
    window.qrDetectionProcessing = false;

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      checkCameras();
    }, 100);
  };

  // Render camera selection and start button
  const renderCameraSelector = () => {
    return (
      <div className="w-full max-w-md mb-4">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Camera
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            disabled={scanning}
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id}`}
              </option>
            ))}
          </select>
        </div>

        {!scanning && (
          <button
            onClick={startScanner}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            disabled={!selectedCamera}
          >
            Start Scanning
          </button>
        )}

        {scanning && (
          <button
            onClick={stopScanner}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Stop Scanning
          </button>
        )}
      </div>
    );
  };

  // Render different content based on scan status
  const renderContent = () => {
    // If the claimed reservation modal should be shown, don't render other content
    if (showClaimedModal && reservation) {
      return (
        <Admin_ClaimedReservationModal
          reservations={reservation}
          onClose={handleClose}
          onScanAgain={handleScanAgain}
          onMarkAsClaimed={handleMarkAsClaimed}
        />
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <div className="text-gray-700 mb-6">{error}</div>
          <button
            onClick={handleScanAgain}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Scan Again
          </button>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
          <div className="text-gray-700">Processing QR code...</div>
        </div>
      );
    }

    // Default view - Camera selector and QR scanner
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Scan QR Code
          </h3>
          <p className="text-sm text-gray-600">
            Select a camera and start scanning
          </p>
        </div>

        {renderCameraSelector()}

        {/* QR reader container - will be populated by the scanner */}
        <div
          id="qr-reader"
          className="w-full max-w-md h-64 border-2 border-gray-300 rounded-lg overflow-hidden"
        ></div>

        {scanning && (
          <div className="mt-2 text-sm text-gray-500">
            Position the QR code within the scanning area
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity ${
        showPopup ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Don't render the main container if showing the claimed modal */}
      {showClaimedModal ? (
        renderContent()
      ) : (
        <div className="bg-white rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-y-auto p-6 relative flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-800 transition"
            >
              <IoArrowBack size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              Scan Reservation QR Code
            </h2>
            <div className="w-6"></div> {/* Empty div for alignment */}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            {renderContent()}
          </div>

          <button
            onClick={handleClose}
            className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition self-center"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Admin_ReservationScanQRPopUp;
