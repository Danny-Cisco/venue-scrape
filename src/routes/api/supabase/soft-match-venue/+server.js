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

	const { data: venues, error } = await supabase.from('venues').select('name');
	if (error || !venues?.length) {
		console.error('❌ Supabase venue fetch failed:', error?.message);
		return json({ error: 'Failed to load venues' }, { status: 500 });
	}

	const venueList = venues.map((v) => `- ${v.name}`).join('\n');

	if (!venueList || venueList.trim().length === 0) {
		console.error('❌ Empty venue list');
		return json({ error: 'No venues in list' }, { status: 500 });
	}

	const prompt = `
You are matching venue names. Here is the list of known venues:

${venueList}

Now match the following venue name: "${scrapedName}"

If it closely matches one of the known venues, return the name of the closest match.
If it does not match any, return "NO MATCH".
If no list of venue names is given, return "ERROR - NO VENUE LIST"
`;

	try {
		const res = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			temperature: 0,
			messages: [{ role: 'user', content: prompt }]
		});

		const match = res.choices[0].message.content.trim();
		console.log('✅ Match:', match);
		return json({ match });
	} catch (err) {
		console.error('❌ OpenAI error:', err.message);
		return json({ error: 'LLM match error: ' + err.message }, { status: 500 });
	}
}
