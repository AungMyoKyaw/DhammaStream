import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false, // Disabled for faster builds - GitHub Pages compresses automatically
			strict: false
		}),
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH || '/DhammaStream'
		},
		prerender: {
			concurrency: process.env.CI ? 20 : 40, // Higher concurrency for faster builds
			crawl: false, // Disable crawling overhead
			entries: ['*', '/teachers', '/browse'], // Explicit entry points
			handleHttpError: 'warn'
		}
	}
};

export default config;
