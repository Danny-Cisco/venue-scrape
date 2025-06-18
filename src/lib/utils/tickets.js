export function ticketText(data) {
	if (data.includes('InStock')) return 'Instock';
	return data;
}
