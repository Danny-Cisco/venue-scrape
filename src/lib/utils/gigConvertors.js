export function humanitixToOztix(dataObject) {
	console.log('🚀🔥🔥🔥 ~ humanitixToOztix ~ dataObject:', dataObject);
	const dataEntry = dataObject.data.find((d) => d.data?.event);
	if (!dataEntry) return null;

	const event = dataEntry.data.event;
	const schema = dataEntry.data.seo?.jsonSchema;
	const tickets = schema?.offers ?? [];

	const oztix = {
		title: event.title,
		description: event.description,
		startDate: event.dates?.startDate,
		venue: event.location?.venueName,
		address: event.location?.address,
		suburb: event.location?.locality,
		latlong: event.location?.latLng,
		image: event.images?.banner?.src || event.images?.thumbnail?.src || '',
		ticketUrl: event.urls?.ticketsUrl,
		tickets: tickets.map((t) => ({
			ticketType: t.name ?? '',
			price: t.price ?? '',
			currency: t.priceCurrency ?? '',
			availability: t.availability ?? ''
		})),
		tags: event.keywords ?? []
	};

	return oztix;
}
