<script>
	export let src;
	export let alt = '';
	export let maxRetries = 3;
	export let fallback = '';
	// export let fallback = '/fallback-avatar.png';

	let currentSrc = '';
	let retries = 0;

	function buildSrc() {
		// Cache-busting with timestamp
		return `${src}&t=${Date.now()}`;
	}

	$: currentSrc = buildSrc();

	function handleError() {
		if (retries < maxRetries) {
			retries += 1;
			currentSrc = buildSrc();
		} else {
			currentSrc = fallback;
		}
	}
</script>

<img
	src={currentSrc}
	{alt}
	loading="lazy"
	class="object-cover w-full h-full"
	on:error={handleError}
/>
