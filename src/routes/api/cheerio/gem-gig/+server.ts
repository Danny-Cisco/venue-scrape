import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const targetUrl = url.searchParams.get('url');

	if (!targetUrl) {
		return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	let scrapedData = {};

	// 🔧 Create or reuse a request queue
	const requestQueue = await RequestQueue.open();

	// 💡 Add request with a uniqueKey to force processing
	await requestQueue.addRequest({
		url: targetUrl,
		uniqueKey: `${targetUrl}#${uuidv4()}`
	});

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			const title =
				$('h1.hero-display.second').text().trim() || $('h2.text-align-left').first().text().trim();
			const date = $('.w-col.w-col-6 .text-block').first().text().trim();
			const time = $('.text-block')
				.filter((_, el) =>
					$(el)
						.text()
						.match(/\d+(am|pm)/i)
				)
				.first()
				.text()
				.trim();
			const description = $('.rich-text-wrapper.w-richtext').text().trim();
			const ticketUrl = $('a:contains("BUY TICKETS HERE")').attr('href');
			const imageUrl =
				$('.photo-line-animation img.photo').attr('src') || $('.sticky-div img.photo').attr('src');

			scrapedData = { title, date, time, description, imageUrl, ticketUrl };
		}
	});

	try {
		await crawler.run(); // 🟢 no array — it reads from the queue

		return new Response(JSON.stringify(scrapedData), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ error: 'Scraping failed', details: err.message }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
}
