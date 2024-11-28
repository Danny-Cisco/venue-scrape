import { json } from '@sveltejs/kit';
import { refactorUNIXTimestampToTimestampz } from '$lib/helper/date';
import { stripHtmlAndCss } from '$lib/helper/stripping';
import { createEmbedding } from '$lib/openai/embeddings.js';

export async function POST({ request, locals }) {
	const { supabase } = locals;

	console.log('Starting to upload emails');

	try {
		// Parse the JSON body of the request
		const body = await request.json();

		const emails = await Promise.all(
			body.map(async (email) => {
				return {
					nylas_id: email.id,
					body: stripHtmlAndCss(email.body),
					subject: email.subject,
					from: email.from.map((item) => item.name).join(', '),
					to: email.to.map((item) => item.name).join(', '),
					date: refactorUNIXTimestampToTimestampz(email.date),
					user_id: locals.user.id,
					snippet: email.snippet,
					embeddings: await createEmbedding(
						`
            This is an email with the subject: ${email.subject}. 
            The body of the email is: ${stripHtmlAndCss(email.body)}. 
            It was sent from ${email.from.map((item) => item.email).join(', ')}. 
            It was sent to ${email.to.map((item) => item.email).join(', ')}.
            The email was sent on ${refactorUNIXTimestampToTimestampz(email.date)}.
          `
					)
				};
			})
		);

		const { data, error: supaError } = await supabase
			.from('emails')
			.upsert(emails, { onConflict: 'nylas_id' });

		if (supaError) {
			console.error('⚠️ Supabase error:', supaError);
			return json({ record: null, error: supaError.message }, { status: 400 });
		}

		console.log('✅ Record created successfully');

		return json({ error: '' }, { status: 201 });
	} catch (err) {
		console.error('😎 Supabase record creation error: ', err);
		return json({ record: null, error: 'Failed to create record' }, { status: 500 });
	}
}
