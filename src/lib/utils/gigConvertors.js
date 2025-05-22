export function humanitixToOztix(parsedData) {
	if (!parsedData || !parsedData.data || !Array.isArray(parsedData.data)) {
		console.warn('🚨 Invalid parsed data structure:', parsedData);
		return null;
	}

	const eventDataEntry = parsedData.data.find((d) => d?.data?.event);
	if (!eventDataEntry) {
		console.warn('🚨 No event entry found in parsed data:', parsedData);
		return null;
	}

	const event = eventDataEntry.data.event;
	const schema = eventDataEntry.data.seo?.jsonSchema;
	const tickets =
		eventDataEntry.data.ticketTypeData?.tickets ??
		schema?.offers?.filter((o) => o['@type'] === 'Offer') ??
		[];

	return {
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
			ticketType: t.name ?? t?.description ?? '',
			price: t.price?.numericalPrice ?? t.price ?? '',
			currency: t.priceCurrency ?? 'AUD',
			availability: t.availability ?? t?.onSaleStatus?.ticketSaleStatus ?? ''
		})),
		tags: event.keywords ?? []
	};
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

export function moshtixToOztix(dataObject) {
	const ld = dataObject.ld_json?.[0] ?? {};
	const address = ld.location?.address ?? {};
	const tickets = ld.offers ?? [];

	return {
		title: ld.name ?? '',
		description: dataObject.event_details_text ?? '',
		startDate: ld.startDate ?? '',
		venue: ld.location?.name ?? '',
		address: address.streetAddress ?? '',
		suburb: address.addressLocality ?? '',
		latlong: '', // will be joined later via separate coordinates table
		image: ld.image ?? '',
		ticketUrl: ld.url ?? '',
		tickets: tickets.map((t) => ({
			ticketType: t.name ?? '',
			price: t.price ?? '',
			currency: t.priceCurrency ?? '',
			availability: t.availability ?? ''
		})),
		tags: [] // no tags available — safe to leave empty
	};
}
