interface SegmentData {
	segment: string;
	isWordLike?: boolean;
}

interface SegmenterLike {
	segment(text: string): Iterable<SegmentData>;
}

const HAS_INTL_SEGMENTER = typeof Intl.Segmenter === 'function';

const WORD_RE = /[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu;
const WORD_LIKE_RE = /[\p{L}\p{N}]/u;

/**
 * `Intl.Segmenter` isn't implemented by the SpiderMonkey build GJS ships on GNOME 46
 * (`TypeError: Intl.Segmenter is not a constructor`). Fall back to an approximation instead:
 * splitting by Unicode code point for graphemes (doesn't merge combining marks/ZWJ emoji
 * sequences into a single cluster, but never crashes) and a simple letter/number run split
 * for words.
 */
export function createGraphemeSegmenter(): SegmenterLike {
	if (HAS_INTL_SEGMENTER) return new Intl.Segmenter(undefined, { granularity: 'grapheme' });

	return {
		segment(text: string): SegmentData[] {
			return Array.from(text, (segment) => ({ segment }));
		},
	};
}

export function createWordSegmenter(): SegmenterLike {
	if (HAS_INTL_SEGMENTER) return new Intl.Segmenter(undefined, { granularity: 'word' });

	return {
		segment(text: string): SegmentData[] {
			return Array.from(text.matchAll(WORD_RE), (m) => ({
				segment: m[0],
				isWordLike: WORD_LIKE_RE.test(m[0]),
			}));
		},
	};
}
