const sql = require("./db");

const Atcoder = function (atcoder) {
  this.slack_username = atcoder.slack_username;
  this.atcoder_username = atcoder.atcoder_username;
  this.highest_score = atcoder.highest_score;
  this.current_score = atcoder.current_score;
  this.num_competitions = atcoder.num_competitions;
  this.recent_competition = atcoder.recent_competition;
};

Atcoder.findAll = function () {
  return new Promise((resolve, reject) => {
    sql.query('SELECT * FROM public."Atcoder"', (err, res) => {
      if (err) {
        console.log("Error retrieving atcoder datas: ", err);
        reject(err);
        return;
      }

      const atcoder_datas = res.rows.map((data) => new Atcoder(data));
      resolve(atcoder_datas);
    });
  });
};

Atcoder.insert = function (newAtcoder) {
  return new Promise((resolve, reject) => {
    sql.query(
      'INSERT INTO public."Atcoder" (slack_username, atcoder_username, highest_score, current_score, num_competitions, recent_competition) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        newAtcoder.slack_username,
        newAtcoder.atcoder_username,
        newAtcoder.highest_score,
        newAtcoder.current_score,
        newAtcoder.num_competitions,
        newAtcoder.recent_competition,
      ],
      (err, res) => {
        if (err) {
          console.error("Error inserting atcoder data:", err);
          reject(err);
          return;
        }
        resolve(res.rowCount); // Resolve with the number of affected rows (1 for successful insert)
      }
    );
  });
};

Atcoder.update = function (slackUsername, updatedAtcoder) {
  return new Promise((resolve, reject) => {
    const {
      atcoder_username,
      highest_score,
      current_score,
      num_competitions,
      recent_competition,
    } = updatedAtcoder;

    const query =
      'UPDATE public."Atcoder" SET atcoder_username = $1, highest_score = $2, current_score = $3, num_competitions = $4, recent_competition = $5 WHERE slack_username = $6';

    sql.query(
      query,
      [
        atcoder_username,
        highest_score,
        current_score,
        num_competitions,
        recent_competition,
        slackUsername,
      ],
      (err, res) => {
        if (err) {
          console.error("Error updating Atcoder:", err);
          reject(err);
          return;
        }
        resolve(res.rowCount); // Resolve with the number of affected rows (1 for successful update)
      }
    );
  });
};

Atcoder.remove = function (slackUsername) {
  return new Promise((resolve, reject) => {
    sql.query(
      'DELETE FROM public."Atcoder" WHERE slack_username = ?',
      [slackUsername],
      (err, res) => {
        if (err) {
          console.error("Error deleting Atcoder:", err);
          reject(err);
          return;
        }
        resolve(res.rowCount); // Resolve with the number of affected rows (1 for successful delete)
      }
    );
  });
};

module.exports = Atcoder;
