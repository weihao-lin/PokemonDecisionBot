import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

/*
  App entry point
  Mounts React into <div id="root"></div> in index.html
  StrictMode to help catch common issues
*/

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);