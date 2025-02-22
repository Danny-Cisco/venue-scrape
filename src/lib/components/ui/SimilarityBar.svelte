<script>
	export let similarity = 0;

	let percentage = 0;

	// Update values
	async function updateValues() {
		const newPercentage = Math.round(similarity * 100);
		percentage = newPercentage;
	}

	// Trigger update when similarity changes
	$: if (similarity !== undefined) {
		updateValues();
	}
</script>

<div class="flex items-center gap-2 isolate">
	<div class="w-20 h-2 overflow-hidden z-[1] rounded-full bg-gray-100">
		{#if percentage < 30}
			<div
				class="bg-green-500 opacity-30 h-full transition-all z-[2] duration-300"
				style="width: {percentage}%"
			/>
		{:else if percentage >= 50}
			<div
				class="bg-green-500 h-full transition-all z-[2] duration-300"
				style="width: {percentage}%"
			/>
		{:else}
			<div
				class="bg-green-500 opacity-70 h-full transition-all z-[2] duration-300"
				style="width: {percentage}%"
			/>
		{/if}
	</div>
</div>
