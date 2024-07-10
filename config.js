const { Buffer } = require("buffer");
const { uploadDirect } = require("@uploadcare/upload-client");

// Replace with your own Uploadcare public key
const UPLOADCARE_PUBLIC_KEY = "your_public_key_here";

// Function to upload a file to Uploadcare and return the URL
async function uploadFile(base64Data, fileName, contentType) {
  try {
    const fileData = Buffer.from(base64Data, "base64");

    const response = await uploadDirect(fileData, {
      publicKey: UPLOADCARE_PUBLIC_KEY,
      store: "auto",
      fileName: fileName,
      contentType: contentType,
    });

    console.log("File uploaded successfully:", response.cdnUrl);
    return response.cdnUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

module.exports = { uploadFile };