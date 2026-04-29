const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5433,
  user: 'postgres',
  password: 'postgres',
  database: 'meraki_payment'
});

async function testConnection() {
  try {
    console.log('Tentando conectar...');
    await client.connect();
    console.log('✅ Conexão bem-sucedida!');
    const res = await client.query('SELECT version()');
    console.log('Versão do PostgreSQL:', res.rows[0].version);
    await client.end();
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
  }
}

testConnection();