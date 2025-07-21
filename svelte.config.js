import vercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte'],
	preprocess: [vitePreprocess()],
	vitePlugin: {
		inspector: true
	},
	kit: {
		adapter: vercel({
			runtime: 'nodejs20.x' // 🔧 maximum node v20 Required for now to avoid Node 22 error in vercel
		})
	}
};

export default config;
