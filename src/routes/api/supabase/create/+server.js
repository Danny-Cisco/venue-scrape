// src/routes/api/gigs/+server.js (or wherever your POST endpoint is)
import { json } from '@sveltejs/kit';

/**
 * @typedef {import('@supabase/supabase-js').SupabaseClient} SupabaseClient
 */

/**
 * Handles POST requests to create a new record.
 * Expects a JSON body with gig data.
 * - Renames specific fields (e.g., instaCaptions -> insta_captions).
 * - Combines 'date' and 'time' fields into a 'datetime' timestamp.
 * - Adds user_id and created_at timestamp.
 * - Inserts the record into the table specified by the 'table' query param (defaults to 'gigs').
 *
 * @param {object} params
 * @param {Request} params.request The incoming request object.
 * @param {{supabase: SupabaseClient, user?: {id: string}}} params.locals App-specific context (Supabase client, optional user).
 * @param {URL} params.url The URL object for the request.
 * @returns {Promise<Response>} The response object.
 */
export async function POST({ request, locals, url }) {
	const { supabase } = locals;
	// Default to 'gigs' if table param is missing, adjust if 'main' is truly your default
	const tableName = url.searchParams.get('table') || 'gigs';

	// Ensure user is authenticated if user_id is mandatory
	if (!locals.user || !locals.user.id) {
		return json(
			{
				success: false,
				message: 'Authentication required to create data.'
			},
			{ status: 401 } // Unauthorized
		);
	}

	try {
		const rawData = await request.json();

		// Basic validation: ensure data is present
		if (!rawData || typeof rawData !== 'object' || Object.keys(rawData).length === 0) {
			return json(
				{
					success: false,
					message: 'Request body cannot be empty or non-object. Please send data.'
				},
				{ status: 400 } // Bad Request
			);
		}

		// --- Data Transformation ---

		// 1. Destructure known fields that need transformation or removal
		const {
			date, // Source field for datetime
			time, // Source field for datetime
			instaCaptions, // Field to rename
			instaHashtags, // Field to rename
			ticketUrl, // Field to rename
			imageUrl, // Field to rename
			id, // Never allow client to set primary key
			created_at, // Let the server/DB handle this
			user_id, // Let the server handle this based on `locals`
			...otherData // Keep the rest of the data untouched initially
		} = rawData;

		// 2. Initialize the object to be inserted with the other data
		const dataToInsert = { ...otherData };

		// 3. Rename fields (only if they exist in the input)
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

		// 4. Combine date and time into a datetime string for Supabase
		//    Supabase timestamp without timezone expects 'YYYY-MM-DD HH:MM:SS' or 'YYYY-MM-DDTHH:MM:SS'
		if (date && typeof date === 'string' && time && typeof time === 'string') {
			// Basic validation for date/time format (can be enhanced)
			if (/^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time)) {
				dataToInsert.datetime = `${date}T${time}:00`; // Construct ISO-like string without timezone
			} else {
				console.warn(
					`Invalid date ('${date}') or time ('${time}') format received. Skipping datetime column.`
				);
				// Optionally return a 400 error if date/time are mandatory and invalid
				// return json({ success: false, message: `Invalid date (${date}) or time (${time}) format. Use YYYY-MM-DD and HH:MM.`}, { status: 400 });
			}
		} else if (date || time) {
			// Warn if only one part is provided, as we can't form a full timestamp
			console.warn(
				`Received only date ('${date}') or time ('${time}'), but not both. Skipping datetime column.`
			);
		}

		// 5. Add server-side data
		dataToInsert.user_id = locals.user.id; // Add the authenticated user's ID
		// Add created_at timestamp. Alternatively, set DEFAULT now() in Supabase column definition.
		dataToInsert.created_at = new Date().toISOString();

		// --- End Data Transformation ---

		// Optional: Final check if there's anything meaningful to insert
		const finalKeys = Object.keys(dataToInsert);
		const meaningfulKeys = finalKeys.filter((k) => k !== 'user_id' && k !== 'created_at');
		if (meaningfulKeys.length === 0) {
			return json(
				{
					success: false,
					message: 'No meaningful data fields provided after processing.',
					processed_keys: finalKeys // Show what keys *were* processed
				},
				{ status: 400 }
			);
		}

		// Perform the insert operation
		const { data: newRecord, error } = await supabase
			.from(tableName)
			.insert(dataToInsert) // Pass the processed data object
			.select() // Select the newly created row's data
			.single(); // Expecting exactly one row to be created and returned

		// Handle potential errors from Supabase
		if (error) {
			console.error(`Error inserting into ${tableName}:`, error);
			return json(
				{
					success: false,
					message: `Database error: ${error.message}`,
					details: error.details,
					code: error.code,
					table: tableName,
					attempted_insert_data: dataToInsert // Show what we tried to insert
				},
				{ status: 500 } // Use 409 Conflict if error.code indicates a unique constraint violation (e.g., '23505')
			);
		}

		// Check if insertion somehow didn't return data (shouldn't happen with .single() unless error)
		if (!newRecord) {
			console.error(
				`Insertion into ${tableName} succeeded according to Supabase but no record was returned.`
			);
			return json(
				{
					success: false,
					message: `Database insertion may have failed silently or did not return data.`,
					table: tableName,
					attempted_insert_data: dataToInsert
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
				// Return the actual record created in the database (includes generated ID)
				created_data: newRecord
			},
			{ status: 201 } // 201 Created
		);
	} catch (err) {
		// Handle unexpected errors (e.g., JSON parsing issues, network errors)
		console.error('Unexpected error in POST handler:', err);

		if (err instanceof SyntaxError) {
			return json(
				{
					success: false,
					message: 'Invalid JSON format in request body.'
				},
				{ status: 400 } // Bad Request
			);
		}

		// Generic server error
		return json(
			{
				success: false,
				message: 'An unexpected server error occurred.'
				// Optionally include error details in development
				// error: process.env.NODE_ENV === 'development' ? err.message : undefined
			},
			{ status: 500 }
		);
	}
}
