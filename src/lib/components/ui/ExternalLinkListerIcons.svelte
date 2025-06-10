<script>
	import { onMount } from 'svelte';
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

	onMount(async () => {
		isLinktree = /^https?:\/\/(www\.)?linktr\.ee\/.+$/i.test(url);

		if (isLinktree) {
			loading = true;
			try {
				const res = await fetch(`/api/cheerio/linktree-links?url=${encodeURIComponent(url)}`);
				if (!res.ok) throw new Error(`Status ${res.status}`);
				const data = await res.json();
				if (Array.isArray(data.links)) links = data.links;
				else throw new Error('No links found');
			} catch (err) {
				error = err.message;
			} finally {
				loading = false;
			}
		}
	});
</script>

{#if !isLinktree}
	<!-- Default fallback link -->
	<a
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		class="text-xs text-green-600 hover:text-green-700"
	>
		Visit External Link
	</a>
{:else if loading}
	<div class="text-xs text-gray-400">Loading links…</div>
{:else if error}
	<div class="text-xs text-red-500">Error: {error}</div>
{:else}
	<div class="flex flex-wrap-reverse justify-end gap-2">
		{#each links as link}
			<a
				href={link}
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center justify-center w-6 h-6 text-purple-500 rounded-full hover:cursor-pointer hover:text-pink-500"
				title={getIcon(link)?.label || new URL(link).hostname}
			>
				{@html getIcon(link)?.svg || '🔗'}
			</a>
		{/each}
	</div>
{/if}
