import { render } from "preact";

import { App } from "@/components/app";
import "@/styles/main.css";

const root = document.getElementById("root");
if (root) {
  render(<App />, root);
}
