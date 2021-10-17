/**
 * Standard function of p5js
 */
function setup() {
  createCanvas(DIMENSIONS[0], DIMENSIONS[1]).parent("artwork-container");

  // Use the same seed for every time setup is called.
  // (These are generated and initialized by Ginpar)
  randomSeed(RANDOM_SEED);
  noiseSeed(NOISE_SEED);
  colorMode(HSB);
  noStroke();
  noLoop();
}

/**
 * Standard function of p5js
 */
function draw() {
  // Set a background color
  background(20);

  for (let i = 0; i < NUMBER_OF_DAYS; i++) {
    drawDay((DIMENSIONS[0] / NUMBER_OF_DAYS) * i, width / NUMBER_OF_DAYS);
  }
}

function drawDay(x, dayWidth) {
  const dayMargin = 100;
  fill(10);
  rect(
    x + dayMargin / 2,
    dayMargin / 2,
    dayWidth - dayMargin / 2,
    height - dayMargin
  );

  const meetings = []
    .constructor(MEETINGS_PER_DAY)
    .fill(null)
    .map(() => ({
      hour: Math.ceil(random() * 20),
      length: Math.ceil(random() * AVERAGE_MEETING_LENGTH),
    }));

  meetings.sort((a, b) => a.hour - b.hour || a.length - b.length);
  meetings.forEach((meeting, i) =>
    drawMeeting(meeting, x + dayMargin, meetings, i)
  );
}

function drawMeeting({ hour, length }, x, meetings, i) {
  const collisions = meetings.filter((meeting, m_i) => {
    if (m_i >= i) {
      return false;
    }
    const [aStart, aEnd] = [hour, hour + length];
    const [bStart, bEnd] = [meeting.hour, meeting.hour + meeting.length];

    return (
      (bStart >= aStart && bStart < aEnd) || (aEnd > bStart && aEnd <= bEnd)
    );
  });

  // const hue = 180 + Math.floor(random() * 60);
  const hue = Math.floor(random() * 360);

  const meetingColor = color(hue, 70, 40, 0.9);

  fill(meetingColor);

  const meetingMargin = 4;

  const collisionMargin = 20 * collisions.length;

  rect(
    x + meetingMargin + collisionMargin,
    (height * hour) / 20 + collisions.length * 5,
    100 + Math.floor(random() * 10) * 25 - collisionMargin,
    length * 40 - collisions.length * 10
  );

  const leadMargin = 0;

  const markerColor = color(hue, 70, 80, 100);
  fill(markerColor);

  rect(
    x + meetingMargin + collisionMargin + leadMargin,
    (height * hour) / 20 + leadMargin + collisions.length * 5,
    5,
    length * 40 - leadMargin * 2 - collisions.length * 10
  );
}
