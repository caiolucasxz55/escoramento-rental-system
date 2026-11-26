// Uso: npm run seed  (com o docker compose no ar e o backend/.env preenchido)
// Grava 30 solicitacoes ficticias. Rodar de novo substitui so as do seed.
import { createHash, randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import mongoose from 'mongoose';

if (existsSync('.env')) process.loadEnvFile('.env');
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI nao definida (copie backend/.env.example para backend/.env)');
  process.exit(1);
}

const SEED_DOMAIN = 'seed.escoramento.test';
const COLLECTION = 'rental_requests';

const COMPANIES = [
  'Construtora Horizonte', 'Engenharia Pilar Forte', 'Obras Vale Verde', 'Residencial Aurora',
  'Construtora Monte Alto', 'Galpoes Rio Claro', 'Edificios Bela Vista', 'Reformas Nova Era',
  'Construtora Pedra Azul', 'Incorporadora Solar', 'Obras Serra Dourada', 'Engenharia Atlas',
  'Construtora Primavera', 'Lajes e Formas Ltda', 'Construtora Jardim Sul',
];
const ITEMS = [
  'escoras metalicas', 'vigas de aluminio', 'pontaletes', 'torres de escoramento', 'formas para laje',
];
// 30 no total, em todos os status, para a listagem ter o que filtrar
const STATUSES = [
  ...Array(12).fill('PENDING'),
  ...Array(8).fill('UNDER_REVIEW'),
  ...Array(6).fill('APPROVED'),
  ...Array(4).fill('CANCELLED'),
];

const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');
const DAY = 24 * 60 * 60 * 1000;

const now = Date.now();
const docs = STATUSES.map((status, i) => {
  const company = COMPANIES[i % COMPANIES.length];
  const createdAt = new Date(now - (30 - i) * DAY);
  return {
    name: `${company} ${i + 1}`,
    email: `contato${i + 1}@${SEED_DOMAIN}`,
    phone: `1199${String(1000000 + i).padStart(7, '0')}`,
    description: `Locacao de ${10 + (i % 5) * 10} ${ITEMS[i % ITEMS.length]} por ${15 + (i % 4) * 15} dias (dado ficticio).`,
    status,
    consultationTokenHash: sha256(randomBytes(32).toString('base64url')),
    files: [],
    createdAt,
    updatedAt: status === 'PENDING' ? createdAt : new Date(createdAt.getTime() + DAY),
  };
});

// a mais recente recebe um token conhecido, para testar a consulta publica
const demoToken = randomBytes(32).toString('base64url');
docs[docs.length - 1].consultationTokenHash = sha256(demoToken);

await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
const collection = mongoose.connection.collection(COLLECTION);

const seedFilter = { email: { $regex: `@${SEED_DOMAIN.replaceAll('.', '\\.')}$` } };
const { deletedCount } = await collection.deleteMany(seedFilter);
const { insertedIds } = await collection.insertMany(docs);
const demoId = insertedIds[docs.length - 1];

console.log(`Seed: ${docs.length} solicitacoes gravadas (${deletedCount} do seed anterior substituidas).`);
console.log('Para testar a consulta publica (/status):');
console.log(`  identificador: ${demoId}`);
console.log(`  token:         ${demoToken}`);
await mongoose.disconnect();
