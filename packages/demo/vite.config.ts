import { viteStaticCopy } from "vite-plugin-static-copy";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
	fileURLToPath(new URL("../..", import.meta.url))
);

function serveAetherUi() {
	return {
		name: "serve-aether-ui",
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				const url = new URL(req.url ?? "/", "http://localhost");
				const pathname =
					url.pathname === "/" ? "/studyhub.html" : url.pathname;

				if (
					pathname !== "/enrichment.html" &&
					pathname !== "/research.html" &&
					pathname !== "/resources.html" &&
					pathname !== "/studyhub.html"
				) {
					next();
					return;
				}

				const htmlPath = path.join(repoRoot, pathname.slice(1));
				const html = await fs.readFile(htmlPath, "utf-8");
				const transformed = await server.transformIndexHtml(pathname, html);

				res.statusCode = 200;
				res.setHeader("Content-Type", "text/html; charset=utf-8");
				res.end(transformed);
			});
		},
	};
}

export default {
	plugins: [
		serveAetherUi(),
		viteStaticCopy({
			structured: false,
			targets: [
				{
					src: "node_modules/@mercuryworkshop/scramjet/dist/*",
					dest: "study-assets",
					rename: (name, extension) => {
						const filename = `${name}.${extension}`;
						const names = {
							"scramjet.js": "research-engine.js",
							"scramjet.js.map": "research-engine.js.map",
							"scramjet.mjs": "research-engine.mjs",
							"scramjet.mjs.map": "research-engine.mjs.map",
							"scramjet.wasm": "research-engine.wasm",
							"scramjet-external.mjs": "research-engine-external.mjs",
							"scramjet_bundled.js": "research-engine-bundled.js",
							"scramjet_bundled.js.map": "research-engine-bundled.js.map",
							"scramjet_bundled.mjs": "research-engine-bundled.mjs",
							"scramjet_bundled.mjs.map": "research-engine-bundled.mjs.map",
						};

						return names[filename] ?? filename;
					},
				},
				{
					src: "node_modules/@mercuryworkshop/scramjet-controller/dist/*",
					dest: "controller",
				},
			],
		}),
	],
};
