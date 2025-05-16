import OpenAI from 'openai';
import { json } from '@sveltejs/kit';
import { PRIVATE_OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({ apiKey: PRIVATE_OPENAI_API_KEY });

export async function GET({ locals }) {
	const supabase = locals.supabase;

	const { data, error } = await supabase.from('venues').select('name');
	if (error) {
		console.error('❌ Supabase error:', error.message);
		return json({ error: error.message }, { status: 500 });
	}
	return json(data.map((v) => v.name));
}

export async function POST({ request, locals }) {
	const supabase = locals.supabase;
	const { scrapedName } = await request.json();

	const { data: venues, error } = await supabase.from('venues').select('id, name');
	if (error || !venues?.length) {
		console.error('❌ Supabase venue fetch failed:', error?.message);
		return json({ error: 'Failed to load venues' }, { status: 500 });
	}

	const venueList = venues.map((v) => `- ${v.name}`).join('\n');

	const prompt = `
Here is a list of known venue names:

${venueList}

Match the following venue name: "${scrapedName}"

If one of the known venues is a good match, return ONLY its exact name.
If none match, return "NO MATCH".
`;

	try {
		const res = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			temperature: 0,
			messages: [{ role: 'user', content: prompt }]
		});

		const matchedName = res.choices[0].message.content.trim();

		if (matchedName === 'NO MATCH') {
			return json({ match: 'NO MATCH' });
		}

		// Find venue_id for the matched name
		const matchedVenue = venues.find((v) => v.name === matchedName);
		if (!matchedVenue) {
			return json({ error: 'LLM returned unknown venue name' }, { status: 404 });
		}

		return json({
			match: matchedVenue.name,
			venue_id: matchedVenue.id
		});
	} catch (err) {
		console.error('❌ LLM Error:', err.message);
		return json({ error: 'LLM match error: ' + err.message }, { status: 500 });
	}
}
