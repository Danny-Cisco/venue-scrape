import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { EmailOtpType } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	console.log('✅ Incoming /auth/confirm request with URL:', url.href);

	// Check for OTP parameters
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;

	if (!token_hash || !type) {
		console.error('❌ Missing token_hash or type — possible expired or malformed magic link');
		throw redirect(303, '/auth/error');
	}

	// Attempt to verify the OTP with Supabase
	const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });

	if (error || !data?.user) {
		console.error('❌ OTP verification failed:', error?.message ?? 'Unknown error');
		throw redirect(303, '/auth/error');
	}

	console.log('✅ OTP verification successful for user:', data.user.id);

	// Successful login — redirect immediately (important to avoid token re-use!)
	throw redirect(303, '/auth/check-profile');
};
