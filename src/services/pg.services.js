const pg = require("../connections/pg");

function initialize() {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS database_tables (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      columns JSONB NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS spreadsheets (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      headers JSONB NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS syncs (
      id SERIAL PRIMARY KEY,
      database_table_id INT REFERENCES database_tables(id),
      spreadsheet_id INT REFERENCES spreadsheets(id)
    );
  `;

  pg.query(createTablesQuery, (err, result) => {
    if (err) {
      console.error("Error creating tables:", err);
    } else {
      console.log("Tables created successfully");
    }
  });
}

initialize();

function createTable(name) {
  return new Promise((resolve, reject) => {
    const checkTableExistsQuery = `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_name = '${name}'
        );
      `;

    pg.query(checkTableExistsQuery, (err, result) => {
      if (err) {
        console.error("Error checking table existence:", err);
        reject(err);
      } else if (result.rows[0].exists) {
        resolve(`Table ${name} already exists`);
      } else {
        const createTableQuery = `
            CREATE TABLE ${name} (
              id SERIAL PRIMARY KEY,
              -- Define your table columns here
            );
          `;

        pg.query(createTableQuery, (err, result) => {
          if (err) {
            console.error("Error creating table:", err);
            reject(err);
          } else {
            resolve(`Table ${name} created successfully`);
          }
        });
      }
    });
  });
}

function getTableColumns(tableName) {
  return new Promise((resolve, reject) => {
    const getColumnsQuery = `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position;
      `;

    pg.query(getColumnsQuery, (err, result) => {
      if (err) {
        console.error("Error retrieving table columns:", err);
        reject(err);
      } else {
        const columns = result.rows.map((row) => ({
          name: row.column_name,
          dataType: row.data_type,
        }));
        resolve(columns);
      }
    });
  });
}

function listTables() {}

function createSheet(url) {
  return new Promise((resolve, reject) => {
    const spreadsheetId = parseSpreadsheetIdFromUrl(url);

    if (sheetAlreadyExists) {
      resolve(`Sheet with ID ${spreadsheetId} already exists`);
    } else {
      resolve(`Sheet created with name: ${spreadsheetId}`);
    }
  });
}

function listSync() {
  return new Promise((resolve, reject) => {
    const listSyncQuery = `SELECT * FROM syncs`;
    pg.query(listSyncQuery, (err, result) => {
      if (err) {
        console.error("Error retrieving syncs:", err);
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
}

function createSync() {}

function parseSpreadsheetIdFromUrl(url) {
  const urlPattern = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(urlPattern);

  if (match && match[1]) {
    return match[1];
  } else {
    throw new Error("Invalid Google Sheets URL");
  }
}

// const sheet_id = parseSpreadsheetIdFromUrl("https://docs.google.com/spreadsheets/d/12vj5MqS8fjWfk-E7joQqQ6i3spEdZTK1oVhmuPoc6VQ/edit#gid=0")
// console.log(sheet_id)

module.exports = {
  createSync,
  listSync,
};
