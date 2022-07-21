import { execFile as exec } from "child_process";

export function runPhotoshop() {
  exec("E:\\NodeJs_Projects\\mug-this\\adobe_image_generator.exe", ["E:\\NodeJs_Projects\\mug-this\\base_images\\mug.png"], function (err, data) {
    console.log("done");
  });
}
runPhotoshop();
