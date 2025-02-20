<script>
	import { createEventDispatcher } from 'svelte';

	export let isRecording = false;

	let dispatch = createEventDispatcher();
</script>

{#if !isRecording}
	<button
		on:click={() => dispatch('start')}
		class="relative w-full mx-auto font-bold text-black/50 rounded-3xl hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
			<defs>
				<path
					id="wave1"
					d="M0,160 C180,100 360,220 540,160 C720,100 900,220 1080,160 C1260,100 1440,220 1620,160"
				>
					<animate
						attributeName="d"
						dur="7.3s"
						repeatCount="indefinite"
						values="
          M0,160 C180,100 360,220 540,160 C720,100 900,220 1080,160 C1260,100 1440,220 1620,160;
          M0,160 C180,220 360,100 540,160 C720,220 900,100 1080,160 C1260,220 1440,100 1620,160;
          M0,160 C180,100 360,220 540,160 C720,100 900,220 1080,160 C1260,100 1440,220 1620,160"
					/>
				</path>

				<path
					id="wave2"
					d="M-120,160 C120,60 360,260 600,160 C840,60 1080,260 1320,160 C1560,60 1800,260 2040,160"
				>
					<animate
						attributeName="d"
						dur="8.7s"
						repeatCount="indefinite"
						values="
          M-120,160 C120,60 360,260 600,160 C840,60 1080,260 1320,160 C1560,60 1800,260 2040,160;
          M-120,160 C120,260 360,60 600,160 C840,260 1080,60 1320,160 C1560,260 1800,60 2040,160;
          M-120,160 C120,60 360,260 600,160 C840,60 1080,260 1320,160 C1560,60 1800,260 2040,160"
					/>
				</path>

				<path
					id="wave3"
					d="M-240,160 C60,140 360,180 660,160 C960,140 1260,180 1560,160 C1860,140 2160,180 2460,160"
				>
					<animate
						attributeName="d"
						dur="11.5s"
						repeatCount="indefinite"
						values="
          M-240,160 C60,140 360,180 660,160 C960,140 1260,180 1560,160 C1860,140 2160,180 2460,160;
          M-240,160 C60,180 360,140 660,160 C960,180 1260,140 1560,160 C1860,180 2160,140 2460,160;
          M-240,160 C60,140 360,180 660,160 C960,140 1260,180 1560,160 C1860,140 2160,180 2460,160"
					/>
				</path>
			</defs>

			<use href="#wave1" stroke="#4287f5" fill="none" stroke-width="2" />
			<use href="#wave2" stroke="#4287f5" fill="none" stroke-width="2" opacity="0.7" />
			<use href="#wave3" stroke="#4287f5" fill="none" stroke-width="2" opacity="0.5" />
		</svg>
		<div
			class="absolute top-0 left-0 right-0 font-light flex bg-white w-[200px] mx-auto hover:shadow-md hover:mt-[-1px] text-black/50 font-mono my-auto h-[60px] flex-col items-center justify-center rounded-full btn"
		>
			LISTEN
		</div>
	</button>
{:else}
	<button
		on:click={() => dispatch('stop')}
		class="relative w-full mx-auto font-bold text-black/50 rounded-3xl hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
		><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
			<defs>
				<path
					id="wave1"
					d="M0,160 C180,40 360,280 540,160 C720,40 900,280 1080,160 C1260,40 1440,280 1620,160"
				>
					<animate
						attributeName="d"
						dur="3.1s"
						repeatCount="indefinite"
						values="
          M0,160 C180,40 360,280 540,160 C720,40 900,280 1080,160 C1260,40 1440,280 1620,160;
          M0,160 C180,280 360,40 540,160 C720,280 900,40 1080,160 C1260,280 1440,40 1620,160;
          M0,160 C180,40 360,280 540,160 C720,40 900,280 1080,160 C1260,40 1440,280 1620,160"
					/>
				</path>

				<path
					id="wave2"
					d="M-120,160 C120,20 360,300 600,160 C840,20 1080,300 1320,160 C1560,20 1800,300 2040,160"
				>
					<animate
						attributeName="d"
						dur="2.7s"
						repeatCount="indefinite"
						values="
          M-120,160 C120,20 360,300 600,160 C840,20 1080,300 1320,160 C1560,20 1800,300 2040,160;
          M-120,160 C120,300 360,20 600,160 C840,300 1080,20 1320,160 C1560,300 1800,20 2040,160;
          M-120,160 C120,20 360,300 600,160 C840,20 1080,300 1320,160 C1560,20 1800,300 2040,160"
					/>
				</path>

				<path
					id="wave3"
					d="M-240,160 C60,60 360,260 660,160 C960,60 1260,260 1560,160 C1860,60 2160,260 2460,160"
				>
					<animate
						attributeName="d"
						dur="3.9s"
						repeatCount="indefinite"
						values="
          M-240,160 C60,60 360,260 660,160 C960,60 1260,260 1560,160 C1860,60 2160,260 2460,160;
          M-240,160 C60,260 360,60 660,160 C960,260 1260,60 1560,160 C1860,260 2160,60 2460,160;
          M-240,160 C60,60 360,260 660,160 C960,60 1260,260 1560,160 C1860,60 2160,260 2460,160"
					/>
				</path>
			</defs>

			<use href="#wave1" stroke="#4287f5" fill="none" stroke-width="2" />
			<use href="#wave2" stroke="#4287f5" fill="none" stroke-width="2" opacity="0.7" />
			<use href="#wave3" stroke="#4287f5" fill="none" stroke-width="2" opacity="0.5" />
		</svg>
		<div
			class="absolute inset-0 flex bg-white w-[200px] mx-auto hover:bg-gray-500 my-auto h-[60px] flex-col hover:text-white items-center justify-center rounded-full btn"
		>
			STOP
		</div>
	</button>
{/if}
