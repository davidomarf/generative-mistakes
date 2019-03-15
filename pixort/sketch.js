var img;
let index = 0;
let index_max;

function preload() {
  // img = loadImage('ham.jpg');
  img = loadImage('https://source.unsplash.com/random/720x720');
}

function setup() {
  createCanvas(720, 720);
  pixelDensity(1);
  image(img, 0, 0, img.width, img.height);
  loadPixels();
  index_max = pixels.length / 4 / img.width;
}

function draw() {
  if (index < index_max) {
    let fourWidth = 4 * img.width;
    let sortedPixels = [];
    colorMode(RGB)
    for (let y = 0; y < fourWidth; y += 4) {
      let loc = index * fourWidth + y;
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
      let loc = index * fourWidth + sec_y;
      let c = sortedPixels[i]
      let r = red(c);
      let g = green(c);
      let b = blue(c);
      // console.log(r, g, b)
      pixels[loc] = r;
      pixels[loc + 1] = g;
      pixels[loc + 2] = b;
      pixels[loc + 3] = 255;
      i++;

    }

    // for(let sorted_i = 1; sorter_i < sortedPixels.length; i++){
    //   let sameHue = []
    //   if (sortedPixels[sorted_i-1][0] == sortedPixels[sorted_i][0]){
    //     sameHue.push(sortedPixels[sorted_i-1]);
    //   } else {
    //     sameHue.push(sortedPixels[sorted_i]);
    //     sameHue = sameHue.sort(Comparator2);
    //     sameHue = [];
    //   }
    // }

    updatePixels();

  }
  index++;
}

const threshold = 10  ;

function closeEnough(a, b) {
  return (threshold > Math.abs(a - b));
}

function Comparator(a, b) {
  // if (a[0] > 10) return 0;
  if (closeEnough(a[0], b[0])) {
    if (a[2] < b[2]) return -1;
    if (a[2] > b[2]) return 1;
  }
  if (a[0] < b[0]) return -1;
  if (a[0] > b[0]) return 1;
  return 0;
}