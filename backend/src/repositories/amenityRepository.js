const pool = require("../config/db");

const findAll = async () => {
  const [rows] = await pool.query(
    "SELECT id, name, created_at FROM amenities ORDER BY name ASC"
  );
  return rows;
};

const findByName = async (name) => {
  const [rows] = await pool.query("SELECT id, name FROM amenities WHERE name = ?", [name]);
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query("SELECT id, name FROM amenities WHERE id = ?", [id]);
  return rows[0] || null;
};

const create = async (name) => {
  const [result] = await pool.query("INSERT INTO amenities(name) VALUES (?)", [name]);
  return result.insertId;
};

const remove = async (id) => {
  await pool.query("DELETE FROM amenities WHERE id = ?", [id]);
};

module.exports = {
  findAll,
  findByName,
  findById,
  create,
  remove
};
