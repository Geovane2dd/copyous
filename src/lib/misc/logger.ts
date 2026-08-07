import type { ConsoleLike } from 'resource:///org/gnome/shell/extensions/extension.js';

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
 *
 * Deliberately feature-detects instead of checking the shell version: this module must stay
 * safe to import from both the extension (shell process) and the preferences (D-Bus service)
 * contexts, which mount their gresource bundles at different paths, so it can't depend on
 * `misc/compatibility.js`'s `resource:///org/gnome/shell/...`-only `VERSION`.
 */
export function ensureLogger(ext: LoggableExtension): void {
	if (typeof ext.getLogger === 'function') return;

	const logger = createLogger(ext);
	ext.getLogger = () => logger;
}
