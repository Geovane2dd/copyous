import Clutter from 'gi://Clutter';
import St from 'gi://St';

const HAS_ORIENTATION = 'orientation' in St.BoxLayout.prototype;

/**
 * `St.BoxLayout` only gained an `orientation` constructor property in GNOME 48 (before that,
 * only the boolean `vertical` existed) -- `Error: No property orientation on StBoxLayout` on
 * GNOME 46/47. Normalizes `orientation` into `vertical` when the real property isn't there.
 */
export function boxLayoutProps<T extends { orientation?: Clutter.Orientation }>(
	props: T,
): Omit<T, 'orientation'> & { vertical?: boolean } {
	if (HAS_ORIENTATION || !('orientation' in props)) return props;

	const { orientation, ...rest } = props;
	return { ...rest, vertical: orientation === Clutter.Orientation.VERTICAL };
}
