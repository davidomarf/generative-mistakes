function getDisplacement(radius, angle) {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle)
  }
}

function getDistance(p1, p2) {
  return (Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2)
  ))
}

function getPoints(center, radius, numberOfPoints) {
  let points = [];

  let step = (Math.PI * 2) / numberOfPoints;

  for (let i = 0; i < numberOfPoints; i++) {
    let d = getDisplacement(radius, step * i)
    points.push({
      x: center.x + d.x,
      y: center.y + d.y
    });
  }

  return points;
}

class LandMass {
  constructor(points) {
    this.points = points;
    this.history = [this.points];
    this.last = this.history[this.history.length - 1];
  }

  update() {
    // let anchorSize = 20;
    // for(let i = 0; angle = 0; )
    let step = (Math.PI * 2) / this.points.length;
    for (let i = 0, angle = 0; i < this.points.length; i++, angle += step) {
      let d = getDisplacement(d3.randomNormal(3, .8)(), angle)
      this.points[i] = {
        x: this.points[i].x + d.x,
        y: this.points[i].y + d.y
      }
    }
  }

  show() {
    noFill();
    beginShape();

    for (let i = 0; i < this.points.length; i++) {
      let pos = this.points[i];
      curveVertex(pos.x, pos.y);
    }

    endShape(CLOSE);
  }

  static checkForCollisions(lm) {
    for (let a_i = 0; a_i < lm.length; a_i++) {
      for (let a_j = 0; a_j < lm[a_i].points.length; a_j++) {
        for (let b_i = 0; b_i < lm.length; b_i++) {
          if (b_i === a_i)continue;
          for (let b_j = 0; b_j < lm[b_i].points.length; b_j++) {
            if (getDistance(lm[a_i].points[a_j], lm[b_i].points[b_j]) < 10) {
              let p3 = mixPolygons(lm[a_i], a_j, lm[b_i], b_j)
              if(a_i < b_i){
              landMasses.splice(a_i, 1)
              landMasses.splice(b_i - 1, 1)}
              else {
              landMasses.splice(b_i, 1)
              landMasses.splice(a_i - 1, 1) 
            }
              return(p3);
            }
          }
        }
      }
    }
  }
}

function mixPolygons(polygonA, a_index, polygonB, b_index){
  let p3 = new LandMass(polygonA.points.slice(0, a_index - 2));
  p3.points = p3.points.concat(polygonB.points.slice(b_index + 2));
  p3.points = p3.points.concat(polygonB.points.slice(0, b_index - 2));
  p3.points = p3.points.concat(polygonA.points.slice(a_index + 2));

  return p3;
}