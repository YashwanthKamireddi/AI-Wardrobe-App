import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/mobile.css";

// Render the app
createRoot(document.getElementById("root")!).render(<App />);