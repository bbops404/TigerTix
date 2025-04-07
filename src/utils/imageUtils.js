// src/utils/ImageUtils.js

/**
 * Consistently formats image URLs across the application
 * @param {string} imageUrl - The raw image URL or path from the server
 * @returns {string|null} - Properly formatted URL or null if no image
 */
// src/utils/ImageUtils.js - update the formatImageUrl function
export const formatImageUrl = (imageUrl) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

  if (!imageUrl) return null;

  // If the URL is already absolute but contains /api/uploads, fix it
  if (
    (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) &&
    imageUrl.includes("/api/uploads/")
  ) {
    // Extract the domain part
    const urlObj = new URL(imageUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    // Replace /api/uploads/ with /uploads/ in the path
    const fixedPath = imageUrl.replace(
      `${baseUrl}/api/uploads/`,
      `${baseUrl}/uploads/`
    );
    return fixedPath;
  }

  // If the URL is already absolute otherwise, return it as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Handle relative paths
  let formattedUrl = imageUrl;

  // If path includes /api/uploads, remove the /api prefix
  if (formattedUrl.startsWith("/api/uploads/")) {
    formattedUrl = formattedUrl.replace("/api/uploads/", "/uploads/");
  }

  // If path doesn't start with /, add it
  if (!formattedUrl.startsWith("/")) {
    formattedUrl = `/${formattedUrl}`;
  }

  // Remove trailing slash from API_URL if it exists
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;

  return `${baseUrl}${formattedUrl}`;
};

/**
 * Handles image errors by replacing the broken image with a placeholder
 * @param {Event} e - The error event
 * @param {string} altText - Optional alt text for the placeholder
 */
export const handleImageError = (e, altText = "Image not available") => {
  console.warn(`Image failed to load: ${e.target.src}`);

  // Hide the broken image
  e.target.style.display = "none";

  // Create a placeholder
  const container = e.target.parentNode;

  // Only add placeholder if not already exists
  if (!container.querySelector(".image-placeholder")) {
    const placeholder = document.createElement("div");
    placeholder.className =
      "w-full h-full bg-gray-700 flex items-center justify-center text-white image-placeholder";
    placeholder.innerHTML = `<span class="text-center">${altText}</span>`;
    container.appendChild(placeholder);
  }
};
