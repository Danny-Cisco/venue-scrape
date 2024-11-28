<script>
	export let isLoading;
	export let labelA = 'Submit';
	export let labelB = 'Loading..';
</script>

<!-- NOTE: 'on:click' is shorthand for forwarding the click event -->
<button
	on:click
	class="w-full max-w-[100px] rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
	disabled={isLoading}
>
	{isLoading ? labelB : labelA}
</button>
