{#if showGigModal && lastClicked}
	<div
		class="fixed inset-0 top-[100px] flex flex-col items-center justify-center bg-black/80"
		transition:fade={{ duration: 100 }}
	>
		<div class="relative h-full">
			<GigCard gig={lastClicked} />
			<div
				class="absolute top-0 bg-purple-500 rounded-full size-8 center hover:bg-pink-500 -right-10"
				on:click={() => {
					showGigModal = false;
					lastClicked = null;
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				</svg>
			</div>
		</div>
	</div>
{/if}
