<script lang="ts">
	import { fade } from 'svelte/transition';

	let html = '';
	type Event = {
		tags: string[];
		name: string;
		details: string;
		description: string;
		presentedBy: string;
		tickets: string;
		soldOut: boolean;
	};
	let event: Event = {
		tags: [],
		name: '',
		details: '',
		description: '',
		presentedBy: '',
		tickets: '',
		soldOut: false
	};

	let placeholder = 'https://thetotehotel.com/gig-guide/';
	let url = '';

	async function scrapeSite() {
		try {
			if (!url) {
				url = placeholder;
			}
			const res = await fetch(`/api/scrape-html?target=${url}`);
			const data = await res.json();
			html = data.html;

			// Create a temporary DOM element to parse the HTML
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			// Get all event tags
			const tagElements = doc.getElementsByClassName('event-tag');
			const tags = Array.from(tagElements)
				.map((element) => element.textContent || '')
				.filter((text) => text !== '');

			// Check if sold out
			function soldOutCheck() {
				const tickets = doc.querySelector('.tickets-container')?.textContent?.trim();
				if (tickets.includes('Join for Updates')) {
					return true;
				} else return false;
			}

			// Get other event information
			event = {
				tags,
				name: doc.querySelector('.event-name')?.textContent?.trim() || '',
				details: doc.querySelector('.event-details')?.textContent?.trim() || '',
				description: doc.querySelector('.event-description')?.textContent?.trim() || '',
				presentedBy: doc.querySelector('.presented-by')?.textContent?.trim() || '',
				tickets: doc.querySelector('.tickets-container')?.textContent?.trim() || '',
				soldOut: soldOutCheck()
			};
		} catch (error) {
			console.error('Error scraping site:', error);
			event = {
				tags: [],
				name: '',
				details: '',
				description: '',
				presentedBy: '',
				soldOut: false
			};
		}
	}
</script>

<div class="pt-10 space-y-4 page" in:fade>
	<h1 class="text-3xl">Scrape Event</h1>

	<input type="text" class="w-full p-2 border rounded" {placeholder} bind:value={url} />

	<button
		on:click={scrapeSite}
		class="px-4 py-2 text-white bg-blue-500 rounded btn hover:bg-blue-600"
	>
		Scrape Event
	</button>

	{#if event.name || event.tags.length > 0}
		<div class="mt-4">
			<div class="p-4 border rounded shadow-sm">
				<div class="flex items-center justify-between mb-2">
					<div class="row">
						{#each event.tags as tag}
							<span class="px-2 py-1 text-sm bg-blue-500 rounded-full center">{tag}</span>
						{/each}
					</div>
					{#if event.soldOut}
						<span class="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-full center"
							>Sold Out</span
						>
					{/if}
				</div>
				<h3 class="mb-2 text-xl font-bold">{event.name}</h3>
				<div class="mb-2">{event.details}</div>
				<p class="mb-2">{event.description}</p>
				{#if event.presentedBy}
					<div class="text-sm italic">Presented by {event.presentedBy}</div>
				{/if}

				<h2>TICKETS</h2>
				<p>{event.tickets}</p>
			</div>
		</div>
	{:else if html}
		<p>No event information found in the scraped content</p>
	{/if}
</div>
