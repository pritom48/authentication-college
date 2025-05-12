import axios from "axios";

const PINATA_API_KEY = "9d6588231c92521d48f1";
const PINATA_SECRET_API_KEY =
  "1792e0a63cd0efa30d48b41f85fba383f83752b887a53e2d9df52018be9d19e9";

export const uploadToIPFS = async (data) => {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const formData = new FormData();
  formData.append("file", blob, "userdata.json");

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    return response.data.IpfsHash; // <-- CID returned from Pinata
  } catch (error) {
    console.error("Pinata upload failed:", error);
    throw error;
  }
};
