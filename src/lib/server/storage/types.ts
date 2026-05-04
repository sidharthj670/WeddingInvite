export type UploadKind = 'hero' | 'gallery' | 'music';

export type SaveFileInput = {
	slug: string;
	kind: UploadKind;
	buffer: Buffer;
	mime: string;
	originalName: string;
};

export type SaveFileResult = {
	publicPath: string;
	storedName: string;
};

export interface StorageAdapter {
	save(input: SaveFileInput): Promise<SaveFileResult>;
	/** Resolve absolute directory for reading */
	getAbsolutePath(slug: string, storedName: string): string;
}
