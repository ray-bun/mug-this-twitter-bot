import Bannerbear from "bannerbear";
import axios from "axios";
import { insertBannerBear } from "./models/mug-this.server";
import "./lib/env";
const bb = new Bannerbear(process.env.BANNERBEAR_API_KEY);
import type { BannerBear } from "@prisma/client";
export async function createBannerBear(processedTweet: any, requestedUserTwitterID: string) {
  const { data }: any = await axios.get(`https://api.bannerbear.com/v2/templates`, {
    headers: {
      Authorization: `Bearer ${process.env.BANNERBEAR_API_KEY}`,
    },
  });
  console.log("templates: ", data);
  data.map(async (template: any) => {
    console.log("processedTweet oncreated banner page: ", processedTweet);
    const generatedBanner = await generateImage(
      template.uid,
      processedTweet.tweetProfileImageUrl,
      processedTweet.tweetName,
      processedTweet.tweetUserName,
      processedTweet.tweetTextWithoutURL,
      processedTweet.statusURL,
      processedTweet.tweetVerified
    );
    await insertBannerBear(requestedUserTwitterID, generatedBanner.uid, template.uid, generatedBanner.status, generatedBanner.image_url_png, generatedBanner.image_url_jpg);
    console.log("generatedBanner", generatedBanner);
  });
}

async function generateImage(templateUID: string, tweetProfileImageUrl: string, tweetName: string, tweetUserName: string, tweetTextWithoutURL: string, statusURL: string, tweetVerified: boolean) {
  const images = await bb.create_image(
    templateUID,
    {
      modifications: [
        {
          name: "avatar",
          image_url: tweetProfileImageUrl,
        },
        {
          name: "verified",
          image_url: tweetVerified ? "https://images.bannerbear.com/images/files/000/004/787/original/verified_white.png" : "",
        },
        {
          name: "name",
          text: tweetName,
        },
        {
          name: "handle",
          text: `@${tweetUserName}`,
        },
        {
          name: "tweet_message",
          text: tweetTextWithoutURL,
        },
        {
          name: "qr_code",
          target: statusURL,
        },
      ],
      webhook_url: null,
      transparent: false,
      metadata: null,
    },
    true
  );
  console.log(images);
  return images;
}
