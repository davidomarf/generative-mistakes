var img;

function preload() {
  // img = loadImage('ham.jpg');
  img = loadImage('https://source.unsplash.com/random/720x360');
}

function setup() {
  createCanvas(720, 360);
  pixelDensity(1);
  noLoop();
}

function draw() {
  image(img, 0, 0, img.width, img.height);

  loadPixels();

  let fourWidth = 4 * img.width;

  for (let x = 0; x < img.height; x++) {

    let sortedPixels = [];
    colorMode(RGB)
    for (let y = 0; y < fourWidth; y += 4) {
      let loc = x * fourWidth + y;
      let c = color(
        pixels[loc],
        pixels[loc + 1],
        pixels[loc + 2]
      )
      sortedPixels.push([
        hue(c),
        saturation(c),
        brightness(c)
      ])
    }

    sortedPixels = sortedPixels.sort(Comparator)
    colorMode(HSB);

    let i = 0;

    for (let sec_y = 0; sec_y < fourWidth; sec_y += 4) {
      let loc = x * fourWidth + sec_y;
      let c = sortedPixels[i]
      let r = red(c);
      let g = green(c);
      let b = green(c);
      // console.log(r, g, b)
      pixels[loc] = r;
      pixels[loc + 1] = g;
      pixels[loc + 2] = b;
      pixels[loc + 3] = 255;
      i++;

    }

    updatePixels();
  }

  // sortedPixels = sortedPixels.sort(Comparator)
  // colorMode(HSB);

  // let i = 0;
  // for (let x = 0; x < img.height; x++) {
  //   for (let y = 0; y < fourWidth; y += 4) {
  //     let loc = x * fourWidth + y;
  //     let c = sortedPixels[i]
  //     let r = red(c);
  //     let g = green(c);
  //     let b = green(c);
  //     // console.log(r, g, b)
  //     pixels[loc] = r;
  //     pixels[loc + 1] = g;
  //     pixels[loc + 2] = b;
  //     pixels[loc + 3] = 255;
  //     i++;
  //   }
  // }

  // updatePixels();

}

function Comparator(a, b) {
  if (a[0] < b[0]) return -1;
  if (a[0] > b[0]) return 1;
  return 0;
}