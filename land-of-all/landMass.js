function getPoints(center, radius, numberOfPoints) {
  let points = [];

  let step = (Math.PI * 2) / numberOfPoints;

  for (let i = 0; i < numberOfPoints; i++) {
    points.push({
      x: center.x + radius * Math.cos(step * i),
      y: center.y + radius * Math.sin(step * i)
    });
  }

  return points;
}

function LandMass(points) {
  this.points = points;
  this.history = [this.points];
  this.last = this.history[this.history.length - 1];

  this.update = function () {
    let newLandMass = []
    for (let i = 0; i < points.length; i++) {
      newLandMass.push({
        x: this.points[i].x + random(-1, 1),
        y: this.points[i].y + random(-1, 1)
      })
    }
    this.points = newLandMass
    this.history.push(newLandMass);
    if (this.history.length > 280) {
      this.history.splice(0, 1);
    }

  }

  this.show = function () {
    noFill();
    beginShape();
    for (var i = 0; i < this.points.length; i++) {
      var pos = this.points[i];
      vertex(pos.x, pos.y);
    }
    endShape(CLOSE);

    for (var j = 0; j < this.history.length; j++) {
      let currentMass = this.history[j]
      stroke(200 - (j * 200 / this.history.length));
      console.log(this.history.length)
      beginShape();
      for (var i = 0; i < currentMass.length; i++) {
        var pos = currentMass[i];
        vertex(pos.x, pos.y);
      }
      endShape(CLOSE);

    }

  }
}