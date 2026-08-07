import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import { registerClass } from '../../common/gjs.js';

interface ButtonRowProps {
	title: string;
	start_icon_name?: string;
}

const HAS_ADW_BUTTON_ROW = typeof (Adw as unknown as { ButtonRow?: unknown }).ButtonRow === 'function';

/**
 * `Adw.ButtonRow` was only added in libadwaita 1.6 (ships with GNOME 47+). GNOME 46 ships an
 * older libadwaita where the class doesn't exist at all (`new Adw.ButtonRow()` throws
 * `TypeError: ... is not a constructor`), so fall back to a plain, activatable `Adw.ActionRow`,
 * which has the same `activated` signal.
 */
@registerClass()
class ButtonRowFallback extends Adw.ActionRow {
	constructor(props: ButtonRowProps) {
		super({ title: props.title, activatable: true });

		if (props.start_icon_name) this.add_prefix(new Gtk.Image({ icon_name: props.start_icon_name }));
	}
}

export const ButtonRow = (HAS_ADW_BUTTON_ROW ? Adw.ButtonRow : ButtonRowFallback) as {
	new (props: ButtonRowProps): Adw.PreferencesRow & {
		add_css_class(name: string): void;
		connect(signal: 'activated', callback: () => void): number;
	};
};
