var Airtable = require("airtable");
var config = require("../config/airtable.config");
const Atcoder = require("../models/atcoder.model");

var base = new Airtable({ apiKey: config.APIKEY }).base(config.BASE_ID);

const synchronizeRecords = async () => {
  try {
    const airtableRecords = await base(config.TABLE_NAME).select().all();
    const postgresRecords = await Atcoder.findAll();
    const recordsToInsert = [];
    const recordsToUpdate = [];
    const recordsToDelete = [];
    airtableRecords.forEach((airtableRecord) => {
      const airtableUniqueId = airtableRecord.get(
        config.UNIQUEIDENTIFIERCOLUMN
      );

      const matchingPostgresRecord = postgresRecords.find(
        (postgresRecord) => postgresRecord.slack_username === airtableUniqueId
      );

      if (matchingPostgresRecord) {
        if (shouldUpdateRecord(airtableRecord, matchingPostgresRecord)) {
          recordsToUpdate.push(airtableRecord);
        }
      } else {
        recordsToInsert.push(airtableRecord);
      }
      postgresRecords.forEach((postgresRecord) => {
        const matchingAirtableRecord = airtableRecords.find(
          (record) =>
            record.get(config.UNIQUEIDENTIFIERCOLUMN) ===
            postgresRecord.slack_username
        );

        if (!matchingAirtableRecord) {
          recordsToDelete.push(postgresRecord);
        }
      });
    });
    // Perform the necessary operations in MySQL
    insertRecords(recordsToInsert);
    updateRecords(recordsToUpdate);
    deleteRecords(recordsToDelete);
  } catch (error) {
    console.error("Error occurred during synchronization:", error);
  }
};

function shouldUpdateRecord(airtableRecord, postgresRecord) {
  // Get field names of the Airtable record
  const airtableFields = Object.keys(airtableRecord.fields);

  // Iterate over each field
  for (let i = 0; i < airtableFields.length; i++) {
    const fieldName = airtableFields[i];
    const airtableValue = airtableRecord.get(fieldName);
    const mysqlValue = postgresRecord[fieldName];

    // Compare field values
    if (airtableValue !== mysqlValue) {
      return true; // Record should be updated
    }
  }

  return false; // Record does not need to be updated
}

// Function to insert records
function insertRecords(recordsToInsert) {
  recordsToInsert.forEach((record) => {
    const newAtcoder = new Atcoder(record.fields);
    Atcoder.insert(newAtcoder)
      .then((result) => {
        return
      })
      .catch((error) => {
        console.error("Error inserting Atcoder:", error);
      });
  });
}

// Function to update records
function updateRecords(recordsToUpdate) {
  recordsToUpdate.forEach((record) => {
    const { slack_username, ...updatedFields } = record.fields;
    Atcoder.update(slack_username, updatedFields)
      .then((result) => {
        return
      })
      .catch((error) => {
        console.error("Error updating Atcoder:", error);
      });
  });
}

// Function to delete records
function deleteRecords(recordsToDelete) {
  recordsToDelete.forEach((record) => {
    const { slack_username } = record;
    Atcoder.remove(slack_username)
      .then((result) => {
        return
      })
      .catch((error) => {
        console.error("Error deleting Atcoder:", error);
      });
  });
}

module.exports = synchronizeRecords;
