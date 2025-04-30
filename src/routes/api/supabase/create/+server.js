// src/routes/api/gigs/+server.js
import { json } from '@sveltejs/kit';

export async function POST({ request, locals, url }) {
	const table = url.searchParams.get('table') || 'gigs';

	// ── 1. must be signed-in ─────────────────────────────────────────────
	if (!locals.user?.id)
		return json({ success: false, message: 'Authentication required.' }, { status: 401 });

	try {
		// ── 2. read & sanity-check body ─────────────────────────────────
		/** @type {Record<string, unknown>} */
		const body = await request.json();
		if (!body || typeof body !== 'object' || Object.keys(body).length === 0)
			return json({ success: false, message: 'Body cannot be empty.' }, { status: 400 });

		// ── 3. add server-side fields (camel-case!) ─────────────────────
		const toInsert = {
			...body, // keep whatever the client sent
			userId: locals.user.id, // wrapper → user_id
			createdAt: new Date() // wrapper → created_at (ISO string)
		};

		// ── 4. perform insert via the wrapper ───────────────────────────
		const { data: record, error } = await locals.db.insert(table, toInsert);
		if (error) throw error; // bubbles into catch block below

		// ── 5. success ─────────────────────────────────────────────────
		return json({ success: true, table, record }, { status: 201 });
	} catch (err) {
		console.error('POST /api/gigs error:', err);
		return json(
			{
				success: false,
				message: err?.message ?? 'Unexpected server error.',
				table
			},
			{ status: 500 }
		);
	}
}
