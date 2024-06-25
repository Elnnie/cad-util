import { defineConfig } from "vite";
import commonjs from "vite-plugin-commonjs";
export default defineConfig({
	plugins: [commonjs() as any],
	define: {
		"process.env": {},
		"process.platform": {}
	},
	build: {
		lib: {
			entry: "./src/main.ts",
			name: "cad-util",
			fileName: "cad-util"
		}
	}
});
