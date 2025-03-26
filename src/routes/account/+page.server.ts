import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(303, '/not-logged-in');
	}

	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select(`username, avatar_url`)
		.eq('id', session.user.id)
		.single();

	if (profileError) {
		console.error('Error fetching profile:', profileError);
		// Return empty profile rather than failing completely
		return { session, profile: { username: null, avatar_url: null } };
	}

	return { session, profile };
};

export const actions: Actions = {
	update: async ({ request, locals: { supabase, safeGetSession } }) => {
		try {
			const { session } = await safeGetSession();

			if (!session) {
				return fail(401, {
					message: 'Not authenticated',
					success: false
				});
			}

			const formData = await request.formData();
			const username = formData.get('username') as string;
			const avatarUrl = formData.get('avatarUrl') as string;

			const { error } = await supabase.from('profiles').upsert({
				id: session.user.id,
				username: username || null, // Handle empty string case
				avatar_url: avatarUrl || null,
				updated_at: new Date().toISOString() // Use ISO string for consistency
			});

			if (error) {
				console.error('Profile update error:', error);
				return fail(500, {
					success: false,
					message: 'Failed to update profile',
					username,
					avatarUrl
				});
			}

			return {
				success: true,
				message: 'Profile updated successfully',
				username,
				avatarUrl
			};
		} catch (error) {
			console.error('Unexpected error during profile update:', error);
			return fail(500, {
				success: false,
				message: 'An unexpected error occurred'
			});
		}
	},

	signout: async ({ locals: { supabase, safeGetSession } }) => {
		try {
			const { session } = await safeGetSession();
			if (!session) {
				return fail(401, {
					message: 'Not authenticated',
					success: false
				});
			}

			const { error } = await supabase.auth.signOut();

			if (error) {
				return fail(500, {
					message: 'Failed to sign out',
					success: false
				});
			}

			throw redirect(303, '/');
		} catch (error) {
			if (error instanceof Response) throw error; // Rethrow redirect
			return fail(500, {
				message: 'An unexpected error occurred during sign out',
				success: false
			});
		}
	}
};
