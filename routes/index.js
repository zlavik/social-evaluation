const express = require('express');

const router = express.Router();
const catchError = require('../lib/catch-error');

router.get(
  '/',
  catchError(async (req, res) => {
    const allUsersFromDb = await res.locals.store.sortUsers();
    const successMsg = res.locals.success;
    const personAdded = res.locals.personBeingAdded;
    allUsersFromDb.forEach((user, index) => {
      user.rank = index + 1;
    });

    res.render('index', {
      personAdded,
      users: allUsersFromDb,
      flash: req.flash(),
      redirectMsg: successMsg,
    });
  }),
);

module.exports = router;
