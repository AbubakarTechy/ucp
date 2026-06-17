const { Pool } = require('pg');

let pool = null;
let initPromise = null;

async function initSchema(p) {
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        auth_provider VARCHAR(50) NOT NULL DEFAULT 'local',
        profile_pic TEXT NOT NULL DEFAULT '',
        plan VARCHAR(50) NOT NULL DEFAULT 'Basic',
        downloads_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        file_url TEXT NOT NULL,
        cloudinary_url TEXT NOT NULL DEFAULT '',
        local_filename TEXT NOT NULL DEFAULT '',
        uploaded_by VARCHAR(255) NOT NULL,
        uploaded_by_email VARCHAR(255) NOT NULL,
        downloads INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        file_data BYTEA
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      CREATE INDEX IF NOT EXISTS idx_notes_semester ON notes(semester);
      CREATE INDEX IF NOT EXISTS idx_notes_uploaded_by_email ON notes(uploaded_by_email);
    `);
    console.log('PostgreSQL schema initialized successfully.');
  } catch (err) {
    console.error('Error initializing PostgreSQL schema:', err.message);
    throw err;
  }
}

async function connectDB() {
  if (pool) {
    if (initPromise) {
      await initPromise;
    }
    return pool;
  }

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is missing.');
  }

  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  initPromise = initSchema(pool).then(() => {
    initPromise = null;
  });

  await initPromise;
  return pool;
}

module.exports = connectDB;
