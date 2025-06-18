<script>
	export let text = 'Loading...';
	export let large = false;
</script>

{#if large}
	<div class="relative font-sans text-xl font-thin text-gray-400 verflow-hidden">
		<span
			class="wave-mask bg-gradient-to-r from-gray-500 via-white to-gray-500 bg-[length:200%_100%] bg-clip-text text-transparent"
		>
			{text}
		</span>
	</div>
{:else}
	<div class="relative text-sm text-gray-400 font-body verflow-hidden">
		<span
			class="wave-mask bg-gradient-to-r from-gray-500 via-white to-gray-500 bg-[length:200%_100%] bg-clip-text text-transparent"
		>
			{text}
		</span>
	</div>
{/if}

<style>
	.wave-mask {
		animation: waveMove 3.5s linear infinite;
	}

	@keyframes waveMove {
		0% {
			background-position: 300% 0;
		}
		100% {
			background-position: -300% 0;
		}
	}
</style>
