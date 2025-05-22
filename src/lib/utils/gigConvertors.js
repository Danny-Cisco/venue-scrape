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
export function eventbriteToOztix(eventbrite) {
	const ld = eventbrite.ld_events?.[0] ?? {};
	const sd = eventbrite.server_data?.event_listing_response ?? {};
	const map = eventbrite.server_data?.eventMap?.location ?? {};
	const address = ld.location?.address ?? {};
	const offers = ld.offers?.filter((o) => o['@type'] === 'Offer') ?? [];
	const tags = eventbrite.server_data?.components?.eventDescription?.tags ?? [];

	return {
		title: ld.name ?? '',
		description: ld.description ?? '',
		startDate: ld.startDate ?? '',
		venue: ld.location?.name ?? '',
		address: address.streetAddress ?? '',
		suburb: address.addressLocality ?? '',
		latlong: map.latitude && map.longitude ? `${map.latitude},${map.longitude}` : '',
		image: ld.image ?? '',
		ticketUrl: ld.url ?? '',
		tickets: offers.map((o) => ({
			ticketType: o.name ?? 'General Admission',
			price: o.price ?? o.lowPrice ?? '',
			currency: o.priceCurrency ?? 'AUD',
			availability: o.availability ?? ''
		})),
		tags: tags.map((tag) => tag.text)
	};
}
