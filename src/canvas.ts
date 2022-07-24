import { loadImage, createCanvas } from "canvas";
import fs from "fs";
async function drawOnMug() {
  const mug = await loadImage("https://res.cloudinary.com/dq8ooocvg/image/upload/v1658389608/mug_hqhp5m.png");
  const canvas = createCanvas(mug.width, mug.height);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 1000, 1000);
  const bbBanner = await loadImage("https://res.cloudinary.com/dq8ooocvg/image/upload/v1658549243/zgsk9fxuqapzjpmnkeha.png");
  canvas.getContext("2d").drawImage(mug, 0, 0, mug.width, mug.height);

  //rounded
  draw(ctx, bbBanner);

  const buffer = canvas.toBuffer("image/jpeg");

  const out = fs.createWriteStream(__dirname + "/test.png");
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => console.log("The PNG file was created."));
}

function draw(ctx, image) {
  const iw = image.width;
  console.log(image.width, image.height);
  const ih = image.height;
  const xOffset = 102; //left padding
  const yOffset = 110; //top padding
  const a = 500.0; //image width
  const b = 10; //round ness
  const scaleFactor = iw / (4 * a);

  // draw vertical slices
  for (let X = 0; X < iw; X += 1) {
    const y = (b / a) * Math.sqrt(a * a - (X - a) * (X - a)); // ellipsis equation
    ctx.drawImage(image, X * scaleFactor, 0, iw / 1000, ih, X + xOffset, y + yOffset, 1, 1000);
  }
}

drawOnMug();
