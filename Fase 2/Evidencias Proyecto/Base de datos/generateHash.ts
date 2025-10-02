import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 10);
  console.log('Hash generado:', hashed);
}

generateHash();
