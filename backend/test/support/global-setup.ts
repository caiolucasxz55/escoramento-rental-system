import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  var __MONGOD__: MongoMemoryServer | undefined;
}

// um Mongo em memoria para a rodada inteira; cada arquivo limpa o que usa
export default async function globalSetup(): Promise<void> {
  const mongod = await MongoMemoryServer.create();
  globalThis.__MONGOD__ = mongod;
  process.env.MONGODB_URI = mongod.getUri('escoramento-e2e');
}
