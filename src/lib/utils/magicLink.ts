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
		// Helper to get the base URL of your application
		const getURL = () => {
			const url = window.location.origin;
			return url.endsWith('/') ? url : `${url}/`;
		};

		// Now using /auth/confirm as your callback route
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				// The immediate redirect after clicking the email link
				emailRedirectTo: `${getURL()}auth/confirm`,
				// Where they should end up after authentication
				redirectTo: `${getURL()}` // or whatever your final destination is
			}
		});

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
