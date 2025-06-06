import { error } from '@sveltejs/kit';

const TIMEOUT_MS = 7000;

export async function GET({ url }) {
	let imageUrl = url.searchParams.get('url');
	if (!imageUrl) throw error(400, 'Missing image URL');

	if (!imageUrl.startsWith('http')) {
		imageUrl = 'https://' + imageUrl.replace(/^\/+/, '');
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

	try {
		console.time('⏳ Instagram Fetch');
		const response = await fetch(imageUrl, {
			signal: controller.signal,
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
				Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
				Referer: 'https://www.instagram.com/',
				'Sec-Fetch-Dest': 'image',
				'Sec-Fetch-Mode': 'no-cors',
				'Sec-Fetch-Site': 'cross-site',
				DNT: '1'
			}
		});
		console.timeEnd('⏳ Instagram Fetch');
		clearTimeout(timeout);

		if (!response.ok) throw error(response.status, 'Bad status from Instagram CDN');

		const arrayBuffer = await response.arrayBuffer();
		const contentType = response.headers.get('content-type') || 'image/jpeg';

		return new Response(arrayBuffer, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=86400'
			}
		});
	} catch (err) {
		clearTimeout(timeout);
		console.error('🔥 Instagram image proxy failed:', err);
		throw error(500, 'Failed to fetch image from Instagram');
	}
}
