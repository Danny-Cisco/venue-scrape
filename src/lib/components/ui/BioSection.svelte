<script>
	export let bio;
	let processedBio;

	// Regular expression to match Instagram usernames (starts with @, followed by letters, numbers, periods, or underscores)
	const instagramRegex = /@([a-zA-Z0-9_]+[a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)*)(?:[,.]?)/g;
	// Function to process the bio and convert @usernames to anchor tags
	function processBio(bio) {
		if (!bio) return '';
		return bio.replace(
			instagramRegex,
			'<a href="https://www.instagram.com/$1" target="_blank" rel="noopener noreferrer" class="px-[2px] font-semibold text-purple-600 hover:underline hover:text-pink-500 ">@$1</a>'
		);
	}

	// Update processedBio whenever bioObj.bio changes
	$: processedBio = processBio(bio);
</script>

<!-- Render the processed bio with HTML -->
<div class=" bio">{@html processedBio}</div>
