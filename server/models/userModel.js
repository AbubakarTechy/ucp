const connectDB = require('../db');

const formatUser = (row) => {
  if (!row) {
    return null;
  }

  return {
    _id: String(row.id),
    id: String(row.id),
    name: row.name,
    email: row.email,
    password: row.password,
    googleId: row.google_id,
    authProvider: row.auth_provider,
    profilePic: row.profile_pic,
    plan: row.plan,
    downloadsCount: row.downloads_count,
    createdAt: row.created_at,
    role: 'user'
  };
};

const findUserByEmail = async (email, includePassword = false) => {
  const pool = await connectDB();
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = formatUser(res.rows[0]);

  if (user && !includePassword) {
    delete user.password;
  }

  return user;
};

const findUserById = async (id) => {
  const pool = await connectDB();
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [Number(id)]);
  const user = formatUser(res.rows[0]);

  if (user) {
    delete user.password;
  }

  return user;
};

const findUserByGoogleIdOrEmail = async (googleId, email) => {
  const pool = await connectDB();
  const res = await pool.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [googleId, email.toLowerCase()]);
  const user = formatUser(res.rows[0]);
  if (user) {
    delete user.password;
  }

  return user;
};

const createUser = async ({
  name,
  email,
  password = null,
  googleId = null,
  authProvider = 'local',
  profilePic = '',
  plan = 'Basic',
  downloadsCount = 0
}) => {
  const pool = await connectDB();
  const res = await pool.query(`
    INSERT INTO users (name, email, password, google_id, auth_provider, profile_pic, plan, downloads_count)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `, [
    name.trim(),
    email.toLowerCase().trim(),
    password,
    googleId,
    authProvider,
    profilePic,
    plan,
    downloadsCount
  ]);

  return findUserById(res.rows[0].id);
};

const updateUser = async (id, fields) => {
  const pool = await connectDB();
  const allowedFields = {
    name: 'name',
    email: 'email',
    password: 'password',
    googleId: 'google_id',
    authProvider: 'auth_provider',
    profilePic: 'profile_pic',
    plan: 'plan',
    downloadsCount: 'downloads_count'
  };

  const updates = [];
  const values = [];
  let paramCount = 1;

  Object.entries(fields).forEach(([key, value]) => {
    const column = allowedFields[key];
    if (column !== undefined) {
      updates.push(`${column} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (updates.length === 0) {
    return findUserById(id);
  }

  values.push(Number(id));
  await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`, values);

  return findUserById(id);
};

const getAllUsers = async () => {
  const pool = await connectDB();
  const res = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  return res.rows.map((row) => {
    const user = formatUser(row);
    delete user.password;
    return user;
  });
};

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByGoogleIdOrEmail,
  createUser,
  updateUser,
  getAllUsers
};
