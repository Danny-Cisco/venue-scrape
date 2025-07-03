import { json } from '@sveltejs/kit';

async function sendQuestion(question, systemPrompt, fetch) {
	const parsedBody = JSON.stringify({ question, systemPrompt });

	const response = await fetch('/api/openai/qabot', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: parsedBody
	});

	const data = await response.json();
	return data.answer;
}

export async function GET({ url, fetch }) {
	const targetUrl = url.searchParams.get('url');
	const ai = url.searchParams.get('ai');

	if (!targetUrl) {
		return json({ error: 'Missing ?url parameter' }, { status: 400 });
	}

	try {
		const jinaUrl = `https://r.jina.ai/${targetUrl}`;
		const res = await fetch(jinaUrl);

		if (!res.ok) {
			const errText = await res.text().catch(() => res.statusText);
			return json({ error: `Jina fetch failed: ${errText}` }, { status: res.status });
		}

		const markdown = await res.text();

		if (!ai) {
			// return raw markdown if no AI question
			return json({ markdown });
		}

		const prompt = `Here is the markdown summary of ${targetUrl}:\n\n${markdown}\n\nUser question: ${ai}`;
		const systemPrompt = `You are a markdown document analyst. Given the full markdown content of a page and a follow-up question, respond concisely and informatively. If the question is about links or citations, refer directly to them using their markdown format.`;

		const answer = await sendQuestion(prompt, systemPrompt, fetch);

		return json({ source: targetUrl, answer });
	} catch (err) {
		console.error('❌ Error in jina-plus-ai:', err);
		return json(
			{ error: 'Failed to fetch or analyze Jina markdown', details: err.message },
			{ status: 500 }
		);
	}
}
