import React, { useState, useRef, useEffect } from "react";
import { uploadToIPFS } from "../utils/pinata";

const Signup = () => {
  const [image, setImage] = useState(null);
  const [gridImages, setGridImages] = useState([]);
  const [selectedGrids, setSelectedGrids] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hashValue, setHashValue] = useState("");
  const [salt, setSalt] = useState("");
  const canvasRef = useRef(null);

  const gridSize = 4; // 4x4 grid
  const gridValues = Array.from({ length: 16 }, (_, i) => `G${i + 1}`); // Unique values G1 to G16

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setSelectedGrids([]);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!image) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const pieceWidth = img.width / gridSize;
      const pieceHeight = img.height / gridSize;
      const pieces = [];

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const pieceCanvas = document.createElement("canvas");
          pieceCanvas.width = pieceWidth;
          pieceCanvas.height = pieceHeight;
          const pieceCtx = pieceCanvas.getContext("2d");
          pieceCtx.drawImage(
            img,
            col * pieceWidth,
            row * pieceHeight,
            pieceWidth,
            pieceHeight,
            0,
            0,
            pieceWidth,
            pieceHeight
          );
          pieces.push(pieceCanvas.toDataURL());
        }
      }
      setGridImages(pieces);
    };
  }, [image]);

  const toggleGridSelection = (index) => {
    setSelectedGrids((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else if (prev.length < 6) {
        return [...prev, index];
      }
      return prev;
    });
  };

  const generateSalt = (length = 16) => {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let salt = "";
    for (let i = 0; i < length; i++) {
      salt += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return salt;
  };

  const handleSignup = async () => {
    if (password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (selectedGrids.length < 6) {
      alert("Please select at least 6 image grids.");
      return;
    }

    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const hashedPasswordBuffer = await crypto.subtle.digest(
      "SHA-512",
      passwordData
    );
    const hashedPasswordArray = Array.from(
      new Uint8Array(hashedPasswordBuffer)
    );
    const hashedPasswordHex = hashedPasswordArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    const gridValueString = selectedGrids.join(""); // e.g. "014513"
    const generatedSalt = generateSalt(); // use the function you defined
    setSalt(generatedSalt); // update state

    const combined = hashedPasswordHex + gridValueString + generatedSalt;
    const combinedData = encoder.encode(combined);
    const finalHashBuffer = await crypto.subtle.digest("SHA-512", combinedData);
    const finalHashArray = Array.from(new Uint8Array(finalHashBuffer));
    const finalHash = finalHashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    setHashValue(finalHash); // update hash in state

    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Selected Grids:", selectedGrids);
    console.log("Hashed Password:", hashedPasswordHex);
    console.log("Salt:", generatedSalt);
    console.log("Final Hash:", finalHash);

    const data = {
      userID: username,
      salt: generatedSalt,
      finalHash,
    };

    try {
      const cid = await uploadToIPFS(data);
      console.log("Uploaded to IPFS. CID:", cid);
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md w-full flex justify-center gap-4">
      <div className="w-96 text-center">
        <h2 className="text-xl font-bold mb-4">Signup</h2>
        <input
          type="text"
          placeholder="Username"
          className="input input-bordered w-full mb-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password (Min 8 chars)"
          className="input input-bordered w-full mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="file"
          className="file-input file-input-neutral mb-4"
          onChange={handleFileChange}
        />
        {image && (
          <div className="mt-4 grid grid-cols-4 gap-1">
            {gridImages.map((src, index) => (
              <div
                key={index}
                className={`relative w-full cursor-pointer border-2 rounded ${
                  selectedGrids.includes(index)
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                onClick={() => toggleGridSelection(index)}
              >
                <img src={src} alt={`Grid ${index + 1}`} className="w-full" />
                {selectedGrids.includes(index) && (
                  <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {selectedGrids.indexOf(index) + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleSignup}
        >
          Signup
        </button>
      </div>
      <div className="w-64 p-4 border rounded-lg shadow-md bg-gray-100">
        <h3 className="text-lg font-bold text-black mb-2">Final Hash</h3>
        <p className="break-all text-sm text-gray-700">
          {hashValue || "No hash generated yet."}
        </p>
        <h3 className="text-md font-bold mt-2 text-black">Salt</h3>
        <p className="break-all text-sm text-gray-700">
          {salt || "No salt generated yet."}
        </p>
      </div>
    </div>
  );
};

export default Signup;
