import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { SaveFileInput, SaveFileResult, StorageAdapter } from './types';

const ALLOWED: Record<string, string[]> = {
	hero: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/pjpeg'],
	gallery: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/pjpeg'],
	music: ['audio/mpeg', 'audio/mp3', 'audio/mp4']
};

const EXT: Record<string, string> = {
	'image/jpeg': '.jpg',
	'image/jpg': '.jpg',
	'image/pjpeg': '.jpg',
	'image/png': '.png',
	'image/webp': '.webp',
	'audio/mpeg': '.mp3',
	'audio/mp3': '.mp3',
	'audio/mp4': '.m4a'
};

const MAX = { hero: 8 * 1024 * 1024, gallery: 8 * 1024 * 1024, music: 15 * 1024 * 1024 };

function rootDir(): string {
	return path.join(process.cwd(), 'data', 'uploads');
}

export class LocalStorageAdapter implements StorageAdapter {
	async save(input: SaveFileInput): Promise<SaveFileResult> {
		const allowed = ALLOWED[input.kind];
		if (!allowed?.includes(input.mime)) {
			throw new Error(
				`Unsupported type “${input.mime}” for ${input.kind}. Use JPEG, PNG, or WebP for images, or MP3 / M4A for music.`
			);
		}
		const max = MAX[input.kind];
		if (input.buffer.length > max) {
			throw new Error('File too large');
		}
		const ext = EXT[input.mime] ?? (path.extname(input.originalName).slice(0, 8) || '.bin');
		const storedName = `${input.kind}-${randomUUID()}${ext}`;
		const dir = path.join(rootDir(), input.slug);
		await mkdir(dir, { recursive: true });
		const abs = path.join(dir, storedName);
		await writeFile(abs, input.buffer);
		const publicPath = `/api/files/${encodeURIComponent(input.slug)}/${encodeURIComponent(storedName)}`;
		return { publicPath, storedName };
	}

	getAbsolutePath(slug: string, storedName: string): string {
		return path.join(rootDir(), slug, storedName);
	}
}

export const storage: StorageAdapter = new LocalStorageAdapter();
