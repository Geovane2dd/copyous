import Meta from 'gi://Meta';

import * as Config from 'resource:///org/gnome/shell/misc/config.js';

/**
 * Only safe to import from code that runs in the shell (compositor) process, e.g. `extension.js`
 * and its dependencies. The preferences window runs in a separate process (the
 * `org.gnome.Shell.Extensions` D-Bus service) which mounts its gresource bundle at
 * `resource:///org/gnome/Shell/Extensions/js/...` instead, so this resource doesn't exist there.
 */
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
