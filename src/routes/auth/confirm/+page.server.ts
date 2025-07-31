import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { EmailOtpType } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ url, locals: { supabase, safeGetSession } }) => {
	// First check if we're already authenticated booop
	const session = await safeGetSession();

	if (session?.user) {
		console.log('User already authenticated, proceeding to profile check');
		throw redirect(303, '/auth/check-profile');
	}

	console.log('✅ URL: ', url);

	// If not authenticated, verify OTP
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null | email;

	if (!token_hash) {
		console.error('❌: missing token_hash. Most likely an expired OTP');
		throw redirect(303, '/auth/error');
	} else if (!type) {
		console.error('❌: type. Most likely an expired OTP');
		throw redirect(303, '/auth/error');
	}

	// Remove the try-catch here since we want the redirect to propagate
	const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

	if (error || !data.user) {
		console.error('OTP verification failed:', error);
		throw redirect(303, '/auth/error');
	}

	console.log('Authentication successful, redirecting to profile check');
	throw redirect(303, '/auth/check-profile');
};
