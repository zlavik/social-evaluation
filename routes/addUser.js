const express = require('express');

const router = express.Router();
const TwitterApi = require('twitter-api-v2').default;
const Analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;
const catchError = require('../lib/catch-error');
const PgPersistence = require('../lib/database/pg-persistance');
const config = require('../lib/config');

const analyzer = new Analyzer('English', stemmer, 'afinn');

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

      if (!checkUserExists) {
        redirectMsg = `${twitterUser.data.name} added!`;
        await res.locals.store.addUser(twitterUser.data.username, twitterUser.data.name, twitterUser.data.profile_image_url.replace('_normal', ''), twitterUser.data.id, twitterUser.data.public_metrics.followers_count);
      } else {
        redirectMsg = `${twitterUser.data.name} updated!`;
      }

      const userTimeline = await client.v2.userTimeline(
        twitterUser.data.id,
        {
          max_results: 100,
          exclude: 'retweets',
        },
      );

      if (!userTimeline.done) {
        while (!userTimeline.done) {
          const tweets = await userTimeline.fetchLast(250);
          for await (const tweet of tweets) {
            totalScore += analyzer.getSentiment(tweet.text.split(' '));
            tweetCount++;
          }
        }
      } else {
        for await (const tweet of userTimeline) {
          totalScore += analyzer.getSentiment(tweet.text.split(' '));
          tweetCount++;
        }
      }

      totalScore = ((totalScore / tweetCount) * 100).toFixed(2);
      if (isNaN(totalScore)) {
        totalScore = 0;
      }

      await res.locals.store.updateUserScore(totalScore, twitterUser.data.id);

      res.redirectFlash(302, '/', {
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
