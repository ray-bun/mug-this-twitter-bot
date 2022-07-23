import { ETwitterStreamEvent, TwitterApi } from "twitter-api-v2";
import "./lib/env";
import { processPrimaryTweet } from "./processPrimaryTweet";
import { createBannerBear } from "./createBannerBear";
import { createNewTweetRequest } from "./models/mug-this.server";
import { postToTwitter } from "./postToTwitter";
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
      add: [{ value: `(@${process.env.TWITTER_USER_ID})` }],
    });

    const stream = await client.v2.searchStream({
      "tweet.fields": ["referenced_tweets", "author_id"],
      expansions: ["referenced_tweets.id"],
    });
    // Enable auto reconnect
    stream.autoReconnect = true;

    stream.on(ETwitterStreamEvent.Data, async (tweet: any) => {
      const tweetData = tweet.data;
      console.log("tweetData", tweetData);
      const tweetFulltext: string = tweetData.text;
      const lowerCaseTweetFulltext: string = tweetFulltext.toLowerCase();
      const regexTweetText = new RegExp("@" + process.env.TWITTER_USER_ID + " (![Mm][Aa][Kk][Ee])");
      const commandMatched = lowerCaseTweetFulltext.match(regexTweetText);
      if (commandMatched != null && commandMatched.length > 0) {
        const getRequestedUser = await client.v1.user({ user_id: tweetData.author_id });
        const requestedUserProfileImageUrl: string = getRequestedUser.profile_image_url_https.replace("_normal", "");

        const requestedUser = { screen_name: getRequestedUser.screen_name, profile_image_url_https: requestedUserProfileImageUrl };
        console.log("requestedUsername", requestedUser);

        const getUserTargetTweet = await client.v1.singleTweet(tweetData.referenced_tweets[0].id);
        // Process the tweet and insert into the database. We return the tweeted data
        const processedTweet = await processPrimaryTweet(getUserTargetTweet, tweetData.author_id);
        const insertNewTweetedRequest = await createNewTweetRequest(processedTweet, tweetData.author_id, requestedUser);
        const bannerBearGeneratedImages = await createBannerBear(processedTweet, tweetData.author_id, insertNewTweetedRequest.id, requestedUser);
        await postToTwitter(tweetData.id, getRequestedUser.screen_name, bannerBearGeneratedImages);
      }
    });
  } catch (err) {
    console.log("Catching error: ", err);
  }
}
