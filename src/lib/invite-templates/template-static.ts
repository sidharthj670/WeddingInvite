/** URL for bundled assets under `static/invite-templates/<folder>/`. */
export function templateStaticUrl(templateFolder: string, ...parts: string[]): string {
	const path = parts.filter(Boolean).join('/');
	return `/invite-templates/${templateFolder}/${path}`;
}
