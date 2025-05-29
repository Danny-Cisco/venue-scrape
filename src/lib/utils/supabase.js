export async function gigsFuzzyDupeCheckWithUpdate(gig) {
	const gigDupeData = await checkSupabaseForDuplicate(gig);
	console.log('🌼 gigDupeData : ', gigDupeData);
	const gigDupeId = gigDupeData.matchId;
	if (!gigDupeId) await insertGigToSupabase(gig);
	else await upsertGigToSupabase(gigDupeId, gig);
}

export async function checkSupabaseForDuplicate(gig) {
	// new locaiton of bandnames is inside 'gig.bandObjects[].bandname'
	let bands = [];
	for (const bandObject of gig.bandObjects) {
		bands = [...bands, bandObject.bandname];
	}
	console.log('🚀 ~ checkSupabaseForDuplicate ~ bands:', bands);

	// loading = true;
	const body = { startDate: gig.startDate, venue: gig.venue, bands: bands };
	console.log('📦 checking gig for a match in Supabase:', body);

	const response = await fetch('/api/supabase/match-gig', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const errText = await response.text();
		console.error('❌ Match check failed:', errText);
		throw new Error(`Supabase match check failed: ${response.statusText}`);
	}

	const result = await response.json();
	return result;
}

export async function insertGigToSupabase(gig) {
	// loading = true;
	console.log('📦 Sending gig to Supabase:', gig);
	try {
		const parsedBody = JSON.stringify(gig); // No need for `await` here; JSON.stringify is synchronous

		const response = await fetch('/api/supabase/create?table=gigs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: parsedBody
		});

		const responseBody = await response.text(); // Read as text first to handle weird errors

		if (!response.ok) {
			console.error('❌ Fetch failed:');
			console.error('Status:', response.status);
			console.error('Status Text:', response.statusText);
			console.error('Response Body:', responseBody);
			throw new Error(`Upsert failed with status ${response.status}`);
		}

		let data;
		try {
			data = JSON.parse(responseBody);
		} catch (parseError) {
			console.error('❌ Failed to parse JSON:', parseError);
			throw parseError;
		}

		console.log('🚀 ~ upsertGig ~ data:', data);
	} catch (error) {
		console.error('❌ Upsert Error:', error);
		console.error('🔎 Gig data that caused error:', gig);
	} finally {
		// loading = false;
	}
}

export async function upsertGigToSupabase(id, gig) {
	// loading = true;
	console.log('📦 Sending gig to Supabase:', gig);
	try {
		// Merge `id` as `key` (required by the server)
		const body = {
			key: id, // your PATCH handler requires this
			...gig
		};

		const response = await fetch('/api/supabase/upsert-gig', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			const responseBody = await response.text();
			console.error('❌ Fetch failed:');
			console.error('Status:', response.status);
			console.error('Status Text:', response.statusText);
			console.error('Response Body:', responseBody);
			throw new Error(`Upsert failed with status ${response.status}`);
		}

		const data = await response.json();
		console.log('🚀 Upsert successful:', data);
		return data;
	} catch (error) {
		console.error('❌ Upsert Error:', error);
		console.error('🔎 Gig data that caused error:', gig);
		return null;
	} finally {
		// loading = false;
	}
}
