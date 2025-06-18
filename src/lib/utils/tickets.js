export function ticketText(data) {
	if (data.includes('InStock')) return 'Instock';
	if (data.includes('OutOfStock')) return 'Ended';
	return data;
}
