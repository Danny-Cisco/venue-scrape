import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { EmailOtpType } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	console.log('✅ Incoming /auth/confirm request with URL:', url.href);

	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;

	// Check for missing parameters separately
	if (!token_hash || !type) {
		console.error('❌ Malformed or expired magic link detected. Full URL:', url.href);

		if (!token_hash) {
			console.error('❌ Missing `token_hash` parameter in URL.');
		}

		if (!type) {
			console.error('❌ Missing `type` parameter in URL.');
		}

		throw redirect(303, '/auth/error');
	}

	// Attempt to verify the OTP with Supabase
	const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });

	if (error || !data?.user) {
		console.error('❌ OTP verification failed:', error?.message ?? 'Unknown error');
		throw redirect(303, '/auth/error');
	}

	console.log('✅ OTP verification successful for user:', data.user.id);

	// Successful login — redirect immediately
	throw redirect(303, '/auth/check-profile');
};
