<script>
	import { getWeekday, getDay, getMonth, getYear, getTime, getTimeZone } from '$lib/utils/date.ts';

	export let date;
</script>

<p class="text-lg font-semibold text-black">
	{getTime(date)}, {getWeekday(date)}
	{getDay(date)}
	{getMonth(date)}, {getYear(date)}
</p>
