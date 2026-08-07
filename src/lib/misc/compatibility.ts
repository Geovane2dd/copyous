import Meta from 'gi://Meta';

import type { ConsoleLike } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Config from 'resource:///org/gnome/shell/misc/config.js';

export const VERSION: number = Number(Config.PACKAGE_VERSION.split('.')[0]);

/**
 * `global.compositor.disable_unredirect()`/`enable_unredirect()` only exist since GNOME 48
 * (Meta functions were relocated to the `Meta.Compositor` namespace). Before that, the same
 * functionality lived on `Meta.disable_unredirect_for_display()`/`enable_unredirect_for_display()`.
 */
export function disableUnredirect(): void {
	if (VERSION >= 48) global.compositor.disable_unredirect();
	else
		(
			Meta as typeof Meta & { disable_unredirect_for_display(display: Meta.Display): void }
		).disable_unredirect_for_display(global.display);
}

export function enableUnredirect(): void {
	if (VERSION >= 48) global.compositor.enable_unredirect();
	else
		(
			Meta as typeof Meta & { enable_unredirect_for_display(display: Meta.Display): void }
		).enable_unredirect_for_display(global.display);
}

interface LoggableExtension {
	metadata: { name: string };
	getLogger(): ConsoleLike;
}

/**
 * Re-implementation of gnome-shell's own `Console` class (js/extensions/sharedInternals.js),
 * used as a polyfill for `ExtensionBase.getLogger()`, which doesn't exist before GNOME 48.
 */
function createLogger(ext: LoggableExtension): ConsoleLike {
	const prefixArgs = (args: unknown[]): unknown[] => [`[${ext.metadata.name}] ${String(args[0])}`, ...args.slice(1)];

	return {
		log: (...args) => console.log(...prefixArgs(args)),
		warn: (...args) => console.warn(...prefixArgs(args)),
		error: (...args) => console.error(...prefixArgs(args)),
		info: (...args) => console.info(...prefixArgs(args)),
		debug: (...args) => console.debug(...prefixArgs(args)),
		assert: (condition, ...args) => {
			if (condition) return;

			const message = 'Assertion failed';
			if (args.length === 0) args.push(message);
			if (typeof args[0] !== 'string') args.unshift(message);
			else args.unshift(`${message}: ${args.shift()}`);

			console.error(...prefixArgs(args));
		},
		trace: (...args) => console.trace(...prefixArgs(args.length ? args : ['Trace'])),
		group: (...args) => console.group(...prefixArgs(args)),
		groupEnd: () => console.groupEnd(),
	};
}

/**
 * GNOME < 48 doesn't have `ExtensionBase.getLogger()`. Polyfill it directly on the instance
 * so every existing `ext.getLogger()` call site keeps working unmodified. Must be called once,
 * as early as possible (e.g. at the start of `enable()` / `fillPreferencesWindow()`).
 */
export function ensureLogger(ext: LoggableExtension): void {
	if (VERSION >= 48) return;

	const logger = createLogger(ext);
	ext.getLogger = () => logger;
}
