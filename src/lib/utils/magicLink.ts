export async function handleMagicLink(
	email: string,
	supabase: any
): Promise<{ success: boolean; message: string; errors?: any }> {
	console.log('[handleMagicLink] Start - email:', email);

	const validEmail = /^[\w-\.+]+@([\w-]+\.)+[\w-]{2,8}$/.test(email);
	const cleanEmail = email.trim().toLowerCase();

	if (!email) {
		console.log('[handleMagicLink] No email provided');
		return {
			success: false,
			message: 'Email is required',
			errors: { email: 'Email is required' }
		};
	}

	if (!validEmail) {
		console.log('[handleMagicLink] Invalid email format');
		return {
			success: false,
			message: 'Please enter a valid email address',
			errors: { email: 'Invalid email format' }
		};
	}

	try {
		// ✅ Fetch all entries in the whitelist
		const { data: whitelist, error: whitelistError } = await supabase
			.from('whitelist')
			.select('email')
			.eq('email', email)
			.single();

		if (whitelistError) {
			console.error('[handleMagicLink] Error fetching whitelist:', whitelistError);
			return {
				success: false,
				message: 'This email is not on the whitelist.',
				errors: { email: 'Sorry, you are not currently on the whitelist' }
			};
		}

		console.log('[handleMagicLink] Whitelist contents:', whitelist);

		// ✅ Check if the cleaned email exists in the whitelist
		const isWhitelisted = whitelist.email.trim().toLowerCase() === cleanEmail;
		if (!isWhitelisted) {
			console.warn('[handleMagicLink] Email not found in whitelist:', cleanEmail);
			return {
				success: false,
				message: 'This email is not on the whitelist.',
				errors: { email: 'Sorry, you are not currently on the whitelist' }
			};
		}

		const baseUrl = window.location.origin;
		const redirectUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

		console.log('[handleMagicLink] Redirect URL:', redirectUrl);

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${redirectUrl}auth/confirm`,
				redirectTo: redirectUrl
			}
		});

		if (error) {
			console.error('[handleMagicLink] signInWithOtp error:', error);
			throw error;
		}

		console.log('[handleMagicLink] Magic link sent');
		return {
			success: true,
			message: 'Please check your email for a magic link to log in.'
		};
	} catch (error) {
		console.error('[handleMagicLink] Unexpected error:', error);
		return {
			success: false,
			message: 'An unexpected error occurred',
			errors: {
				system: error instanceof Error ? error.message : 'Unknown error'
			}
		};
	}
}
