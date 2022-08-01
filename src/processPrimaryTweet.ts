export async function processPrimaryTweet(userTargetTweet: any, requestedUserTwitterID: string) {
  return new Promise((resolve, reject) => {
    try {
      const tweetID: string = userTargetTweet.id_str;
      const tweetText: string = userTargetTweet.full_text;
      const tweetTextWithoutURL: string = tweetText.replace(/https?:\/\/\S+/g, "");
      const addBitcoinToTweet: string = tweetTextWithoutURL.replace(/#[Bb][iI][tT][cC][oO][Ii][nN]/g, "#Bitcoin *₿*");
      const tweetAuthorId: string = userTargetTweet.user.id_str;
      const tweetUserName: string = userTargetTweet.user.screen_name;
      const tweetName: string = userTargetTweet.user.name;
      const tweetVerified: boolean = userTargetTweet.user.verified;
      const tweetProfileImageUrlSmall: string = userTargetTweet.user.profile_image_url_https;
      const tweetProfileImageUrl: string = tweetProfileImageUrlSmall.replace("_normal", "");
      const tweetUserId: string = userTargetTweet.user.id_str;
      const statusURL: string = `https://twitter.com/${tweetUserName}/status/${tweetID}`;
      let tweetMediaFile = "media" in userTargetTweet.entities ? userTargetTweet.entities.media[0].media_url_https : null;
      // Insert tweeted request into database
      resolve({ tweetID, addBitcoinToTweet, tweetAuthorId, tweetUserName, tweetName, tweetVerified, tweetProfileImageUrl, tweetMediaFile, tweetUserId, statusURL });
    } catch (err) {
      console.log("Error catched at processPrimaryTweet.ts: ", err);
      reject(err);
    }
  });
}
