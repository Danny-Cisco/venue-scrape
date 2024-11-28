<script>
	export let error;
</script>

{#if error}
	<p class="mb-4 text-red-500">{error}</p>
{/if}
