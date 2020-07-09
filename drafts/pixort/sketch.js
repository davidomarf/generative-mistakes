var img;

let fourWidth;

let index_x = 0;
let index_y = 0;
let index_max;


function sortByRows(index) {
  let sortedPixels = [];
  colorMode(RGB)

  for (let y = 0 * 4; y < fourWidth; y += 4) {
    let loc = index * fourWidth + y;
    let c = color(
      pixels[loc],
      pixels[loc + 1],
      pixels[loc + 2]
    )
    sortedPixels.push([
      hue(c),
      saturation(c),
      lightness(c)
    ])
  }

  sortedPixels = sortedPixels.sort(Comparator)
  colorMode(HSL);

  let i = 0;

  for (let sec_y = 0; sec_y < fourWidth; sec_y += 4) {
    let loc = index * fourWidth + sec_y;
    let c = sortedPixels[i]
    let r = red(c);
    let g = green(c);
    let b = blue(c);
    pixels[loc] = r;
    pixels[loc + 1] = g;
    pixels[loc + 2] = b;
    pixels[loc + 3] = 255;
    i++;
  }


  updatePixels();
  index++;
}

function sortByCols(index) {
  let sortedPixels = [];
  colorMode(RGB)

  for (let row_i = 0; row_i < img.height; row_i++) {
    let loc = row_i * fourWidth + index * 4;
    let c = color(
      pixels[loc],
      pixels[loc + 1],
      pixels[loc + 2]
    )
    sortedPixels.push([
      hue(c),
      saturation(c),
      lightness(c)
    ])
  }

  sortedPixels = sortedPixels.sort(Comparator)
  colorMode(HSL);

  let i = 0;

  for (let row_i = 0; row_i < img.height; row_i++) {
    let loc = row_i * fourWidth + index * 4;
    let c = sortedPixels[i]
    let r = red(c);
    let g = green(c);
    let b = blue(c);
    pixels[loc] = r;
    pixels[loc + 1] = g;
    pixels[loc + 2] = b;
    pixels[loc + 3] = 255;
    i++;
  }

  updatePixels();
  index++;
}


function preload() {
  // img = loadImage('ham.jpg');
  img = loadImage('https://source.unsplash.com/random/600x600');
}

function setup() {
  createCanvas(600, 600);
  pixelDensity(1);
  image(img, 0, 0, img.width, img.height);
  loadPixels();

  index_max_x = pixels.length / 4 / img.width;
  index_max_y = pixels.length / 4 / img.height;
  rowSorted = false;
  fourWidth = 4 * img.width;
}

function draw() {
  if (index_x < index_max_x) {
    sortByRows(index_x++);
  } else {rowSorted = true}
  if (rowSorted && index_y < index_max_y) {
    sortByCols(index_y++);
  }
}

const threshold = 5;

function closeEnough(a, b) {
  return (threshold > Math.abs(a - b));
}

function Comparator(a, b) {
  if (closeEnough(a[0], b[0])) {
    if (a[2] < b[2]) return -1;
    if (a[2] > b[2]) return 1;
  }
  if (a[0] < b[0]) return -1;
  if (a[0] > b[0]) return 1;
  // if (a[2] < b[2]) return -1;
  // if (a[2] > b[2]) return 1;
  return 0;
}