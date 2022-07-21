import Bannerbear from "bannerbear";
import axios from "axios";
import { insertBannerBear, updateBannerGeneratedStatus } from "./models/mug-this.server";
import "./lib/env";
import { generateImageWithCloudinary } from "./generateImageWithCloudinary";
import { createCategory, createProduct } from "./wooCommerce";

export async function createBannerBear(processedTweet: any, requestedUserTwitterID: string, tweetedRequestID: string) {
  try {
    const BB_PROJECT_ID = processedTweet.tweetMediaFile !== null ? process.env.BANNERBEAR_API_KEY_MAIN_IMAGES : process.env.BANNERBEAR_API_KEY_WITHOUT_MAIN_IMAGES;
    const bb = new Bannerbear(BB_PROJECT_ID);
    const { data }: any = await axios.get(`https://api.bannerbear.com/v2/templates`, {
      headers: {
        Authorization: `Bearer ${BB_PROJECT_ID}`,
      },
    });
    //create WooCommerce category
    const wooCommerceCategory = await createCategory(requestedUserTwitterID, processedTweet.tweetProfileImageUrl);
    const wooCommerceCategoryID = wooCommerceCategory.id;
    const wooCommerceCategoryURL = wooCommerceCategory._links.self[0].href;
    console.log("Final category URL: ", wooCommerceCategoryURL);
    data.map(async (template: any) => {
      console.log("processedTweet oncreated banner page: ", processedTweet);
      const generatedBanner = await generateBannerBearImage(
        bb,
        template.uid,
        processedTweet.tweetProfileImageUrl,
        processedTweet.tweetName,
        processedTweet.tweetUserName,
        processedTweet.tweetTextWithoutURL,
        processedTweet.statusURL,
        processedTweet.tweetVerified,
        processedTweet.tweetMediaFile,
        tweetedRequestID
      );

      //insert into database if it is successful
      if (generatedBanner !== undefined) {
        console.log("Respones from generatedBanner function for completed: ", generatedBanner);
        const bannerBearID = await insertBannerBear(
          requestedUserTwitterID,
          generatedBanner.uid,
          template.uid,
          generatedBanner.status,
          generatedBanner.image_url_png,
          generatedBanner.image_url_jpg,
          tweetedRequestID
        );
        await updateBannerGeneratedStatus(tweetedRequestID, "COMPLETED");
        // generate banner and inset in DO
        const finalImageURL = await generateImageWithCloudinary(generatedBanner.image_url_png, bannerBearID.id);

        // Insert products into WooCommerce
        await createProduct(wooCommerceCategoryID, finalImageURL, processedTweet.tweetTextWithoutURL);

        //UPLOAD to cloudinary for processing
      } else {
        console.log("Respones from generatedBanner function for failed: ", generatedBanner);
        await updateBannerGeneratedStatus(tweetedRequestID, "FAILED");
      }
    });
  } catch (err) {
    console.log("error @ createBannerBear.ts: ", err);
    console.log("trackedTweetedRequestId", tweetedRequestID);
    await updateBannerGeneratedStatus(tweetedRequestID, "FAILED");
  }
}

async function generateBannerBearImage(
  bb: any,
  templateUID: string,
  tweetProfileImageUrl: string,
  tweetName: string,
  tweetUserName: string,
  tweetTextWithoutURL: string,
  statusURL: string,
  tweetVerified: boolean,
  tweetMediaFile: string,
  tweetedRequestID: string
) {
  try {
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
          tweetMediaFile !== null ? { name: "main_media_file", image_url: tweetMediaFile } : {},
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
    return images;
  } catch (err) {
    console.log(`error @ generateImage.ts with tweetedRequestID: ${tweetedRequestID}} `, err);
    await updateBannerGeneratedStatus(tweetedRequestID, "FAILED");
  }
}
