<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { socialIcons } from '$lib/utils/icons.js';

	export let url;

	let isLinktree = false;
	let loading = false;
	let error = null;
	let links = [];

	function getIcon(link) {
		for (const icon of socialIcons) {
			if (icon.match.some((substr) => link.includes(substr))) {
				return icon;
			}
		}
		return null;
	}

	function getDomain(link) {
		try {
			const { hostname } = new URL(link);
			return hostname.replace(/^www\./, '').toLowerCase();
		} catch {
			return null;
		}
	}

	onMount(async () => {
		isLinktree = /^https?:\/\/(www\.)?linktr\.ee\/.+$/i.test(url);

		if (!isLinktree) return;

		loading = true;
		try {
			const [sameAsRes, allLinksRes] = await Promise.all([
				fetch(`/api/cheerio/linktree-links?url=${encodeURIComponent(url)}`),
				fetch(`/api/cheerio/linktree-links-all?url=${encodeURIComponent(url)}`)
			]);

			if (!sameAsRes.ok || !allLinksRes.ok) {
				throw new Error('One or both endpoints failed');
			}

			const sameAsData = await sameAsRes.json();
			const allLinksData = await allLinksRes.json();
			console.log('🚀 ~ onMount ~ allLinksData:', allLinksData);

			const sameAsLinks = Array.isArray(sameAsData.links) ? sameAsData.links : [];
			const allLinks = Array.isArray(allLinksData.links) ? allLinksData.links : [];

			// Create a Map to track one link per domain
			const linkMap = new Map();

			// First pass: add from sameAsLinks
			for (const link of sameAsLinks) {
				const domain = getDomain(link);
				if (domain && !linkMap.has(domain)) {
					linkMap.set(domain, link);
				}
			}

			// Second pass: fill in from allLinks if domain not already used
			for (const link of allLinks) {
				const domain = getDomain(link);
				if (domain && !linkMap.has(domain)) {
					linkMap.set(domain, link);
				}
			}

			// Final list
			links = Array.from(linkMap.values());
		} catch (err) {
			error = err.message;
			console.error('Linktree scrape error:', err);
		} finally {
			loading = false;
		}
	});

	const fallbackIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z"></path></svg>`;
</script>

{#if !isLinktree}
	<!-- Default fallback link -->
	<a
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		title={new URL(url).hostname}
		class="w-6 h-6 text-purple-500 rounded-full btn-hover hover:cursor-pointer hover:text-pink-500"
	>
		{@html fallbackIcon}
	</a>
{:else if loading}
	<div class="text-xs text-gray-400">Loading links…</div>
{:else if error}
	<div class="text-xs text-red-500">Error: {error}</div>
{/if}
<!-- note: for FLY animation, it is important to render an empty list first, then change its contents -->
<!-- placing this in the ELSE of the LOADING will spawn the container full populated instantly, and will not animate its contents-->
<div class="flex flex-wrap-reverse items-center justify-end gap-2">
	{#each links as link, index}
		<a
			href={link}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center justify-center w-6 h-6 text-purple-500 rounded-full btn-hover hover:cursor-pointer hover:text-pink-500"
			title={getIcon(link)?.label || new URL(link).hostname}
			in:fly={{ x: 100, delay: index * 50 }}
		>
			{@html getIcon(link)?.svg || fallbackIcon}
		</a>
	{/each}
</div>

<style>
	.btn-hover {
		transition: transform 250ms;
	}

	.btn-hover:hover {
		transform: translateY(-2px);
	}
</style>
