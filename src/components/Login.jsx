import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ storedHash, storedUsername }) => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [gridImages, setGridImages] = useState([]);
  const [selectedGrids, setSelectedGrids] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const canvasRef = useRef(null);

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

      const gridSize = 4;
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

  const handleLogin = async () => {
    const gridValues = selectedGrids.join("");
    const combinedValue = password + gridValues;

    const encoder = new TextEncoder();
    const data = encoder.encode(combinedValue);

    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    if (username === storedUsername && hashHex === storedHash) {
      setMessage("Login Successful!");
    } else {
      setMessage("Invalid credentials!");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md w-full flex justify-center gap-4">
      <div className="w-96 text-center">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          type="text"
          placeholder="Username"
          className="input input-bordered w-full mb-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
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
        <p className="mt-4 text-sm">
          <a href="/signup" className="text-blue-500 hover:underline">
            New user? Signup
          </a>
          |
          <a
            href="/forgot-password"
            className="text-blue-500 hover:underline ml-2"
          >
            Forgot password?
          </a>
        </p>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleLogin}
        >
          Login
        </button>
        <p className="mt-4 text-red-500 font-bold">{message}</p>
      </div>
    </div>
  );
};

export default Login;
