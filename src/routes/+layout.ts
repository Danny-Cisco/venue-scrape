// src/routes/+layout.ts
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = isBrowser()
		? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: {
					fetch
				}
			})
		: createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: {
					fetch
				},
				cookies: {
					getAll() {
						return data.cookies;
					}
				}
			});

	// Fetch the session
	const {
		data: { session }
	} = await supabase.auth.getSession();

	// Fetch the profile if the session exists
	let profile = null;
	if (session) {
		const { data, error } = await supabase
			.from('profiles')
			.select('username, avatar_url')
			.eq('id', session.user.id)
			.single();

		if (error) {
			console.error('Error fetching profile:', error);
		} else {
			profile = data;
		}
	}

	return { supabase, session, profile };
};
