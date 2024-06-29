import "./gtag";

import { FunctionComponent, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

declare global {
  interface Window {
    gtag?: Function;
  }
}

const Index: FunctionComponent = () => (
  <StrictMode>
    <App />
  </StrictMode>
);

const container = document.createElement("div");
document.body.append(container);
createRoot(container).render(<Index />);
