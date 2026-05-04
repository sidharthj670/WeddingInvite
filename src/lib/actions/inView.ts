import type { Action } from 'svelte/action';

type Opts = { once?: boolean; rootMargin?: string; threshold?: number };

/**
 * Sets `data-in-view` on the node when it enters the viewport (for CSS hooks).
 */
export const inView: Action<HTMLElement, Opts | undefined> = (node, params) => {
	const { once = true, rootMargin = '0px 0px -8% 0px', threshold = 0.12 } = params ?? {};

	let obs: IntersectionObserver;

	const apply = (visible: boolean) => {
		if (visible) {
			node.setAttribute('data-in-view', 'true');
			if (once) obs.disconnect();
		} else if (!once) {
			node.removeAttribute('data-in-view');
		}
	};

	obs = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				apply(e.isIntersecting);
			}
		},
		{ root: null, rootMargin, threshold }
	);
	obs.observe(node);

	return {
		destroy() {
			obs.disconnect();
		}
	};
};
