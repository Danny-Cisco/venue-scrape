<script>
	import IconPlusFollowers from './IconPlusFollowers.svelte';
	import IconPlusPosts from './IconPlusPosts.svelte';
	export let bandObject;
</script>

<!-- Instagram Info Section -->
<div class="mt-1 mb-1 text-sm font-bold text-gray-800 font-round">
	{#if bandObject.instagram}
		<div class="flex gap-3">
			{#if bandObject.instagram.followersCount}
				<IconPlusFollowers count={bandObject.instagram.followersCount} />
			{/if}
			{#if bandObject.instagram.postsCount}
				<IconPlusPosts count={bandObject.instagram.postsCount} />
			{/if}
		</div>
	{/if}

	<div class="flex-1"></div>
</div>
