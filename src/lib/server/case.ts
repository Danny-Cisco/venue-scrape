import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

/** db → app (snake ➜ camel) */
export const fromDb = <T = unknown>(row: unknown): T =>
	camelcaseKeys(row as any, { deep: true }) as T;

/** app → db (camel ➜ snake) */
export const toDb = <T = unknown>(obj: T): Record<string, unknown> =>
	snakecaseKeys(obj as any, { deep: true });

export const manyFromDb = <T = unknown>(rows: unknown[]) => rows.map((r) => fromDb<T>(r));
export const manyToDb = (objs: unknown[]) => objs.map(toDb);
