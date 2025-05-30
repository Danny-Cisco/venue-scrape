import { SupabaseClient } from '@supabase/supabase-js';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

// Proper deep camelCase conversion for nested Supabase joins
function camelDeep(input: any): any {
	if (Array.isArray(input)) {
		return input.map(camelDeep);
	} else if (input !== null && typeof input === 'object') {
		const camel = camelcaseKeys(input, { deep: false });
		for (const key in camel) {
			camel[key] = camelDeep(camel[key]);
		}
		return camel;
	}
	return input;
}

// Converts a single DB row (snake_case → camelCase)
const fromDb = <T = unknown>(row: unknown): T => camelDeep(row) as T;

// Converts a single input object (camelCase → snake_case)
const toDb = <T = unknown>(obj: T): Record<string, unknown> =>
	snakecaseKeys(obj as any, { deep: true });

// The DB wrapper using Supabase client
export const db = (sb: SupabaseClient) => ({
	insert: async <T>(table: string, record: T) =>
		sb.from(table).insert(toDb(record)).select().single(),

	update: async <T>(table: string, idCol: string, id: string | number, patch: Partial<T>) =>
		sb.from(table).update(toDb(patch)).eq(idCol, id).select().single(),

	all: async <T>(table: string, filter?: (q: any) => any): Promise<T[]> => {
		let q = sb.from(table).select('*');
		if (filter) q = filter(q);
		const { data, error } = await q;
		if (error) throw error;
		return (data as unknown[]).map(fromDb<T>);
	},

	upsert: async <T>(table: string, record: T, opts: { onConflict: string[] }) =>
		sb
			.from(table)
			.upsert(toDb(record), opts)
			.select()
			.single()
			.then(({ data, error }) =>
				error ? { data: null, error } : { data: fromDb<T>(data), error: null }
			)
});
