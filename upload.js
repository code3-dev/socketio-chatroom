const { Buffer } = require("buffer");
const { uploadDirect } = require("@uploadcare/upload-client");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config({
  path: "./config.env",
});

const UPLOADCARE_PUBLIC_KEY =
  process.env.UPLOADCARE_PUBLIC_KEY || "your_uploadcare_public_key";

/**
 * Upload a file to Uploadcare and return the URL.
 * @param {string} base64Data - The base64 encoded data of the file.
 * @param {string} fileName - The name of the file.
 * @param {string} contentType - The MIME type of the file.
 * @returns {Promise<string>} - The URL of the uploaded file.
 */
async function uploadFile(base64Data, fileName, contentType) {
  const maxRetries = 5;

  /**
   * Delay for a specified amount of time.
   * @param {number} retryCount - The current retry attempt.
   * @returns {Promise<void>}
   */
  const retryDelay = (retryCount) =>
    new Promise((resolve) => setTimeout(resolve, retryCount * 1000));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Convert the base64 string to a Buffer
      const fileData = Buffer.from(base64Data, "base64");

      // Upload the file using the Uploadcare API
      const response = await uploadDirect(fileData, {
        publicKey: UPLOADCARE_PUBLIC_KEY,
        store: "auto",
        fileName: fileName,
        contentType: contentType,
      });

      console.log("File uploaded successfully:", response.cdnUrl);
      return response.cdnUrl;
    } catch (error) {
      console.error(
        `Error uploading file, attempt ${attempt} of ${maxRetries}:`,
        error
      );

      if (attempt < maxRetries) {
        await retryDelay(attempt);
        console.log(`Retrying upload (attempt ${attempt + 1})...`);
      } else {
        console.error("Max retries reached. Upload failed.");
        throw error;
      }
    }
  }
}

module.exports = { uploadFile };