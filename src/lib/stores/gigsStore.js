import { writable, derived } from 'svelte/store';

// Assuming this path is correct and it exports an array of strings
// e.g., export const genres = ['Action', 'Adventure', 'Sci-Fi', ...];
import { genres as allPossibleGenres } from '$lib/utils/prompts.ts';

// The writable store for your raw gig data
// Initialize with an empty array or potentially load initial data
// Example structure: { id: number | string, title: string, genres: string[] }
export const gigsStore = writable([]);
export const filteredGigIds = writable([]);

export const gigsStoreFiltered = derived(
	[gigsStore, filteredGigIds],
	([$gigsStore, $filteredGigIds]) => {
		if (!$filteredGigIds || $filteredGigIds.length === 0) {
			// No filter set — return all gigs
			return $gigsStore;
		}
		// Filter based on the list of IDs
		return $gigsStore.filter((gig) => $filteredGigIds.includes(gig.id));
	}
);

// The derived store that transforms the data
export const gigsGenreStore = derived(
	gigsStore, // The store(s) this derived store depends on
	($gigsStore) => {
		// Callback function receives the latest value(s)
		// Initialize the result structure with all genres having empty values arrays
		// Using a Map for efficient lookups by genre name
		const genreMap = new Map();
		allPossibleGenres.forEach((genreName) => {
			genreMap.set(genreName, { name: genreName, values: [] });
		});

		// Iterate through each gig in the gigsStore
		$gigsStore.forEach((gig) => {
			// ---- SAFETY CHECKS ----
			// Ensure the gig object exists
			if (!gig) {
				console.warn('Encountered undefined/null entry in gigsStore');
				return; // Skip this entry
			}
			// Ensure the gig has an ID
			if (gig.id === undefined || gig.id === null) {
				console.warn('Gig object missing required "id" property:', gig);
				return; // Skip this entry
			}
			// Ensure the gig has a genres array
			if (!Array.isArray(gig.genres)) {
				// Allow empty genres array, but log if it's missing or not an array
				if (gig.genres !== undefined) {
					console.warn(`Gig object (id: ${gig.id}) has non-array "genres" property:`, gig);
				}
				// We can still proceed, it just won't be added to any genre lists
				return; // Skip genre processing for this gig
			}
			// ---- END SAFETY CHECKS ----

			// For each genre associated with this gig
			gig.genres.forEach((gigGenre) => {
				// Check if this genre exists in our predefined master list (genreMap)
				if (genreMap.has(gigGenre)) {
					// Add the gig's ID to the values array for that genre
					const genreEntry = genreMap.get(gigGenre);
					genreEntry.values.push(gig.id);

					// Optional: If you need unique IDs per genre list, uncomment below
					// if (!genreEntry.values.includes(gig.id)) {
					//     genreEntry.values.push(gig.id);
					// }
				}
				// Optional: Warn if a gig has a genre not in the master list
				// else {
				//  console.warn(`Gig (id: ${gig.id}) has unknown genre: "${gigGenre}"`);
				// }
			});
		});

		// Convert the Map values back into the desired array structure
		const result = Array.from(genreMap.values());

		// Return the calculated value - this becomes the value of gigsGenreStore
		return result;
	},
	// Optional: Initial value while the first computation runs.
	// Provides the structure immediately, even if gigsStore is initially empty.
	allPossibleGenres.map((name) => ({ name: name, values: [] }))
);
