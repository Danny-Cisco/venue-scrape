import { SupabaseClient } from '@supabase/supabase-js';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

const fromDb = <T = unknown>(row: unknown): T => camelcaseKeys(row as any, { deep: true }) as T;
const toDb = <T = unknown>(obj: T): Record<string, unknown> =>
	snakecaseKeys(obj as any, { deep: true });

export const db = (sb: SupabaseClient) => ({
	insert: async <T>(table: string, record: T) =>
		sb.from(table).insert(toDb(record)).select().single(),

	update: async <T>(table: string, idCol: string, id: string | number, patch: Partial<T>) =>
		sb.from(table).update(toDb(patch)).eq(idCol, id).select().single(),

	all: async <T>(table: string, filter?: (q: any) => any) => {
		let q = sb.from(table).select('*');
		if (filter) q = filter(q);
		const { data, error } = await q;
		if (error) throw error; // bubble up to endpoint
		return (data as unknown[]).map(fromDb<T>);
	}
});
