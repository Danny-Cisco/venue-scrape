<script>
	export let surprise = 0;

	let percentage = 0;

	// Update values
	async function updateValues() {
		const newPercentage = Math.round(surprise * 100);
		percentage = newPercentage;
	}

	// Trigger update when surprise changes
	$: if (surprise !== undefined) {
		updateValues();
	}
</script>

<div class="flex items-center gap-2 isolate">
	<div class="w-2 h-20 overflow-hidden z-[1] flex flex-col-reverse h-full rounded-full bg-gray-100">
		{#if percentage < 20}
			<div
				class="bg-purple-500 opacity-30 h-full transition-all z-[2] duration-300"
				style="height: {percentage}%"
			/>
		{:else if percentage >= 40}
			<div
				class="bg-purple-500 h-full transition-all z-[2] duration-300"
				style="height: {percentage}%"
			/>
		{:else}
			<div
				class="bg-purple-500 opacity-60 h-full transition-all z-[2] duration-300"
				style="height: {percentage}%"
			/>
		{/if}
	</div>
</div>
