import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { EmailOtpType } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;

	if (!token_hash || !type) {
		throw redirect(303, '/auth/error');
	}

	try {
		const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

		if (error || !data.user) {
			console.error('OTP verification failed:', error);
			throw redirect(303, '/auth/error');
		}

		// Auth successful, redirect to profile check
		throw redirect(303, '/auth/check-profile');
	} catch (error) {
		console.error('Authentication error:', error);
		throw redirect(303, '/auth/error');
	}
};
