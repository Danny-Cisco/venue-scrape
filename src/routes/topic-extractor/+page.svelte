<script>
	import DualRecorder from '$lib/components/audio/DualRecorder.svelte';
	let length = 12;
	let overlap = 2;
	let key = 1; // for re rendereing

	function forceUpdate() {
		key += 1;
	}
</script>

<div class="space-y-4">
	<h1 class="mb-4 text-2xl font-bold">Topic Extractor</h1>
	<div class="flex w-full gap-4">
		<div class="flex-1">
			<label for="length-input" class="block mb-1">Chunk (Seconds)</label>
			<input
				bind:value={length}
				type="number"
				id="length-input"
				min="1"
				on:input={forceUpdate}
				class="w-full p-1 border rounded"
			/>
		</div>

		<div class="flex-1">
			<label for="overlap-input" class="block mb-1">Overlap (Seconds)</label>
			<input
				bind:value={overlap}
				type="number"
				id="overlap-input"
				min="0"
				max={length - 1}
				on:input={forceUpdate}
				class="w-full p-1 border rounded"
			/>
		</div>
	</div>
	<div class="w-full">
		{#key key}
			<DualRecorder recordChunk={length} recordOverlap={overlap} />
		{/key}
	</div>
</div>
