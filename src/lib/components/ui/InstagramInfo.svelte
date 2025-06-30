<script>
	export let bandObject;
</script>

<!-- Instagram Info Section -->
<div class="font-ibmPlexMono">
	{#if bandObject.instagram}
		<div class="grid items-end gap-2 text-xs text-black grid-cols-[auto_1fr]">
			<div>
				{#if bandObject.instagram.followersCount}
					<div class="justify-start h-4 row">
						{(bandObject.instagram.followersCount / 1000).toFixed(1)}k
					</div>
				{/if}
				{#if bandObject.instagram.postsCount}
					<div class="justify-start h-4 row">
						{bandObject.instagram.postsCount}
					</div>
				{/if}
			</div>
			<div class="text-start">
				<div class="h-4 row">Followers</div>
				<div class="h-4 row">Posts</div>
			</div>
		</div>
	{/if}

	<div class="flex-1"></div>
</div>
