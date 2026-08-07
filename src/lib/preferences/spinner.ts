import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';

const HAS_ADW_SPINNER = typeof (Adw as unknown as { Spinner?: unknown }).Spinner === 'function';

/**
 * `Adw.Spinner`/`Adw.SpinnerPaintable` were only added in libadwaita 1.6 (ships with GNOME 47+).
 * GNOME 46 ships an older libadwaita where they don't exist at all, so fall back to the plain
 * `Gtk.Spinner`, which has been available since GTK4's first release.
 */
export const Spinner = (HAS_ADW_SPINNER ? Adw.Spinner : Gtk.Spinner) as {
	new (props: { visible?: boolean }): Gtk.Widget & { visible: boolean };
};

/**
 * Builds a small animated widget suitable for use as a transient button/label child
 * (e.g. while a download is in progress), mirroring the `Gtk.Image` + `Adw.SpinnerPaintable`
 * pattern used when it's available.
 */
export function createSpinnerWidget(): Gtk.Widget {
	if (!HAS_ADW_SPINNER) return new Gtk.Spinner({ spinning: true });

	const image = new Gtk.Image();
	image.paintable = new (
		Adw as unknown as { SpinnerPaintable: new (props: { widget: Gtk.Widget }) => Gdk.Paintable }
	).SpinnerPaintable({ widget: image });
	return image;
}
