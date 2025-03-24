// src/routes/auth/confirm/+server.ts
import type { EmailOtpType } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	// Default to root instead of /account to match your magic link implementation
	const next = url.searchParams.get('next') ?? '/auth/confirm';

	const redirectTo = new URL(url);
	redirectTo.pathname = next;
	redirectTo.searchParams.delete('token_hash');
	redirectTo.searchParams.delete('type');

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({ type, token_hash });
		if (!error) {
			redirectTo.searchParams.delete('next');
			return redirect(303, redirectTo);
		}
	}

	// If we hit an error, redirect to auth error page
	redirectTo.pathname = '/auth/error';
	return redirect(303, redirectTo);
};
