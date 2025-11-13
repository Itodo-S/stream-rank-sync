import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import App from "./App.tsx";
import "./index.css";

if (typeof window !== "undefined") {
  const globalWindow = window as unknown as { Buffer?: typeof Buffer };
  globalWindow.Buffer = globalWindow.Buffer ?? Buffer;
}

createRoot(document.getElementById("root")!).render(<App />);
