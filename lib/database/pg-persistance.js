const { dbQuery } = require('./db-query');
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

module.exports = class PgPersistence {
  async addUser(handle, displayName, imageSrc, id, followerCount) {
    const ADD_USER = 'INSERT INTO users '
            + '(handle, displayName, imageSrc, id, followerCount) '
            + 'VALUES ($1, $2, $3, $4, $5)';

    const result = await dbQuery(ADD_USER, handle, displayName, imageSrc, id, followerCount);
    return result.rowCount > 0;
  }

  async updateUserScore(score, id) {
    const UPDATE_SCORE = 'UPDATE users '
            + 'SET userTotalScore = $1 '
            + 'WHERE id = $2';

    const result = await dbQuery(UPDATE_SCORE, score, id);
    return result.rowCount > 0;
  }

  async loadUsers() {
    const FIND_USER = 'SELECT * FROM users';
    const result = await dbQuery(FIND_USER);
    return result.rows;
  }

  // checks if the user already exists in db
  async checkUserExists(id) {
    const FIND_USER = 'SELECT * FROM users'
            + ' WHERE id = $1';
    const result = await dbQuery(FIND_USER, id);
    return result.rowCount === 1;
  }

  async sortUsers() {
    const SORTED_USERS = 'SELECT * FROM users'
            + ' ORDER BY userTotalScore desc';
    const result = await dbQuery(SORTED_USERS);
    return result.rows;
  }

  // clearSessionData(session) {
  //     delete session.email;
  //     delete session.username;
  //     delete session.signedin;
  // }

  // Returns `true` if `error` seems to indicate a `UNIQUE` constraint
  // violation, `false` otherwise.
  isUniqueConstraintViolation(error) {
    return /duplicate key value violates unique constraint/.test(String(error));
  }
};
