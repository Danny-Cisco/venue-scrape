<script>
	import { onMount } from 'svelte';
	import DraggableLensViewer from '$lib/components/outputs/draggableLensViewer.svelte';

	let availableLenses = [];
	let instances = [];
	let nextInstanceId = 0;

	onMount(async () => {
		await fetchLenses();
	});

	async function fetchLenses() {
		try {
			const response = await fetch('/api/supabase/get-all?table=lenses');
			if (!response.ok) {
				throw new Error('Failed to fetch lenses');
			}
			const data = await response.json();
			availableLenses = data.records || [];
		} catch (err) {
			console.error('Error fetching lenses:', err);
		}
	}

	function addNewInstance() {
		instances = [...instances, nextInstanceId];
		nextInstanceId++;
	}

	function removeInstance(id) {
		instances = instances.filter((instanceId) => instanceId !== id);
	}
</script>

<div class="fixed bottom-4 right-4">
	<button
		class="px-4 py-2 text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600"
		on:click={addNewInstance}
	>
		Add Lens Viewer
	</button>
</div>

{#each instances as instanceId (instanceId)}
	<DraggableLensViewer {instanceId} {availableLenses} onClose={removeInstance} />
{/each}
