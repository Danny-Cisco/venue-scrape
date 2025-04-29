// src/routes/api/gigs/+server.js (or relevant path)
import { json } from '@sveltejs/kit';

/**
 * @typedef {import('@supabase/supabase-js').SupabaseClient} SupabaseClient
 */

/**
 * Handles POST requests to create a new record.
 * Expects a JSON body with gig data.
 * - Assumes 'datetime' field (if present) is already a string formatted for Supabase timestamp.
 * - Renames specific fields (e.g., instaCaptions -> insta_captions).
 * - Adds user_id and created_at timestamp.
 * - Inserts the record into the table specified by the 'table' query param (defaults to 'gigs').
 *
 * @param {object} params
 * @param {Request} params.request The incoming request object.
 * @param {{supabase: SupabaseClient, user?: {id: string}}} params.locals App-specific context.
 * @param {URL} params.url The URL object for the request.
 * @returns {Promise<Response>} The response object.
 */
export async function POST({ request, locals, url }) {
	const { supabase } = locals;
	const tableName = url.searchParams.get('table') || 'gigs';

	// Ensure user is authenticated
	if (!locals.user || !locals.user.id) {
		return json({ success: false, message: 'Authentication required.' }, { status: 401 });
	}

	try {
		const rawData = await request.json();

		// Basic validation: ensure data is present
		if (!rawData || typeof rawData !== 'object' || Object.keys(rawData).length === 0) {
			return json(
				{ success: false, message: 'Request body cannot be empty or non-object.' },
				{ status: 400 }
			);
		}

		// --- Data Preparation ---

		// 1. Destructure known fields for renaming or removal
		const {
			// Fields to rename
			instaCaptions,
			instaHashtags,
			ticketUrl,
			imageUrl,
			// Fields to ignore/override from client
			id,
			created_at,
			user_id,
			// Keep the rest, including 'datetime' if client sent it
			...otherData
		} = rawData;

		// 2. Initialize the object to be inserted with the other data
		//    This will include 'datetime' if it was present in rawData
		const dataToInsert = { ...otherData };

		// 3. Rename fields (only if they existed in the input)
		if (instaCaptions !== undefined) {
			dataToInsert.insta_captions = instaCaptions;
		}
		if (instaHashtags !== undefined) {
			dataToInsert.insta_hashtags = instaHashtags;
		}
		if (ticketUrl !== undefined) {
			dataToInsert.ticket_url = ticketUrl;
		}
		if (imageUrl !== undefined) {
			dataToInsert.image_url = imageUrl;
		}
		// Note: No date/time combination or parsing logic here.
		// We trust that if dataToInsert.datetime exists, it's correctly formatted.

		// 4. Add server-side data
		dataToInsert.user_id = locals.user.id; // Add the authenticated user's ID
		// Use server timestamp for created_at. Alternatively, set DEFAULT now() in Supabase.
		dataToInsert.created_at = new Date().toISOString();

		// --- End Data Preparation ---

		// Optional: Check if there's anything meaningful to insert
		const finalKeys = Object.keys(dataToInsert);
		const meaningfulKeys = finalKeys.filter((k) => k !== 'user_id' && k !== 'created_at');
		if (meaningfulKeys.length === 0) {
			return json(
				{ success: false, message: 'No meaningful data fields provided after processing.' },
				{ status: 400 }
			);
		}

		// Perform the insert operation
		const { data: newRecord, error } = await supabase
			.from(tableName)
			.insert(dataToInsert) // Pass the processed data object directly
			.select()
			.single();

		// Handle potential errors from Supabase
		if (error) {
			console.error(`Error inserting into ${tableName}:`, error);
			// Consider checking error.code for specific issues like constraint violations (e.g., 23505)
			// if (error.code === '22P02') { /* Invalid input syntax - maybe bad datetime format? */ }
			return json(
				{
					success: false,
					message: `Database error: ${error.message}`,
					details: error.details,
					code: error.code,
					table: tableName,
					attempted_insert_data: dataToInsert
				},
				{ status: 500 } // Or 400/409 depending on error code
			);
		}

		if (!newRecord) {
			console.error(`Insertion into ${tableName} may have failed silently.`);
			return json(
				{
					success: false,
					message: `Database insertion failed or did not return data.`,
					table: tableName
				},
				{ status: 500 }
			);
		}

		// Success response
		return json(
			{
				success: true,
				message: `Record successfully created in table '${tableName}'.`,
				table: tableName,
				created_data: newRecord // Return the actual record from DB
			},
			{ status: 201 } // 201 Created
		);
	} catch (err) {
		// Handle unexpected errors (e.g., JSON parsing)
		console.error('Unexpected error in POST handler:', err);
		if (err instanceof SyntaxError) {
			return json(
				{ success: false, message: 'Invalid JSON format in request body.' },
				{ status: 400 }
			);
		}
		return json(
			{ success: false, message: 'An unexpected server error occurred.' },
			{ status: 500 }
		);
	}
}
