// src/routes/api/gigs/+server.js
import { json } from '@sveltejs/kit';

export async function PATCH({ request, locals }) {
	const table = 'gigs';

	// ── 1. require authentication ───────────────────────────────
	if (!locals.user?.id)
		return json({ success: false, message: 'Authentication required.' }, { status: 401 });

	try {
		// ── 2. parse & validate body ────────────────────────────
		/** @type {{ key?: string | { matchId?: string, id?: string } } & Record<string, unknown>} */
		const body = await request.json();

		if (!body || Object.keys(body).length === 0)
			return json({ success: false, message: 'Body cannot be empty.' }, { status: 400 });

		// The 'key' from the request body is intended to be the value for the 'id' column
		if (!body.key) {
			return json(
				{ success: false, message: '`key` (representing the gig ID or match data) is required.' },
				{ status: 400 }
			);
		}

		let actualIdValue;
		const clientKey = body.key; // Get the value of the 'key' property from the request

		if (typeof clientKey === 'string') {
			actualIdValue = clientKey;
		} else if (typeof clientKey === 'object' && clientKey !== null) {
			if (typeof clientKey.matchId === 'string') {
				actualIdValue = clientKey.matchId;
			} else if (typeof clientKey.id === 'string') {
				// In case client sends { id: "uuid" }
				actualIdValue = clientKey.id;
			}
		}

		if (!actualIdValue) {
			return json(
				{
					success: false,
					message:
						'`key` property must be a UUID string, or an object like { matchId: "uuid-string" } or { id: "uuid-string" }.'
				},
				{ status: 400 }
			);
		}
		// Ensure actualIdValue is a string (it should be if logic above is correct)
		if (typeof actualIdValue !== 'string') {
			return json(
				{ success: false, message: 'Extracted ID value is not a string.' },
				{ status: 400 }
			);
		}

		// Destructure the rest of the body, excluding the 'key' property itself,
		// as we've already processed it.
		const { key, ...patchData } = body;

		// ── 3. build object to upsert ─────────────────
		const toUpsert = {
			...patchData, // other fields from the client
			id: actualIdValue, // Use the extracted UUID string
			userId: locals.user.id,
			updatedAt: new Date()
		};

		// ── 4. perform upsert via the wrapper ───────────────────
		const { data: record, error } = await locals.db.upsert(table, toUpsert, {
			onConflict: ['id']
		});
		if (error) throw error; // This will now include more specific Supabase errors if they occur

		// ── 5. success ──────────────────────────────────────────
		return json({ success: true, table, record }, { status: 200 });
	} catch (err) {
		console.error(`PATCH /api/${table} error:`, err); // More specific logging
		// Check for Supabase specific error structure
		const message = err.message || err.details || err.hint || 'Unexpected server error.';
		const status = err.status || (err.code ? 400 : 500); // Guess status from Supabase error codes if available

		return json(
			{
				success: false,
				message: message,
				code: err.code, // Send Supabase error code if available
				table
			},
			{ status }
		);
	}
}
