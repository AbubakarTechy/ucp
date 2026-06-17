const connectDB = require('../db');

const formatNote = (row) => {
  if (!row) {
    return null;
  }

  return {
    _id: String(row.id),
    id: String(row.id),
    title: row.title,
    subject: row.subject,
    semester: row.semester,
    type: row.type,
    fileUrl: row.file_url,
    cloudinaryUrl: row.cloudinary_url,
    localFilename: row.local_filename,
    uploadedBy: row.uploaded_by,
    uploadedByEmail: row.uploaded_by_email,
    downloads: row.downloads,
    createdAt: row.created_at
  };
};

const SELECT_FIELDS = 'id, title, subject, semester, type, file_url, cloudinary_url, local_filename, uploaded_by, uploaded_by_email, downloads, created_at';

const getAllNotes = async ({ sort = 'latest', limit } = {}) => {
  const pool = await connectDB();
  let orderBy = 'created_at DESC';
  let sql = `SELECT ${SELECT_FIELDS} FROM notes`;
  const params = [];

  if (sort === 'downloads') {
    sql += ' WHERE downloads > 0';
    orderBy = 'downloads DESC';
  }

  sql += ` ORDER BY ${orderBy}`;

  if (limit) {
    sql += ` LIMIT $${params.length + 1}`;
    params.push(parseInt(limit, 10));
  }

  const res = await pool.query(sql, params);
  return res.rows.map(formatNote);
};

const getNoteById = async (id) => {
  const pool = await connectDB();
  const res = await pool.query(`SELECT ${SELECT_FIELDS} FROM notes WHERE id = $1`, [Number(id)]);
  return formatNote(res.rows[0]);
};

const getNoteFileData = async (id) => {
  const pool = await connectDB();
  const res = await pool.query('SELECT file_data FROM notes WHERE id = $1', [Number(id)]);
  return res.rows[0] ? res.rows[0].file_data : null;
};

const createNote = async ({
  title,
  subject,
  semester,
  type,
  fileUrl,
  cloudinaryUrl = '',
  localFilename = '',
  uploadedBy,
  uploadedByEmail,
  downloads = 0,
  fileData = null
}) => {
  const pool = await connectDB();
  const res = await pool.query(`
    INSERT INTO notes (
      title, subject, semester, type, file_url, cloudinary_url, local_filename,
      uploaded_by, uploaded_by_email, downloads, file_data
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id
  `, [
    title,
    subject,
    semester,
    type,
    fileUrl,
    cloudinaryUrl,
    localFilename,
    uploadedBy,
    uploadedByEmail.toLowerCase(),
    downloads,
    fileData
  ]);

  const newId = res.rows[0].id;
  if (fileUrl === '/api/notes/db/file') {
    const realFileUrl = `/api/notes/${newId}/file`;
    await pool.query('UPDATE notes SET file_url = $1 WHERE id = $2', [realFileUrl, newId]);
  }

  return getNoteById(newId);
};

const searchNotes = async (query) => {
  const pool = await connectDB();
  const pattern = `%${query}%`;
  const res = await pool.query(`
    SELECT ${SELECT_FIELDS} FROM notes
    WHERE title ILIKE $1 OR subject ILIKE $2
    ORDER BY created_at DESC
  `, [pattern, pattern]);

  return res.rows.map(formatNote);
};

const getNotesBySemester = async (semester) => {
  const pool = await connectDB();
  const res = await pool.query(`SELECT ${SELECT_FIELDS} FROM notes WHERE semester = $1 ORDER BY created_at DESC`, [semester]);
  return res.rows.map(formatNote);
};

const getNotesByUploaderEmail = async (email) => {
  const pool = await connectDB();
  const res = await pool.query(`SELECT ${SELECT_FIELDS} FROM notes WHERE uploaded_by_email = $1 ORDER BY created_at DESC`, [email.toLowerCase()]);
  return res.rows.map(formatNote);
};

const incrementNoteDownloads = async (id) => {
  const pool = await connectDB();
  await pool.query('UPDATE notes SET downloads = downloads + 1 WHERE id = $1', [Number(id)]);
  return getNoteById(id);
};

const deleteNoteById = async (id) => {
  const pool = await connectDB();
  const res = await pool.query('DELETE FROM notes WHERE id = $1', [Number(id)]);
  return res.rowCount > 0;
};

module.exports = {
  getAllNotes,
  getNoteById,
  getNoteFileData,
  createNote,
  searchNotes,
  getNotesBySemester,
  getNotesByUploaderEmail,
  incrementNoteDownloads,
  deleteNoteById
};
