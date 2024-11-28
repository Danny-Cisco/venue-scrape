// src/lib/supabase/supabaseHelpers.js
// These helper functions make using our supabase api endpoints as simple as possible

export async function removeUserIdFromHighlight(results, field) {
	return results.filter((result) => {
		const { [field]: _, ...rest } = result;

		// Recursively remove field from supabase.highlight if it exists
		if (rest.supabase && rest.supabase.highlight) {
			rest.supabase.highlight = removeFieldFromHighlight(rest.supabase.highlight, field);

			// Remove the whole record if supabase.highlight is empty
			if (Object.keys(rest.supabase.highlight).length === 0) {
				return false;
			}
		}

		return true;
	});
}

function removeFieldFromHighlight(highlight, field) {
	const { [field]: _, ...rest } = highlight;
	return rest;
}

// <SUPABASE GET ONE>
// pass in a recordID
// get out {record: "", error: ""}
// will trim whitespace from recordId
// will only return records where current user email is INCLUDED in user_id field
// this allows for sharing ownership of a single entry between multiple users
export async function supabaseGetOne(recordId) {
	recordId = recordId.trim();
	try {
		const response = await fetch(`/api/supabase/get-one?id=${recordId}`);
		if (!response.ok) {
			const errorResponse = await response.json();
			if (response.status === 401) {
				return { error: 'User not authenticated' };
			} else if (response.status === 403) {
				return { error: 'Unauthorized access' };
			} else {
				return { error: errorResponse.error || 'Failed to fetch record' };
			}
		}
		return { record: await response.json() };
	} catch (err) {
		console.error('Failed to fetch record:', err);
		return { error: 'Network error' };
	}
}

export async function supabaseGetPaginated(page = 1, pageSize = 5) {
	try {
		const response = await fetch(`/api/supabase/get-paginated?page=${page}&pageSize=${pageSize}`);

		if (!response.ok) {
			const errorResponse = await response.json();
			return {
				error: errorResponse.error || 'An error occurred while fetching records',
				records: []
			};
		}

		const data = await response.json();
		return {
			records: data.records || []
		};
	} catch (err) {
		console.error('Failed to fetch records:', err);
		return {
			error: 'Network error',
			records: []
		};
	}
}

export async function supabaseSearch(query, fuzziness) {
	try {
		const response = await fetch('/api/supabase/search', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ query, fuzziness })
		});
		if (!response.ok) {
			const errorResponse = await response.json();
			if (response.status === 401) {
				return { error: 'User not authenticated' };
			} else if (response.status === 403) {
				return { error: 'Unauthorized access' };
			} else {
				return { error: errorResponse.error || 'Failed to fetch record' };
			}
		}
		const data = await response.json();
		return {
			records: data.records || []
		};
	} catch (err) {
		console.error('Failed to fetch record:', err);
		return {
			error: 'Network error',
			records: []
		};
	}
}

export async function supabaseGetAll() {
	try {
		const response = await fetch('/api/supabase/get-all');
		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}
		const result = await response.json();
		console.log('👀🚀 ~ helperssupabaseGetAll ~ result:', result);
		return { records: result.records, error: '' };
	} catch (error) {
		console.error('Error fetching data:', error);
		return { records: [], error: 'Failed to fetch data' };
	}
}

export async function supabaseVectorSearch(term) {
	try {
		const response = await fetch(`/api/supabase/vector-search?term=${encodeURIComponent(term)}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}

		const result = await response.json();
		return { records: result, error: '' };
	} catch (error) {
		console.error('Error fetching data:', error);
		return { records: [], error: 'Failed to fetch data' };
	}
}

export async function updateEmbeddings() {
	try {
		const response = await fetch('/api/supabase/update-embeddings', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			console.error(`Failed to update embeddings: ${response.status} ${response.statusText}`);
			throw new Error('Failed to update embeddings');
		}

		const result = await response.json();
		console.log('Embeddings updated successfully:', result);
		return { message: result.message, error: '' };
	} catch (error) {
		console.error('Error updating embeddings:', error);
		return { message: '', error: 'Failed to update embeddings' };
	}
}
