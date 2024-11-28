<script>
	export let label;
	export let value;
</script>

<div>
	<h2>{label}</h2>
	<input type="number" bind:value placeholder={label} />
</div>
