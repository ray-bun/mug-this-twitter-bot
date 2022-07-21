import axios from "axios";

type TweetDataType = {
  author_id?: String;
  id: String;
  referenced_tweets?: Array<{ type: String; id: String }>;
  text: String;
};

type ProcessedTweetType = {
  data: {
    data: Array<{
      author_id: string;
      id: string;
      text: string;
    }>;
    includes: {
      users: Array<{
        username: string;
        name: string;
        verified: boolean;
        profile_image_url: string;
        id: string;
      }>;
    };
  };
};

export async function extractTweetAndClean(tweetData: TweetDataType) {
  try {
    //
    const { data }: ProcessedTweetType = await axios.get(`https://oohuzinyb7.execute-api.us-east-1.amazonaws.com/find?tweet_id=${tweetData.referenced_tweets[0]?.id}`);

    const tweetObj = data.data[0];
    const usersObjIncludes = data.includes.users[0];
    const tweetID: string = tweetObj.id;
    const tweetText: string = tweetObj.text;
    const tweetTextWithoutURL: string = tweetText.replace(/https?:\/\/\S+/g, "");
    const tweetAuthorId: string = tweetObj.author_id;
    const tweetUserName: string = usersObjIncludes.username;
    const tweetName: string = usersObjIncludes.name;
    const tweetVerified: boolean = usersObjIncludes.verified;
    const tweetProfileImageUrl: string = usersObjIncludes.profile_image_url;
    const tweetUserId: string = usersObjIncludes.id;
    const statusURL: string = `https://twitter.com/${tweetUserName}/status/${tweetID}`;
    return { tweetID, tweetTextWithoutURL, tweetAuthorId, tweetUserName, tweetName, tweetVerified, tweetProfileImageUrl, tweetUserId, statusURL };
  } catch (err) {
    console.log("Error catched at extractTweetAndClean.ts: ", err);
  }
}
