
  import { createRoot } from "react-dom/client";
  import AppRouter from "./app/AppRouter.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<AppRouter />);
  