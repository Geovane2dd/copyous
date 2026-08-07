import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { registerClass } from '../../common/gjs.js';

interface ToggleProps {
	name: string;
	label: string;
}

const HAS_ADW_TOGGLE_GROUP = typeof (Adw as unknown as { ToggleGroup?: unknown }).ToggleGroup === 'function';

/**
 * `Adw.ToggleGroup`/`Adw.Toggle` were only added in libadwaita 1.7 (ships with GNOME 47+).
 * GNOME 46 ships an older libadwaita where these classes don't exist at all (`new Adw.ToggleGroup()`
 * throws `TypeError: ... is not a constructor`), so provide a drop-in replacement built out of
 * linked `Gtk.ToggleButton`s exposing the same minimal `active_name`/`set_active_name()`/
 * `notify::active-name`/`add()` surface used by `Profiles`.
 */
@registerClass({
	Properties: {
		'active-name': GObject.ParamSpec.string('active-name', null, null, GObject.ParamFlags.READWRITE, null),
	},
})
class ToggleGroupFallback extends Gtk.Box {
	private readonly _buttons = new Map<string, Gtk.ToggleButton>();
	private _activeName: string | null = null;
	private _updating = false;

	constructor() {
		super({ css_classes: ['linked'], homogeneous: true });
	}

	add(toggle: ToggleProps) {
		const button = new Gtk.ToggleButton({ label: toggle.label, active: toggle.name === this._activeName });
		this._buttons.set(toggle.name, button);
		this.append(button);

		button.connect('toggled', () => {
			if (this._updating || !button.active) return;
			this.active_name = toggle.name;
		});
	}

	get active_name(): string | null {
		return this._activeName;
	}

	set active_name(name: string | null) {
		if (this._activeName === name) return;
		this._activeName = name;

		this._updating = true;
		for (const [n, button] of this._buttons) button.active = n === name;
		this._updating = false;

		this.notify('active-name');
	}

	set_active_name(name: string | null) {
		this.active_name = name;
	}
}

class ToggleFallback implements ToggleProps {
	name: string;
	label: string;

	constructor(props: ToggleProps) {
		this.name = props.name;
		this.label = props.label;
	}
}

export const ToggleGroup = (HAS_ADW_TOGGLE_GROUP ? Adw.ToggleGroup : ToggleGroupFallback) as {
	new (): Gtk.Widget & {
		active_name: string | null;
		set_active_name(name: string | null): void;
		add(toggle: ToggleProps): void;
	};
};

export const Toggle = (HAS_ADW_TOGGLE_GROUP ? Adw.Toggle : ToggleFallback) as { new (props: ToggleProps): ToggleProps };
