import { v2 as cloudinary } from "cloudinary";
import "./lib/env";
import { insertCloudinary } from "./models/mug-this.server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function generateImageWithCloudinary(imgageURL: string, bannerBearId: string) {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const uploadResponse = await cloudinary.uploader.upload(
        imgageURL,
        {
          eager: [{ width: 812, height: 812, crop: "scale" }],
        },
        function (error, result) {
          let results = { public_id: result.public_id, secure_url: result.secure_url };
          console.log(`Sucessfully uploaded BannerBear image to Cloudinary: `, results);
          return results;
        }
      );

      const imageURLFinal = cloudinary.url(uploadResponse.public_id, {
        transformation: [
          { width: 812, crop: "scale" },
          { height: "2.0", width: "1.0", crop: "pad" },
          { effect: "displace", overlay: "pill_mwmx6j.png", y: -15 },
          { effect: "trim" },
          { underlay: "mug_hqhp5m.png", width: 1600, x: 0, crop: "scale" },
          { tags: ["generated_mug"] },
          { secure: true },
        ],
      });
      //INSERT INDO THE CLOUDINARY DB AND RETURN FINAL IMAGE URL
      await insertCloudinary(uploadResponse.public_id, uploadResponse.secure_url, bannerBearId, `${imageURLFinal}.png`);
      console.log("generatedMugresponse imageURLFinal and DB inserted to Cloudinary: ", `${imageURLFinal}.png`);
      resolve(`${imageURLFinal}.png`);
    } catch (err) {
      console.log("Rejected at generateImageWithCloudinary", err);
      reject(err);
    }
  });
}
