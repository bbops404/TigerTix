import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const eventService = {
  // Upload event image
  uploadEventImage: async (imageFile, oldImageKey = null) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (oldImageKey) {
        formData.append("oldImageKey", oldImageKey);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/events/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading event image:", error);
      throw error;
    }
  },

  // Upload venue map
  uploadVenueMap: async (mapFile, oldMapKey = null) => {
    try {
      const formData = new FormData();
      formData.append("venueMap", mapFile);
      if (oldMapKey) {
        formData.append("oldImageKey", oldMapKey);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/events/upload-venue-map`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading venue map:", error);
      throw error;
    }
  }
};

export default eventService; 