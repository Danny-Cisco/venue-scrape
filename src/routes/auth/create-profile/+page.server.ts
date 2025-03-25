import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

function generateUsername(email: string): string {
	if (!email) throw new Error('Email is required');
	const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
	return `${username}${Math.floor(Math.random() * 1000)}`;
}

export const load: PageServerLoad = async ({ locals: { supabase, getSession } }) => {
	const session = await getSession();

	if (!session) {
		throw redirect(303, '/auth/login');
	}

	try {
		const { error: insertError } = await supabase
			.from('profiles')
			.insert({
				id: session.user.id,
				email: session.user.email,
				username: generateUsername(session.user.email || ''),
				created_at: new Date().toISOString()
			})
			.single();

		if (insertError) {
			console.error('Error creating profile:', insertError);
			throw redirect(303, '/auth/error');
		}

		throw redirect(303, '/auth/load-profile');
	} catch (error) {
		console.error('Profile creation error:', error);
		throw redirect(303, '/auth/error');
	}
};
