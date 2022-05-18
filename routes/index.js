const express = require('express');

const router = express.Router();
const catchError = require('../lib/catch-error');

router.get(
  '/',
  catchError(async (req, res) => {
    const allUsersFromDb = await res.locals.store.sortUsers();
    const v1 = res.locals.success;
    allUsersFromDb.forEach((user, index) => {
      user.rank = index + 1;
    });

    res.render('index', {
      users: allUsersFromDb,
      flash: req.flash(),
      redirectMsg: v1,
    });
  }),
);

module.exports = router;
