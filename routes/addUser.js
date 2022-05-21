const express = require('express');

const router = express.Router();
const TwitterApi = require('twitter-api-v2').default;
const ml = require('ml-sentiment')();
const catchError = require('../lib/catch-error');
const PgPersistence = require('../lib/database/pg-persistance');
const config = require('../lib/config');

// create a new datastore
router.use((req, res, next) => {
  res.locals.store = new PgPersistence(req.session);
  next();
});

const client = new TwitterApi({
  appKey: config.CONSUMER_KEY,
  appSecret: config.CONSUMER_SECRET,
  accessToken: config.ACCESS_TOKEN_KEY,
  accessSecret: config.ACCESS_TOKEN_SECRET,
});

router.get(
  '/',
  catchError(async (req, res) => {
    const allUsersFromDb = await res.locals.store.sortUsers();
    allUsersFromDb.forEach((user, index) => {
      user.rank = index + 1;
    });
    res.render('addUser', {
      users: allUsersFromDb,
      flash: req.flash(),
    });
  }),
);

router.post(
  '/',
  catchError(async (req, res) => {
    const allUsersFromDb = await res.locals.store.sortUsers();
    let redirectMsg = '';
    let totalScore = 0;
    let tweetCount = 0;

    try {
      const handleName = req.body.handle;
      const twitterUser = await client.v2.userByUsername(handleName, { 'user.fields': ['profile_image_url', 'public_metrics'] });
      const checkUserExists = await res.locals.store.checkUserExists(twitterUser.data.id);

      const userTimeline = await client.v1.userTimeline(
        twitterUser.data.id,
        {
          count: 200,
          include_rts: false,
        },
      );
      const fetchedTweets = userTimeline.tweets;

      fetchedTweets.forEach((tweet) => {
        totalScore += ml.classify(tweet.full_text);
        tweetCount += 1;
      });

      totalScore = ((totalScore / tweetCount) * 100).toFixed(2);
      console.log(tweetCount);
      if (!checkUserExists) {
        redirectMsg = `${twitterUser.data.name} added! ${tweetCount} tweets were analyzed`;
        await res.locals.store.addUser(twitterUser.data.username, twitterUser.data.name, twitterUser.data.profile_image_url.replace('_normal', ''), twitterUser.data.id, twitterUser.data.public_metrics.followers_count);
      } else {
        redirectMsg = `${twitterUser.data.name} updated! ${tweetCount} tweets were analyzed`;
      }
      await res.locals.store.updateUserScore(totalScore, twitterUser.data.id);
      res.redirectFlash(302, '/', {
        personBeingAdded: twitterUser.data.username,
        success: redirectMsg,
      });
    } catch (err) {
      console.log(err);
      req.flash('error', 'User does not exist!');

      res.render('addUser', {
        users: allUsersFromDb,
        flash: req.flash(),
      });
    }
  }),
);

module.exports = router;
