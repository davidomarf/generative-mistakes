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
  background(15);

  for (let i = 0; i < NUMBER_OF_DAYS; i++) {
    drawDay((DIMENSIONS[0] / NUMBER_OF_DAYS) * i, width / NUMBER_OF_DAYS);
  }
}

function drawDay(x, dayWidth) {
  const dayMargin = 20;

  let meetings = []
    .constructor(MEETINGS_PER_DAY)
    .fill(null)
    .map((_, i) => ({
      startTime: Math.ceil(random() * 40),
      length: Math.ceil(random() * AVERAGE_MEETING_LENGTH),
    }))
    .map((meeting) => ({
      ...meeting,
      endTime: meeting.startTime + meeting.length,
    }));

  meetings = meetings.filter(
    ({ startTime, length }) => startTime + length < 40
  );

  meetings.sort((a, b) => a.startTime - b.startTime || b.length - a.length);

  meetings.forEach((meeting, i, arr) => {
    meeting.level = 1;

    const collisionMeetings = arr.filter((prevMeeting, m_i) => {
      if (m_i >= i) {
        return false;
      }

      return prevMeeting.endTime > meeting.startTime;
    });

    if (collisionMeetings && collisionMeetings.length) {
      const maxLevel = collisionMeetings.sort((a, b) => a.level - b.level)[
        collisionMeetings.length - 1
      ].level;

      let customLevel = false;
      for (let i = 1; i <= maxLevel; i++) {
        if (!collisionMeetings.some((mm) => mm.level === i)) {
          meeting.level = i;
          customLevel = true;
          break;
        }
      }

      const levelComplement = Math.ceil(randomGaussian(10, 5));
      meeting.level =
        Math.random() >= 0.5
          ? 10 - levelComplement / 2
          : 10 + levelComplement / 2;
    }
  });
  meetings.sort((a, b) => a.level - b.level || a.startTime - b.startTime);

  meetings.forEach((meeting, i) =>
    drawMeeting(meeting, x + dayMargin, meetings, i)
  );
}

function drawMeeting({ startTime, endTime, level, length }, x, meetings, i) {
  let hue;
  if (RANDOM_HUE) {
    hue = Math.floor(random() * 360);
  } else {
    hue = BASE_HUE - HUE_RANGE / 2 + Math.floor(random() * HUE_RANGE);
  }

  const meetingColor = color(hue, 40, 30, 0.9);

  fill(meetingColor);

  const meetingMargin = 4;

  const collisionMargin = CONFLICT_MARGIN * level;

  const adjustToHeight = (amount) => (height * amount) / 40;

  const collisionedMeetingsMargin = 8;
  const fillRandom = random();

  if (DRAW_MEETING_FILL)
    rect(
      x + meetingMargin + collisionMargin,
      adjustToHeight(startTime) + (level * collisionedMeetingsMargin) / 2,
      Math.min(200 + Math.floor(fillRandom * 10) * 20, 400) - collisionMargin,
      adjustToHeight(length) - level * collisionedMeetingsMargin
    );

  const leadMargin = 0;

  const markerColor = color(hue, 40, 80, 100);
  fill(markerColor);

  rect(
    x + meetingMargin + collisionMargin + leadMargin,
    adjustToHeight(startTime) +
      leadMargin +
      (level * collisionedMeetingsMargin) / 2,
    5,
    adjustToHeight(length) - leadMargin * 2 - level * collisionedMeetingsMargin
  );
}
