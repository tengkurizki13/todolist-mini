const mysql = require("mysql2/promise");

// // koneksi ke database mysql
const db = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  database: process.env.MYSQL_DBNAME || "todo",
  password: process.env.MYSQL_PASSWORD || "123123",
  waitForConnections: true,
  connectionLimit: 200,
  queueLimit: 0,
});

// migrasi database mysql
const migration = async () => {
  try {
    await db.query(
      `
      CREATE TABLE IF NOT EXISTS activities (
        activity_id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
        `
    );

    await db.query(
      `
      CREATE TABLE IF NOT EXISTS todos (
        todo_id INT PRIMARY KEY AUTO_INCREMENT,
        activity_group_id INT,
        title VARCHAR(255) NOT NULL,
        priority VARCHAR(255),
        is_active BOOLEAN,
        status VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
          `
    );
    console.log("Running Migration Successfully!");
  } catch (err) {
    throw err;
  }
};

// // TODO: Lengkapi fungsi dibawah ini untuk mengambil data didalam database
const find = async (table, field, filter = "") => {
  try {
    let query = `SELECT ${field},createdAt,updatedAt FROM ${table}`;

    if (filter !== "") {
      query += ` WHERE activity_group_id = '${filter}'`;
    }
    const connection = await db.getConnection();
    const [results] = await connection.query(query);
    return results;
  } catch (error) {
    console.log(error);
  }
};

const findOne = async (table, field, activity_id, conditionalField) => {
  try {
    const query = `SELECT ${field},createdAt,updatedAt FROM ${table} WHERE ${conditionalField} = '${activity_id}'`;
    const connection = await db.getConnection();
    const [results] = await connection.query(query);
    let data = results[0];
    return data;
  } catch (error) {
    console.log(error);
  }
};

const create = async (table, field, data, conditionalField) => {
  try {
    const query = `INSERT INTO ${table} (${field}) VALUES (${data})`;
    const connection = await db.getConnection();

    const results = await connection.query(query);
    const result = await findOne(
      table,
      field,
      results[0].insertId,
      conditionalField
    );
    const idData = {
      id: results[0].insertId,
    };
    if (result.is_active) {
      result.is_active = true;
    }
    const obj = { ...idData, ...result };
    return obj;
  } catch (error) {
    console.log(error);
  }
};

const destroy = async (table, activity_id, conditionalField) => {
  try {
    const query = `DELETE FROM ${table} WHERE ${conditionalField} = ?`;
    const connection = await db.getConnection();

    await connection.query(query, activity_id);
    connection.release();

    return parseInt(activity_id);
  } catch (error) {
    console.log(error);
  }
};

const update = async (table, field, id, data, conditionalField) => {
  try {
    const query = `UPDATE ${table} SET ${data} WHERE ${conditionalField} = ${id} `;
    const connection = await db.getConnection();
    await connection.query(query);
    connection.release();
    const result = await findOne(table, field, id, conditionalField);
    const idData = {
      id,
    };
    const obj = { ...idData, ...result };
    return obj;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  migration,
  find,
  create,
  update,
  destroy,
  findOne,
};
