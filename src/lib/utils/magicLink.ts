export async function handleMagicLink(
	email: string,
	supabase: any
): Promise<{ success: boolean; message: string; errors?: any }> {
	const validEmail = /^[\w-\.+]+@([\w-]+\.)+[\w-]{2,8}$/.test(email);

	if (!email) {
		return {
			success: false,
			message: 'Email is required',
			errors: { email: 'Email is required' }
		};
	}

	if (!validEmail) {
		return {
			success: false,
			message: 'Please enter a valid email address',
			errors: { email: 'Invalid email format' }
		};
	}

	try {
		// Get the current URL origin
		const baseUrl = window.location.origin;
		const redirectUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${redirectUrl}auth/confirm`,
				redirectTo: redirectUrl
			}
		});

		if (error) throw error;

		return {
			success: true,
			message: 'Please check your email for a magic link to log in.'
		};
	} catch (error) {
		return {
			success: false,
			message: 'An unexpected error occurred',
			errors: {
				system: error instanceof Error ? error.message : 'Unknown error'
			}
		};
	}
}
