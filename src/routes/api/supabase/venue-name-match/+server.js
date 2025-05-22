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

	console.log('🚀 Incoming scrapedName:', scrapedName);

	// Fetch known venues
	const { data: venues, error } = await supabase.from('venues').select('id, name');
	if (error || !venues?.length) {
		console.error('❌ Supabase venue fetch failed:', error?.message);
		return json({ error: 'Failed to load venues' }, { status: 500 });
	}

	// Build prompt
	const venueList = venues.map((v) => `- ${v.name}`).join('\n');

	const prompt = `
	You are to act as a fuzzy matching system to find venues in their desired spellings from inputs that may have incorrect ar alternative spellings.
Here is a list of known venue names, shown in the EXACT SPELLING you are to use in your output:
[START VENUE LIST]
${venueList}
[END VENUE LIST]

Match the following venue name: "${scrapedName}"

If one of the known venues is a good match, return ONLY the exact name AS SHOWN IT THE VENUE LIST. It is important you prioritise the exact spelling found in the venue list. The presence of words such as 'the' capitals etc.
If none match, return "NO MATCH".
If the venue list is missing, return "VENUE LIST MISSING"
`;

	try {
		const res = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			temperature: 0,
			messages: [{ role: 'user', content: prompt }]
		});

		// Log the full response for debugging
		console.log('🧠 LLM full response:', JSON.stringify(res, null, 2));

		if (!res.choices?.length || !res.choices[0].message?.content) {
			console.error('❌ Invalid LLM response shape');
			return json({ error: 'Invalid LLM response' }, { status: 500 });
		}

		const matchedName = res.choices[0].message.content.trim();
		console.log('🎯 Matched name from LLM:', matchedName);

		if (matchedName === 'NO MATCH') {
			console.log('🟡 LLM result: NO MATCH');
			return json({ match: 'NO MATCH', venue_id: null });
		}

		if (matchedName === 'VENUE LIST MISSING') {
			console.warn('⚠️ LLM result: VENUE LIST MISSING');
			return json({ match: 'VENUE LIST MISSING', venue_id: null });
		}

		// Normalize function: lowercase and remove leading "the "
		function normalize(name) {
			return name
				.toLowerCase()
				.replace(/^the\s+/i, '')
				.trim();
		}

		// Try to find the matched venue with fuzzy normalization
		const matchedVenue = venues.find((v) => normalize(v.name) === normalize(matchedName));

		if (!matchedVenue) {
			console.warn('🔴 LLM returned name not found in venue list:', matchedName);
			return json({
				match: 'LLM NAME NOT FOUND',
				venue_id: null,
				reason: 'LLM returned name not found in venue list'
			});
		}

		console.log('✅ Final venue match:', matchedVenue.name);
		return json({
			match: matchedVenue.name,
			venue_id: matchedVenue.id
		});
	} catch (err) {
		console.error('❌ LLM Error:', err.message);
		return json({ error: 'LLM match error: ' + err.message }, { status: 500 });
	}
}
