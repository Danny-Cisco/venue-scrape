export function getStarCount(followers) {
	if (!followers) return 0;
	if (followers > 100_000) return 5;
	if (followers > 10_000) return 4;
	if (followers > 4_400) return 3;
	if (followers > 999) return 2;

	if (followers > 0) return 1;
	return 0;
}
