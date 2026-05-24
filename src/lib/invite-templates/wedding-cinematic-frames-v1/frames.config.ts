import { templateStaticUrl } from '../template-static';

export const TEMPLATE_FOLDER = 'wedding-cinematic-frames-v1';

/** First frame file number in `static/invite-templates/wedding-cinematic-frames-v1/frames/`. */
export const FRAME_START = 4;
/** Last frame file number in `static/invite-templates/wedding-cinematic-frames-v1/frames/`. */
export const FRAME_END = 300;

export const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;

export function frameUrl(frameNumber: number): string {
	return templateStaticUrl(
		TEMPLATE_FOLDER,
		'frames',
		`ezgif-frame-${String(frameNumber).padStart(3, '0')}.jpg`
	);
}

export const frameUrls = Array.from({ length: TOTAL_FRAMES }, (_, i) =>
	frameUrl(FRAME_START + i)
);
