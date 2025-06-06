// THIS IS THE PLACE TO TINKER WITH THE NUMBER OF FOLLOWERS NEEDED FOR STARS (in k)
const starGroupThresholds = [0, 1, 5, 25, 50]; // get a star for breaking each milestone (k) of insta followers

export function getStarCount(followers) {
	if (!followers) return 0;

	let followersK = Math.floor((followers / 1000).toFixed(1)); // use the same toFixed(1) as the other ui so it appears to confirm +950 will appear as 1.0k

	// Optional bucketing to smooth things out
	if (followersK >= 100) {
		followersK = Math.round(followersK / 100) * 100;
	} else if (followersK >= 10) {
		followersK = Math.round(followersK / 10) * 10;
	}

	let stars = 0;
	for (const threshold of starGroupThresholds) {
		if (followersK >= threshold) {
			stars++;
		} else {
			break; // stop when we pass a threshold we didn't meet
		}
	}

	return stars;
}
