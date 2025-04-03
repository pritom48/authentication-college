import { useState } from "react";

import "./App.css";
import Nevber from "./components/nevber";

import Signup from "./components/Signup";
import Login from "./components/login";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Nevber></Nevber>

      <Signup></Signup>
    </>
  );
}

export default App;
