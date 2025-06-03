import { parse, format, isValid } from 'date-fns';

/**
 * Converts separate date and time strings (in various common formats)
 * into a single datetime string suitable for Supabase timestamp columns
 * (YYYY-MM-DDTHH:MM:SS).
 *
 * @param {string | null | undefined} dateString - The date part (e.g., "Saturday, April 26, 2025", "2025-04-26").
 * @param {string | null | undefined} timeString - The time part (e.g., "4pm", "10:30 AM", "3:30pm", "16:00").
 * @returns {string | null} The formatted datetime string (YYYY-MM-DDTHH:MM:SS) or null if parsing fails or inputs are invalid.
 */
export function convertStringToDatetime(dateString, timeString) {
	if (
		!dateString ||
		typeof dateString !== 'string' ||
		dateString.trim() === '' ||
		!timeString ||
		typeof timeString !== 'string' ||
		timeString.trim() === ''
	) {
		console.warn('convertStringToDatetime: Invalid or missing date/time string input.', {
			dateString,
			timeString
		});
		return null;
	}

	const combinedDateTimeString = `${dateString.trim()} ${timeString.trim()}`;

	// List formats from most specific/likely to least specific
	// Add more formats here if you expect other variations
	const possibleInputFormats = [
		// With full date name:
		'EEEE, MMMM d, yyyy h:mm aaa', // Saturday, April 26, 2025 4:30 PM
		'EEEE, MMMM d, yyyy h:mmaaa', // Saturday, April 26, 2025 4:30pm <--- ADDED
		'EEEE, MMMM d, yyyy haaa', // Saturday, April 26, 2025 4pm

		// With month name:
		'MMMM d, yyyy h:mm aaa', // April 26, 2025 4:30 PM
		'MMMM d, yyyy h:mmaaa', // April 26, 2025 4:30pm <--- ADDED
		'MMMM d, yyyy haaa', // April 26, 2025 4pm

		// With yyyy-MM-dd:
		'yyyy-MM-dd HH:mm', // 2025-04-26 16:30 (24-hour)
		'yyyy-MM-dd h:mm aaa', // 2025-04-26 4:30 PM
		'yyyy-MM-dd h:mmaaa', // 2025-04-26 4:30pm <--- ADDED
		'yyyy-MM-dd haaa', // 2025-04-26 4pm

		// With MM/dd/yyyy:
		'MM/dd/yyyy h:mm aaa', // 04/26/2025 4:30 PM
		'MM/dd/yyyy h:mmaaa', // 04/26/2025 4:30pm <--- ADDED
		'MM/dd/yyyy haaa' // 04/26/2025 4pm
	];

	let parsedDate = null;

	for (const formatString of possibleInputFormats) {
		const attempt = parse(combinedDateTimeString, formatString, new Date());
		if (isValid(attempt)) {
			parsedDate = attempt;
			// console.log(`Parsed successfully with format: ${formatString}`); // For debugging
			break;
		}
	}

	if (parsedDate) {
		try {
			const formattedOutput = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss");
			return formattedOutput;
		} catch (formatError) {
			console.error('convertStringToDatetime: Error formatting the parsed date.', formatError, {
				parsedDate
			});
			return null;
		}
	} else {
		console.error(
			`convertStringToDatetime: Failed to parse date/time string: "${combinedDateTimeString}". None of the expected formats matched.`,
			{ dateString, timeString }
		);
		return null;
	}
}

export function formatDateLong(isoString) {
	const date = new Date(isoString);

	return new Intl.DateTimeFormat('en-AU', {
		weekday: 'long', // "Sunday"
		year: 'numeric', // "2025"
		month: 'long', // "July"
		day: 'numeric', // "6"
		hour: 'numeric', // "7"
		minute: '2-digit', // "00"
		hour12: true, // "PM"
		timeZoneName: 'short' // "AEST"
	}).format(date);
}

export function getWeekday(isoString) {
	const date = new Date(isoString);
	return new Intl.DateTimeFormat('en-AU', { weekday: 'long' }).format(date); // e.g., "Sunday"
}

export function getDay(isoString) {
	const date = new Date(isoString);
	return date.getDate(); // e.g., 6
}

export function getMonth(isoString) {
	const date = new Date(isoString);
	return new Intl.DateTimeFormat('en-AU', { month: 'long' }).format(date); // e.g., "July"
}

export function getYear(isoString) {
	const date = new Date(isoString);
	return date.getFullYear(); // e.g., 2025
}

export function getTime(isoString) {
	const date = new Date(isoString);
	return new Intl.DateTimeFormat('en-AU', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	}).format(date); // e.g., "7:00 PM"
}

export function getTimeZone(isoString) {
	const date = new Date(isoString);
	return (
		new Intl.DateTimeFormat('en-AU', {
			timeZoneName: 'short'
		})
			.formatToParts(date)
			.find((p) => p.type === 'timeZoneName')?.value || ''
	);
}
