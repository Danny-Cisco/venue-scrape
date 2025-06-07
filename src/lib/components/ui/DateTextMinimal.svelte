<script>
	import { format } from 'date-fns';

	export let date;

	const givenDate = new Date(date);
	const now = new Date();

	// Zero out time for comparison
	const truncate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

	const isSameDay = (d1, d2) => truncate(d1).getTime() === truncate(d2).getTime();

	const isTomorrow = (d) => {
		const tomorrow = new Date();
		tomorrow.setDate(now.getDate() + 1);
		return isSameDay(d, tomorrow);
	};

	const isThisWeek = (d) => {
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - now.getDay());
		startOfWeek.setHours(0, 0, 0, 0);

		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);
		endOfWeek.setHours(23, 59, 59, 999);

		return d >= startOfWeek && d <= endOfWeek;
	};

	let displayDate;

	if (isSameDay(givenDate, now)) {
		displayDate = 'Today, ' + format(givenDate, 'p'); // 2:45 PM
	} else if (isTomorrow(givenDate)) {
		displayDate = 'Tomorrow, ' + format(givenDate, 'p'); // 2:45 PM;
	} else if (isThisWeek(givenDate)) {
		displayDate = format(givenDate, 'EEEE') + ', ' + format(givenDate, 'p'); // 2:45 PM; // Wednesday
	} else if (givenDate.getFullYear() === now.getFullYear()) {
		displayDate = format(givenDate, 'EEEE MMM d') + ', ' + format(givenDate, 'p'); // 2:45 PM; // Jun 5
	} else {
		displayDate = format(givenDate, 'EEEE MMM d, yyyy'); // Jun 5, 2023
	}
</script>

{displayDate}
