// Uso: npm run hash-password -- "sua-senha"
// Cole a saida em ADMIN_PASSWORD_HASH no backend/.env
import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Uso: npm run hash-password -- "sua-senha"');
  process.exit(1);
}

console.log(bcrypt.hashSync(password, 12));
