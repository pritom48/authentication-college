import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import Signup from "./components/Signup.jsx";
import Login from "./components/login";
import Nevber from "./components/nevber.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Nevber></Nevber>,
    element: <Login></Login>,
  },
  {
    path: "/signup",
    element: <Nevber></Nevber>,
    element: <Signup></Signup>,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
