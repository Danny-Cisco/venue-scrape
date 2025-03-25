import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { EmailOtpType } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = url.searchParams.get('next') ?? '/dashboard';

	const redirectTo = new URL(url);
	redirectTo.pathname = next;
	redirectTo.searchParams.delete('token_hash');
	redirectTo.searchParams.delete('type');

	if (!token_hash || !type) {
		redirectTo.pathname = '/auth/error';
		throw redirect(303, redirectTo.toString());
	}

	try {
		console.log('Starting OTP verification...');
		const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

		if (error || !data.user) {
			console.error('OTP verification failed:', error);
			throw error || new Error('User data not found');
		}

		console.log('OTP verification successful, checking for profile...');

		// Check if profile exists using maybeSingle instead of count
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', data.user.id)
			.maybeSingle();

		if (profileError) {
			console.error('Error checking profile:', profileError);
			throw profileError;
		}

		// Create profile if it doesn't exist
		if (!profile) {
			console.log('Profile not found, creating new profile...');
			const { error: insertError } = await supabase
				.from('profiles')
				.insert({
					id: data.user.id,
					email: data.user.email,
					username: generateUsername(data.user.email),
					created_at: new Date().toISOString()
				})
				.single();

			if (insertError) {
				console.error('Error creating profile:', insertError);
				throw insertError;
			}
			console.log('Profile created successfully');
		}

		// Log login event (optional)
		try {
			await supabase.from('login_history').insert({
				user_id: data.user.id,
				login_at: new Date().toISOString(),
				method: type
			});
		} catch (loginError) {
			console.error('Failed to log login history:', loginError);
			// Continue execution even if login history fails
		}

		redirectTo.searchParams.delete('next');
		throw redirect(303, redirectTo.toString());
	} catch (error) {
		if (error instanceof Error) {
			console.error('Authentication error:', error);
		}
		// Only redirect to error page if it's not a profile-not-found situation
		if (error instanceof Error && error.message.includes('profile not found')) {
			console.log('Profile not found, but continuing...');
			redirectTo.searchParams.delete('next');
			throw redirect(303, redirectTo.toString());
		}
		redirectTo.pathname = '/auth/error';
		throw redirect(303, redirectTo.toString());
	}
};

// Helper function to generate username
function generateUsername(email: string): string {
	if (!email) throw new Error('Email is required');
	const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
	return `${username}${Math.floor(Math.random() * 1000)}`;
}
