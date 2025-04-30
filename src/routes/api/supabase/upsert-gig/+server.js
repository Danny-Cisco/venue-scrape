// src/routes/api/gigs/+server.js
import { json } from '@sveltejs/kit';

export async function PATCH({ request, locals }) {
	const table = 'gigs';

	// ── 1. require authentication ───────────────────────────────
	if (!locals.user?.id)
		return json({ success: false, message: 'Authentication required.' }, { status: 401 });

	try {
		// ── 2. parse & validate body ────────────────────────────
		/** @type {{ key?: string } & Record<string, unknown>} */
		const body = await request.json();

		if (!body || Object.keys(body).length === 0)
			return json({ success: false, message: 'Body cannot be empty.' }, { status: 400 });

		if (!body.key)
			return json(
				{ success: false, message: '`key` (formerly oztixUrl) is required.' },
				{ status: 400 }
			);

		const { key, ...patch } = body;

		// ── 3. build camelCase object to upsert ─────────────────
		const toUpsert = {
			...patch, // whatever client sent (camel)
			key, // primary/unique key
			userId: locals.user.id, // wrapper → user_id
			updatedAt: new Date() // wrapper → updated_at  (add column or ignore)
		};

		// ── 4. perform upsert via the wrapper ───────────────────
		const { data: record, error } = await locals.db.upsert(table, toUpsert, {
			onConflict: ['key'] // Postgres column name (snake after conversion)
		});
		if (error) throw error;

		// ── 5. success ──────────────────────────────────────────
		return json({ success: true, table, record }, { status: 200 });
	} catch (err) {
		console.error('PATCH /api/supabase/upsert-gig error:', err);
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
