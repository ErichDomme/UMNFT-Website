import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	base: "https://ErichDomme.github.io/UMNFT-Website/",
	plugins: [react()],
});
