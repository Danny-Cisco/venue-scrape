import { json } from '@sveltejs/kit';
import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';

// Helper: check if a date is in the future
function isUpcoming(dateStr) {
	const now = new Date();
	const date = new Date(dateStr);
	return !isNaN(date) && date > now;
}

// Scrape one Eventbrite URL and return only upcoming event URLs
async function scrapeEventUrls(inputUrl) {
	const results = [];

	const requestQueue = await RequestQueue.open();
	await requestQueue.addRequest({ url: inputUrl, uniqueKey: `${inputUrl}#${uuidv4()}` });

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			$('script[type="application/ld+json"]').each((_, el) => {
				try {
					const data = JSON.parse($(el).html().trim());

					function walk(node) {
						if (!node) return;
						if (Array.isArray(node)) return node.forEach(walk);
						if (typeof node === 'object') {
							if (node['@type'] === 'Event' && node.url) {
								if (isUpcoming(node.endDate)) {
									results.push(node.url);
								}
							}
							for (const key in node) walk(node[key]);
						}
					}

					walk(data);
				} catch (e) {
					console.warn(`⚠️ Failed to parse LD+JSON: ${e.message}`);
				}
			});
		}
	});

	await crawler.run();
	return results;
}

// Send upcoming Eventbrite URLs to JSON handler
async function fetchGigObjectsFromEventbrite(fetchFn, urls) {
	const res = await fetchFn('/api/cheerio/eventbrite-json', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ urls })
	});
	return await res.json();
}

// === GET /api/cheerio/eventbrite?url=... ===
export async function GET({ url, fetch }) {
	const inputUrl = url.searchParams.get('url');
	if (!inputUrl) {
		return json({ error: 'Missing ?url= parameter' }, { status: 400 });
	}

	try {
		const upcomingUrls = await scrapeEventUrls(inputUrl);
		const gigs = await fetchGigObjectsFromEventbrite(fetch, upcomingUrls);
		return json({ gigs });
	} catch (err) {
		console.error('❌ GET scraping error:', err.message);
		return json({ error: 'Scraping failed', details: err.message }, { status: 500 });
	}
}

// === POST /api/cheerio/eventbrite ===
// Body: { "urls": [ ... ] }
export async function POST({ request, fetch }) {
	const { urls } = await request.json();
	if (!Array.isArray(urls) || urls.length === 0) {
		return json({ error: 'POST body must include non-empty `urls` array' }, { status: 400 });
	}

	const allUpcomingUrls = new Set();

	for (const inputUrl of urls) {
		try {
			const upcoming = await scrapeEventUrls(inputUrl);
			upcoming.forEach((url) => allUpcomingUrls.add(url));
		} catch (err) {
			console.error(`❌ Failed to scrape ${inputUrl}: ${err.message}`);
		}
	}

	const gigs = await fetchGigObjectsFromEventbrite(fetch, [...allUpcomingUrls]);

	return json({ gigs });
}

