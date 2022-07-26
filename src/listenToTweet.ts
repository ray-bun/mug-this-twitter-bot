import { ETwitterStreamEvent, TwitterApi } from "twitter-api-v2";
import "./lib/env";
import { processPrimaryTweet } from "./processPrimaryTweet";
import { createBannerBear } from "./createBannerBear";
import { createNewTweetRequest, checkNumberOfRequests } from "./models/mug-this.server";
import { postToTwitter, requestReceivedTweet } from "./postToTwitter";
export async function listenToTwit() {
  try {
    const client = new TwitterApi(process.env.BEARER_TOKEN);
    // const client = new TwitterApi({
    //   appKey: process.env.TWITTER_API_KEY,
    //   appSecret: process.env.TWITTER_API_SECRET,
    //   accessToken: process.env.TWITTER_ACCESS_TOKEN,
    //   accessSecret: process.env.TWITTER_ACCESS_SECRET,
    // });
    // Get and delete old rules if needed
    const rules = await client.v2.streamRules();
    console.log(rules);
    if (rules.data?.length) {
      await client.v2.updateStreamRules({
        delete: { ids: rules.data.map((rule) => rule.id) },
      });
    }

    // Add our rules.
    await client.v2.updateStreamRules({
      add: [{ value: `(@${process.env.TWITTER_USER_ID}) -is:retweet -is:quote` }],
    });
    const stream = await client.v2.searchStream({
      "tweet.fields": ["referenced_tweets", "author_id", "in_reply_to_user_id", "created_at"],
      expansions: ["referenced_tweets.id", "author_id", "in_reply_to_user_id", "entities.mentions.username", "referenced_tweets.id.author_id"],
    });
    // Enable auto reconnect
    stream.autoReconnect = true;

    stream.on(ETwitterStreamEvent.Data, async (tweet: any) => {
      const tweetData = tweet.data;
      console.log("tweetData", tweetData);
      const tweetFulltext: string = tweetData.text;
      const lowerCaseTweetFulltext: string = tweetFulltext.toLowerCase();
      const regexTweetText = new RegExp("@" + process.env.TWITTER_USER_ID);
      const commandMatched = lowerCaseTweetFulltext.match(regexTweetText);
      const checkForPrimiaryTweet = "referenced_tweets" in tweetData;
      const countHowManyAt = (tweetFulltext.match(/@/g) || []).length;
      console.log(`Primary tweet: ${checkForPrimiaryTweet} @ count: ${countHowManyAt}`);
      if (commandMatched != null && commandMatched.length && checkForPrimiaryTweet) {
        const checkTodayRequests = await checkNumberOfRequests(tweetData.author_id);
        const numberOfRequests = Object.entries(checkTodayRequests).length;
        const getRequestedUser = await client.v1.user({ user_id: tweetData.author_id });
        const getInReplyUser = await client.v1.user({ user_id: tweetData.in_reply_to_user_id });
        const requestedUserScreenName = getRequestedUser.screen_name.toLocaleLowerCase();
        const inReplyUserScreenName = getInReplyUser.screen_name.toLocaleLowerCase();
        console.log(`requestedUserScreenName: ${requestedUserScreenName} inReplyUserScreenName: ${inReplyUserScreenName}`);
        if (numberOfRequests >= Number(process.env.ALLOWED_REQUESTS_PER_DAY) || requestedUserScreenName === process.env.TWITTER_USER_ID || inReplyUserScreenName === process.env.TWITTER_USER_ID) {
          console.log(`Exceeded Requests for today or invalid username: ${requestedUserScreenName} ${process.env.ALLOWED_REQUESTS_PER_DAY} | ${numberOfRequests}`);
        } else {
          console.log("24 hours requests: ", numberOfRequests);
          const getUserTargetTweet = await client.v1.singleTweet(tweetData.referenced_tweets[0].id);

          const checkIfRequestedIsNotPreviousRequestor = await checkNumberOfRequests(getUserTargetTweet.user.id_str);
          const notPreviousRequestorTweet = Object.entries(checkIfRequestedIsNotPreviousRequestor).length;

          const targetUsernameScreenName = getUserTargetTweet.user.screen_name.toLocaleLowerCase();
          console.log(`Target user: ${targetUsernameScreenName} Requested Username: ${requestedUserScreenName} Previous tweet reqestor: ${notPreviousRequestorTweet > 0} ${notPreviousRequestorTweet}`);
          if (targetUsernameScreenName !== process.env.TWITTER_USER_ID && notPreviousRequestorTweet === 0) {
            const cookingTweetID = await requestReceivedTweet(tweetData.id, requestedUserScreenName);
            const requestedUserProfileImageUrl: string = getRequestedUser.profile_image_url_https.replace("_normal", "");
            const requestedUser = { screen_name: requestedUserScreenName, profile_image_url_https: requestedUserProfileImageUrl };
            console.log("requestedUsername", requestedUser);

            // Process the tweet and insert into the database. We return the tweeted data
            const processedTweet = await processPrimaryTweet(getUserTargetTweet, tweetData.author_id);
            const insertNewTweetedRequest = await createNewTweetRequest(processedTweet, tweetData.author_id, requestedUser);
            const bannerBearGeneratedImages = await createBannerBear(processedTweet, tweetData.author_id, insertNewTweetedRequest.id, requestedUser);
            await postToTwitter(tweetData.id, requestedUserScreenName, bannerBearGeneratedImages, cookingTweetID);
          }
        }
      }
      console.log("Ignore this tweet");
    });
  } catch (err) {
    console.log("Catching error. Retrying in 60 seconds", err);
    setTimeout(() => listenToTwit(), 60000);
  }
}
