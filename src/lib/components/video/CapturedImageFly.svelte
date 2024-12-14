<script>
	import { capturedImage } from '$lib/stores/capturedImage.js';
	import { fly } from 'svelte/transition';
</script>

<!-- Display Captured Image -->
{#if $capturedImage}
	<div
		in:fly={{ y: -200, duration: 500 }}
		class="w-full max-w-[250px] h-[144px] absolute inset-0 border-0 border-[magenta] rounded-lg shadow-lg"
	>
		<img src={$capturedImage} alt="Captured Frame" class="max-w-full border rounded-lg shadow-md" />
	</div>
{/if}
