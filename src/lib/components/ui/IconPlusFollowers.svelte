<script>
	export let count = 0;
</script>

<div class="justify-start text-sm row">
	<div class="center">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			class="w-4 h-4 -ml-[2px] -mr-2"
			><path
				d="M20 22H4V20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V22ZM12 13C8.68629 13 6 10.3137 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7C18 10.3137 15.3137 13 12 13Z"
			></path></svg
		>
	</div>

	<div>
		{#if count >= 1000}
			{(count / 1000).toFixed(1)}<span class="pl-[1px]">k</span>
		{:else}
			{count}
		{/if}
	</div>
</div>
