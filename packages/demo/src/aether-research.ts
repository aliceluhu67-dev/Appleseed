import LibcurlClient from "@mercuryworkshop/libcurl-transport";
import EpoxyClient from "@mercuryworkshop/epoxy-transport";
import { defaultConfigDev } from "@mercuryworkshop/scramjet";
import { Controller, type Frame } from "@mercuryworkshop/scramjet-controller";
import {
	CatchEscapedLinksPlugin,
	HttpCachePlugin,
	UrlWatcherPlugin,
} from "@mercuryworkshop/scramjet-utils";

let controllerPromise: Promise<Controller> | null = null;
const cachePlugin = new HttpCachePlugin();
const transportPreferenceKey = "aether-study-transport";

async function waitForControllerOrReady(timeoutMs = 10000): Promise<void> {
	if (navigator.serviceWorker.controller) return;

	const ready = navigator.serviceWorker.ready.then(() => {});
	const controllerChanged = new Promise<void>((resolve) => {
		const onChange = () => {
			navigator.serviceWorker.removeEventListener("controllerchange", onChange);
			resolve();
		};
		navigator.serviceWorker.addEventListener("controllerchange", onChange, {
			once: true,
		} as AddEventListenerOptions);
	});
	const timeout = new Promise<void>((resolve) =>
		setTimeout(resolve, timeoutMs)
	);

	await Promise.race([ready, controllerChanged, timeout]);
}

async function getController(): Promise<Controller> {
	controllerPromise ??= (async () => {
		const registration = await navigator.serviceWorker.register("/sw.js");
		await waitForControllerOrReady();

		const serviceworker =
			navigator.serviceWorker.controller ?? registration.active;
		if (!serviceworker) {
			throw new Error("Scramjet service worker is not available");
		}

		const wisp =
			import.meta.env.VITE_WISP_URL || "ws://localhost:4142/";
		const transport =
			localStorage.getItem(transportPreferenceKey) === "libcurl"
				? new LibcurlClient({ wisp })
				: new EpoxyClient({ wisp });

		const controller = new Controller({
			serviceworker,
			transport,
			config: {
				scramjetPath: "/study-assets/scramjet.js",
				wasmPath: "/study-assets/scramjet.wasm",
			},
			scramjetConfig: defaultConfigDev,
		});
		await controller.wait();
		return controller;
	})();

	return controllerPromise;
}

export async function createAetherFrame(
	iframe: HTMLIFrameElement,
	onUrlChange?: (url: string) => void
): Promise<Frame> {
	const controller = await getController();
	const urlWatcher = new UrlWatcherPlugin((url) => onUrlChange?.(url));
	const catchEscapedLinks = new CatchEscapedLinksPlugin(
		(url) => new URL(`/research.html?goto=${encodeURIComponent(url.href)}`, location.origin)
	);

	return controller.createFrame(iframe, {
		plugins: [cachePlugin, urlWatcher, catchEscapedLinks],
	});
}
