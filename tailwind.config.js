import { join } from 'path';
import defaultTheme from 'tailwindcss/defaultTheme';

import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import { skeleton } from '@skeletonlabs/tw-plugin';

export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Lexend', ...defaultTheme.fontFamily.sans],
				heading: ['Lexend', ...defaultTheme.fontFamily.sans],
				body: [...defaultTheme.fontFamily.sans],
				mono: [...defaultTheme.fontFamily.mono],
				ibmPlexMono: ['IBM Plex Mono', ...defaultTheme.fontFamily.mono]
			},
			fontWeight: {
				black: '800' // Sora doesn't include 900, so we remap this
			}
		}
	},
	plugins: [
		forms,
		typography,
		skeleton({
			themes: {
				preset: [
					{
						name: 'modern',
						enhancements: true
					}
				]
			}
		})
	]
};
