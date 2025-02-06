<script>
	import { fade } from 'svelte/transition';
	import { supabaseGetOneLens } from '$lib/supabase/supabaseHelpers.js';
	import { onMount, onDestroy } from 'svelte';
	import { SupabaseError } from '$lib/components/supabase';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	export let availableLenses = [];
	export let instanceId;
	export let onClose;

	let isLoading = false;
	let secretKey = '';
	let markdown = '';
	let intervalId;
	const halfScreenHeight = window.innerHeight / 2;
	const halfScreenWidth = window.innerWidth / 2;

	let position = { x: halfScreenWidth + instanceId * 30, y: halfScreenHeight + instanceId * 30 };
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };
	let result = { record: null, error: null };

	function handleMouseDown(event) {
		isDragging = false;
		isDragging = true;
		const rect = event.currentTarget.getBoundingClientRect();
		dragOffset = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	function handleMouseMove(event) {
		if (!isDragging) return;
		position = {
			x: event.clientX - dragOffset.x,
			y: event.clientY - dragOffset.y
		};
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleLensSelect(event) {
		secretKey = event.target.value;
	}

	async function fetchRecord() {
		if (!secretKey) {
			result = { record: null, error: 'Please select a lens to view.' };
			return;
		}
		isLoading = true;
		result = await supabaseGetOneLens(secretKey);
		isLoading = false;
	}

	$: error = result.error;
	$: record = result.record;
	$: markdown = record?.record.content;
	$: htmlContent = markdown ? DOMPurify.sanitize(marked(markdown)) : '';

	$: {
		if (secretKey) {
			clearInterval(intervalId);
			intervalId = setInterval(fetchRecord, 1000);
		} else {
			clearInterval(intervalId);
		}
	}

	onMount(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
	});

	onDestroy(() => {
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
		clearInterval(intervalId);
	});
</script>

<div
	class="fixed max-w-2xl p-4 space-y-4 bg-white rounded-lg shadow-lg"
	style="left: {position.x}px; top: {position.y}px;"
	on:mousedown={handleMouseDown}
	in:fade
>
	<div class="flex items-center justify-between">
		<div class="flex flex-col items-center justify-center mr-2 hover:cursor-grab w-14 h-14">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
				><path
					d="M12 22L8 18H16L12 22ZM12 2L16 6H8L12 2ZM12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14ZM2 12L6 8V16L2 12ZM22 12L18 16V8L22 12Z"
				></path></svg
			>
		</div>
		<select
			class="w-full p-2 mr-2 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			on:change={handleLensSelect}
			value={secretKey}
		>
			<option value="">Select a lens to view...</option>
			{#each availableLenses as lens}
				<option value={lens.key}>{lens.lens_name || 'Unnamed Lens'}</option>
			{/each}
		</select>
		<button
			class="p-2 text-gray-500 rounded-full hover:text-gray-700"
			on:click={() => onClose(instanceId)}
		>
			×
		</button>
	</div>

	{#if htmlContent}
		<div class="p-4 prose bg-white shadow-md max-w-none rounded-xl" transition:fade>
			{@html htmlContent}
		</div>
	{/if}
	<SupabaseError {error} />
</div>

<style>
	div {
		user-select: none;
		touch-action: none;
		z-index: 1000;
	}
</style>
