// src/routes/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();

	// if the user is already logged in return them to the account page
	if (session) {
		redirect(303, '/account');
	}

	return { url: url.origin };
};

export const actions: Actions = {
	default: async (event) => {
		const {
			url,
			request,
			locals: { supabase }
		} = event;

		try {
			const formData = await request.formData();
			const email = formData.get('email') as string;

			console.log('Received email:', email); // Log the received email

			const validEmail = /^[\w-\.+]+@([\w-]+\.)+[\w-]{2,8}$/.test(email);

			if (!email) {
				console.log('Email is empty');
				return fail(400, {
					errors: { email: 'Email is required' },
					email: '',
					success: false,
					details: 'No email provided'
				});
			}

			if (!validEmail) {
				console.log('Invalid email format:', email);
				return fail(400, {
					errors: { email: 'Please enter a valid email address' },
					email,
					success: false,
					details: 'Email format validation failed'
				});
			}

			console.log('Attempting to sign in with OTP for email:', email);
			const { error } = await supabase.auth.signInWithOtp({ email });

			if (error) {
				console.error('Supabase OTP error:', {
					message: error.message,
					status: error.status,
					name: error.name,
					details: error
				});

				return fail(400, {
					success: false,
					email,
					message: 'Authentication failed',
					errors: {
						email: 'Authentication failed',
						details: error.message
					},
					details: {
						errorMessage: error.message,
						errorStatus: error.status,
						errorName: error.name
					}
				});
			}

			console.log('OTP sign-in successful for:', email);
			return {
				success: true,
				message: 'Please check your email for a magic link to log into the website.',
				email
			};
		} catch (error) {
			console.error('Unexpected error in auth action:', error);
			return fail(500, {
				success: false,
				message: 'An unexpected error occurred',
				errors: {
					system: error instanceof Error ? error.message : 'Unknown error'
				},
				details:
					error instanceof Error
						? {
								name: error.name,
								message: error.message,
								stack: error.stack
							}
						: 'Unknown error structure'
			});
		}
	}
};
