<script>
	import { isRecording, start, stop } from '$lib/stores/isRecordingStore.js';

	let buttonText = 'Listen';

	$: $isRecording;

	$: if ($isRecording) {
		buttonText = 'Stop';
	} else buttonText = 'Listen';
</script>

<div class="button-wrapper">
	<div class="rotating-border" class:recording={$isRecording}>
		<div class="rotating-gradient" class:recording={$isRecording}></div>
	</div>
	<div
		class="button-content"
		on:click={() => {
			if ($isRecording) {
				$isRecording = false;
				$start = false;
				$stop = true;
			} else {
				$isRecording = true;
				$start = true;
				$stop = false;
			}
		}}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="absolute left-4 size-6"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
			/>
		</svg>
		{buttonText}
	</div>
</div>

<style>
	.button-wrapper {
		width: 180px;
		height: 74px;
		margin: 0 auto 1.5rem;
		position: relative;
	}

	.rotating-border {
		position: absolute;
		inset: -3px;
		border-radius: 24px;
		overflow: hidden;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.rotating-border.recording {
		opacity: 1;
	}

	.rotating-gradient {
		position: absolute;
		inset: -100%;
		background: conic-gradient(
			from 0deg,
			#ff0000,
			#ff8800,
			#ffff00,
			#88ff00,
			#00ff00,
			#00ff88,
			#00ffff,
			#0088ff,
			#0000ff,
			#8800ff,
			#ff00ff,
			#ff0088,
			#ff0000
		);
	}

	.rotating-gradient.recording {
		animation: rotate 4s linear infinite;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.button-content {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		background: white;
		height: 100%;
		width: 100%;
		border-radius: 22px;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 3px solid #eee;
	}

	/* .button-content:hover {
		transform: translateY(-2px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	} */
</style>