// EXAMPLE OUTPUT
// fails for events with multiple dates
// {
// 	"gigs": [
// 	  {
// 		"url": "https://www.eventbrite.com.au/e/pumpys-pub-quiz-every-monday-and-tuesday-tickets-430652171237",
// 		"gig": {
// 		  "title": "",
// 		  "description": "",
// 		  "startDate": "",
// 		  "venue": "",
// 		  "address": "",
// 		  "suburb": "",
// 		  "latlong": "",
// 		  "image": "",
// 		  "ticketUrl": "",
// 		  "tickets": [],
// 		  "tags": []
// 		}
// 	  },
// 	  {
// 		"url": "https://www.eventbrite.com.au/e/hot-tubs-bingo-machine-tickets-1042650705327",
// 		"gig": {
// 		  "title": "",
// 		  "description": "",
// 		  "startDate": "",
// 		  "venue": "",
// 		  "address": "",
// 		  "suburb": "",
// 		  "latlong": "",
// 		  "image": "",
// 		  "ticketUrl": "",
// 		  "tickets": [],
// 		  "tags": []
// 		}
// 	  },
// 	  {
// 		"url": "https://www.eventbrite.com.au/e/zero-city-at-the-retreat-hotel-w-banksia-kates-company-tickets-1377103165639",
// 		"gig": {
// 		  "title": "Zero City at The Retreat Hotel w/ Banksia + Kate’s Company",
// 		  "description": "Contort yourself to the overwhelming grooves of Zero City at the Retreat Hotel Brunswick.",
// 		  "startDate": "2025-06-20T19:00:00+10:00",
// 		  "venue": "280 Sydney Rd",
// 		  "address": "280 Sydney Road, Brunswick, VIC 3056",
// 		  "suburb": "Brunswick",
// 		  "latlong": "",
// 		  "image": "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1037411723%2F269393680231%2F1%2Foriginal.20250523-073948?w=1000&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C1328%2C7952%2C3976&s=4c16257e08c09b402390a29c00690ad9",
// 		  "ticketUrl": "https://www.eventbrite.com.au/e/zero-city-at-the-retreat-hotel-w-banksia-kates-company-tickets-1377103165639",
// 		  "tickets": [
// 			{
// 			  "ticketType": "General Admission",
// 			  "price": 12.25,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			}
// 		  ],
// 		  "tags": []
// 		}
// 	  },
// 	  {
// 		"url": "https://www.eventbrite.com.au/e/michaels-cane-at-the-retreat-with-ere-lo-and-aeriquah-tickets-1375362820219",
// 		"gig": {
// 		  "title": "",
// 		  "description": "",
// 		  "startDate": "",
// 		  "venue": "",
// 		  "address": "",
// 		  "suburb": "",
// 		  "latlong": "",
// 		  "image": "",
// 		  "ticketUrl": "",
// 		  "tickets": [],
// 		  "tags": []
// 		}
// 	  },
// 	  {
// 		"url": "https://www.eventbrite.com.au/e/flower-extract-trying-single-launch-tickets-1354352407509",
// 		"gig": {
// 		  "title": "Flower Extract “Trying” single launch",
// 		  "description": "Flower Extract celebrate the release of the Trying, the second single from their upcoming sophomore EP,  at The Retreat Hotel Brunswick.",
// 		  "startDate": "2025-06-27T19:30:00+10:00",
// 		  "venue": "280 Sydney Rd",
// 		  "address": "280 Sydney Road, Brunswick, VIC 3056",
// 		  "suburb": "Brunswick",
// 		  "latlong": "",
// 		  "image": "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1024047663%2F269393680231%2F1%2Foriginal.20250506-042710?w=1000&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C0%2C2160%2C1080&s=ce9f7346e4cb92c6948144adfc73e0b7",
// 		  "ticketUrl": "https://www.eventbrite.com.au/e/flower-extract-trying-single-launch-tickets-1354352407509",
// 		  "tickets": [
// 			{
// 			  "ticketType": "Early Bird",
// 			  "price": 12.25,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			},
// 			{
// 			  "ticketType": "General Admission",
// 			  "price": 15.1,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			}
// 		  ],
// 		  "tags": []
// 		}
// 	  },
// 	  {
// 		"url": "https://www.eventbrite.com.au/e/callum-wylie-at-the-retreat-hotel-brunswick-wnorwood-al-speers-tickets-1374405376479",
// 		"gig": {
// 		  "title": "Callum Wylie at The Retreat Hotel Brunswick w/Norwood & Al Speers",
// 		  "description": "Callum Wylie is back with his first new release in nearly 5 years. To celebrate, he will be launching the new single, \"If I Knew Your Name\"",
// 		  "startDate": "2025-06-29T14:00:00+10:00",
// 		  "venue": "280 Sydney Rd",
// 		  "address": "280 Sydney Road, Brunswick, VIC 3056",
// 		  "suburb": "Brunswick",
// 		  "latlong": "",
// 		  "image": "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1035840393%2F269393680231%2F1%2Foriginal.20250521-133254?w=1000&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C0%2C2160%2C1080&s=a88f3d913ddac4c171a3b2fded175a69",
// 		  "ticketUrl": "https://www.eventbrite.com.au/e/callum-wylie-at-the-retreat-hotel-brunswick-wnorwood-al-speers-tickets-1374405376479",
// 		  "tickets": [
// 			{
// 			  "ticketType": "Early Bird",
// 			  "price": 14.53,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			},
// 			{
// 			  "ticketType": "General Admission",
// 			  "price": 17.95,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			}
// 		  ],
// 		  "tags": []
// 		}
// 	  },
// 	  {
// 		"url": "https://www.eventbrite.com.au/e/mousse-cannon-single-launch-w-lxrp-special-guest-tickets-1398154721409",
// 		"gig": {
// 		  "title": "Mousse Cannon Single Launch w/ LXRP + Special Guest",
// 		  "description": "Disco-gimps Mousse Cannon are launching the 2nd single off their upcoming album",
// 		  "startDate": "2025-07-03T19:00:00+10:00",
// 		  "venue": "280 Sydney Rd",
// 		  "address": "280 Sydney Road, Brunswick, VIC 3056",
// 		  "suburb": "Brunswick",
// 		  "latlong": "",
// 		  "image": "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1046440893%2F269393680231%2F1%2Foriginal.20250605-091534?w=1000&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C810%2C1080%2C540&s=bb3af1c0844a3c4b8bf30da51ac15a8a",
// 		  "ticketUrl": "https://www.eventbrite.com.au/e/mousse-cannon-single-launch-w-lxrp-special-guest-tickets-1398154721409",
// 		  "tickets": [
// 			{
// 			  "ticketType": "Early Bird",
// 			  "price": 12.25,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			},
// 			{
// 			  "ticketType": "General Admission",
// 			  "price": 14.53,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			}
// 		  ],
// 		  "tags": []
// 		}
// 	  },
// 	  {
// 		"url": "https://www.eventbrite.com.au/e/tou-can-at-the-retreat-wsam-darcy-band-and-midnight-violet-tickets-1398048062389",
// 		"gig": {
// 		  "title": "Tou-Can at the Retreat w/Sam Darcy band and Midnight Violet",
// 		  "description": "Tou-Can is throwing down at The Retreat Hotel, and you're invited to a night of raw rhythm",
// 		  "startDate": "2025-07-04T19:30:00+10:00",
// 		  "venue": "280 Sydney Rd",
// 		  "address": "280 Sydney Road, Brunswick, VIC 3056",
// 		  "suburb": "Brunswick",
// 		  "latlong": "",
// 		  "image": "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1046427553%2F269393680231%2F1%2Foriginal.20250605-084703?w=1000&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C110%2C2048%2C1024&s=5a129cb39c69379698221ec4753c6461",
// 		  "ticketUrl": "https://www.eventbrite.com.au/e/tou-can-at-the-retreat-wsam-darcy-band-and-midnight-violet-tickets-1398048062389",
// 		  "tickets": [
// 			{
// 			  "ticketType": "General Admission",
// 			  "price": 12.25,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			}
// 		  ],
// 		  "tags": []
// 		}
// 	  },
// 	  {
// 		"url": "https://www.eventbrite.com.au/e/franjapan-live-at-the-retreat-tickets-1387422210179",
// 		"gig": {
// 		  "title": "Franjapan | Live at The Retreat",
// 		  "description": "Catch Franjapan live at The Retreat Hotel on Saturday, 5 July.",
// 		  "startDate": "2025-07-05T19:30:00+10:00",
// 		  "venue": "280 Sydney Rd",
// 		  "address": "280 Sydney Road, Brunswick, VIC 3056",
// 		  "suburb": "Brunswick",
// 		  "latlong": "",
// 		  "image": "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1043529543%2F269393680231%2F1%2Foriginal.20250602-013315?w=1000&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C0%2C2160%2C1080&s=4409c270490ae5ec92bd87dc87acb3e9",
// 		  "ticketUrl": "https://www.eventbrite.com.au/e/franjapan-live-at-the-retreat-tickets-1387422210179",
// 		  "tickets": [
// 			{
// 			  "ticketType": "Early Bird",
// 			  "price": 15,
// 			  "currency": "AUD",
// 			  "availability": "SoldOut"
// 			},
// 			{
// 			  "ticketType": "General Admission",
// 			  "price": 25.79,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			}
// 		  ],
// 		  "tags": []
// 		}
// 	  },
// 	  {
// 		"url": "https://www.eventbrite.com.au/e/chordie-flow-single-launch-with-the-heights-and-pepper-la-floyd-tickets-1377092935039",
// 		"gig": {
// 		  "title": "Chordie Flow Single Launch with The Heights and Pepper La Floyd",
// 		  "description": "DOUBLE SINGLE LAUNCH! FOR OUR SONGS 'When I'm Drunk' AND 'Heart of a Psycho'.",
// 		  "startDate": "2025-07-06T19:00:00+10:00",
// 		  "venue": "280 Sydney Rd",
// 		  "address": "280 Sydney Road, Brunswick, VIC 3056",
// 		  "suburb": "Brunswick",
// 		  "latlong": "",
// 		  "image": "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1037403923%2F269393680231%2F1%2Foriginal.20250523-071518?w=1000&auto=format%2Ccompress&q=75&sharp=10&rect=313%2C346%2C444%2C222&s=6e4974f67c4951c149034393273df9a0",
// 		  "ticketUrl": "https://www.eventbrite.com.au/e/chordie-flow-single-launch-with-the-heights-and-pepper-la-floyd-tickets-1377092935039",
// 		  "tickets": [
// 			{
// 			  "ticketType": "Early Bird",
// 			  "price": 12.25,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			},
// 			{
// 			  "ticketType": "General Admission",
// 			  "price": 15.68,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			}
// 		  ],
// 		  "tags": []
// 		}
// 	  },
// 	  {
// 		"url": "https://www.eventbrite.com.au/e/badland-caravan-w-astro-elevator-the-pearlies-tickets-1397973168379",
// 		"gig": {
// 		  "title": "Badland Caravan w/ Astro Elevator & The Pearlies",
// 		  "description": "Adelaide Psych-Blues Occultists Badland Caravan return to Melbourne to LAUNCH their newest MUSICAL INCANTATION ‘Are You Formless’!",
// 		  "startDate": "2025-07-12T19:30:00+10:00",
// 		  "venue": "280 Sydney Rd",
// 		  "address": "280 Sydney Road, Brunswick, VIC 3056",
// 		  "suburb": "Brunswick",
// 		  "latlong": "",
// 		  "image": "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1050436693%2F269393680231%2F1%2Foriginal.20250611-032719?w=1000&auto=format%2Ccompress&q=75&sharp=10&rect=1%2C79%2C1262%2C631&s=e9494003df653e4108dc39c5a7d30f76",
// 		  "ticketUrl": "https://www.eventbrite.com.au/e/badland-caravan-w-astro-elevator-the-pearlies-tickets-1397973168379",
// 		  "tickets": [
// 			{
// 			  "ticketType": "Early Bird",
// 			  "price": 12.25,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			},
// 			{
// 			  "ticketType": "General Admission",
// 			  "price": 17.95,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			}
// 		  ],
// 		  "tags": []
// 		}
// 	  },
// 	  {
// 		"url": "https://www.eventbrite.com.au/e/dear-judy-debut-album-launch-at-the-retreat-hotel-tickets-1377105271939",
// 		"gig": {
// 		  "title": "Dear Judy Debut Album Launch at The Retreat Hotel",
// 		  "description": "Dear Judy are launching their self-titled, debut album at the Retreat Hotel, and everybody is invited",
// 		  "startDate": "2025-07-19T19:30:00+10:00",
// 		  "venue": "280 Sydney Rd",
// 		  "address": "280 Sydney Road, Brunswick, VIC 3056",
// 		  "suburb": "Brunswick",
// 		  "latlong": "",
// 		  "image": "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1037417853%2F269393680231%2F1%2Foriginal.20250523-075931?w=1000&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C0%2C2160%2C1080&s=5a1000189037382f23983b0525bfa061",
// 		  "ticketUrl": "https://www.eventbrite.com.au/e/dear-judy-debut-album-launch-at-the-retreat-hotel-tickets-1377105271939",
// 		  "tickets": [
// 			{
// 			  "ticketType": "Early Bird",
// 			  "price": 11,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			},
// 			{
// 			  "ticketType": "General Admission",
// 			  "price": 15.68,
// 			  "currency": "AUD",
// 			  "availability": "InStock"
// 			}
// 		  ],
// 		  "tags": []
// 		}
// 	  }
// 	]
//   }
