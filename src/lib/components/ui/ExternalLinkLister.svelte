<script>
	import { onMount } from 'svelte';
	export let url;

	let isLinktree = false;
	let loading = false;
	let error = null;
	let links = [];

	onMount(async () => {
		isLinktree = /^https?:\/\/(www\.)?linktr\.ee\/.+$/i.test(url);

		if (isLinktree) {
			loading = true;
			try {
				const res = await fetch(`/api/cheerio/linktree-links?url=${encodeURIComponent(url)}`);
				if (!res.ok) throw new Error(`Status ${res.status}`);
				const data = await res.json();

				if (Array.isArray(data.links)) {
					links = data.links;
				} else {
					throw new Error('No links found');
				}
			} catch (err) {
				error = err.message;
			} finally {
				loading = false;
			}
		}
	});
</script>

{#if !isLinktree}
	<!-- Render plain link if not Linktree -->
	<div>
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center text-xs text-green-600 row hover:text-green-700"
			on:click|stopPropagation
		>
			Visit Link
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="ml-1 size-4"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
				/>
			</svg>
		</a>
	</div>
{:else if loading}
	<div class="text-xs text-gray-400">Loading social links...</div>
{:else if error}
	<div class="text-xs text-red-500">Failed to load: {error}</div>
{:else}
	<div class="flex flex-col items-end gap-1">
		{#each links as link}
			<a
				href={link}
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center text-xs text-green-600 hover:text-green-700"
				on:click|stopPropagation
			>
				{new URL(link).hostname.replace('www.', '')}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="ml-1 size-4"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
					/>
				</svg>
			</a>
		{/each}
	</div>
{/if}
