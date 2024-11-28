<script>
	import { SupabaseDetails } from '$lib/components/supabase';
	export let record;
</script>

{#if record}
	<ul class="space-y-4">
		<li class="rounded bg-gray-100 p-4">
			<h3 class="text-lg font-bold">{record.short || 'Untitled'}</h3>
			<p class="mt-1 text-sm text-gray-600">
				{record.summary || 'No summary available'}
			</p>

			<SupabaseDetails {record} />
		</li>
	</ul>
{/if}
