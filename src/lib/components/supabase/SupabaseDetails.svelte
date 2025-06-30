<script>
	export let record;

	// Create a copy of the record object without the embeddings field
	let displayRecord = { ...record };
	delete displayRecord.embeddings;
</script>

<details class="mt-2">
	<summary class="cursor-pointer text-purple-600">View full record</summary>
	<pre class="mt-2 overflow-x-auto rounded bg-gray-200 p-2 text-sm">
    {JSON.stringify(displayRecord, null, 2)}
  </pre>
</details>
