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
				},
				{
					src: "node_modules/@mercuryworkshop/scramjet-controller/dist/*",
					dest: "controller",
				},
			],
		}),
	],
};
