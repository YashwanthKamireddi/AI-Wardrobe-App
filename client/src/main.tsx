import { createRoot } from "react-dom/client";
import App from "./App";

import "./styles/custom.css";

import "./index.css";
import "./styles/mobile.css";

// Render the app
createRoot(document.getElementById("root")!).render(<App />);