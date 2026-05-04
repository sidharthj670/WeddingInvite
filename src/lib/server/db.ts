import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../../../generated/prisma/client';
import { env } from '$env/dynamic/private';

let client: PrismaClient | undefined;

export function getDb(): PrismaClient {
	if (client) return client;
	const url = env.DATABASE_URL ?? 'file:./dev.db';
	const adapter = new PrismaBetterSqlite3({ url });
	client = new PrismaClient({ adapter });
	return client;
}
