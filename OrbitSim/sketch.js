let massiveObjects = [];
let objID = 0;

// camera vars
let cameraX = 0;
let cameraY = 0;
let cameraScale = 1;
let cameraMoveSpeed = 1;
let mouseScrolled = 0;

// global vars
let trailLength;
let planetScale = 0;
let moveMode = "FocusBigGuy";
// "FocusBigGuy" = center on the most massive object
// "SelfMove" = the user has control over camera and zoom

// UI Variables
let mostMassiveObjectID = 0;
let mostMass = 0;
let doPlaceObjects = true;
let runPhysics = true;
let trailSections = 0;
let buttonHighlight;
let gravityOnButton;
let gravityOn = true;
let buttonPressed = false;
let drawVectors = false;
let gravityMultSlider;
let clearButton;
let timeStopButton;
let placeObjectsButton;
let drawVectorsButton;
let doDrawGridButton;
let doDrawGrid = false;
let timeElapsed = 0;
let doDrawDebug = false;
let drawDebugButton;
let spawnRandomButton;
let doCollisions = true;
let collisionButton;
let doDrawStars = true;
let drawStarButton;
let UION = true;

// particle Vars
let pid = 0;
let parts = [];

let lastFrameObjLength = 0;

function setup()
{
  createCanvas(windowWidth, windowHeight);
  trailLength = createSlider(0, 1000, 100);
  trailLength.position(width - 150, 150);
  gravityMultSlider = createSlider(1, 10, 1);
  gravityMultSlider.position(width - 150, 250);
  buttonHighlight = createImage(100, 100);
  gravityOnButton = newButton(width - 215, 175, 200, 50, "Gravity On", "", true, true);
  clearButton = newButton(width - 215, 275, 200, 50, "Clear All Objects", "", true, true);
  timeStopButton = newButton(width - 215, 350, 200, 50, "Pause / Unpause", "", true, true);
  placeObjectsButton = newButton(width - 215, 425, 200, 50, "Place Objects", "", true, true);
  drawVectorsButton = newButton(width - 215, 500, 200, 50, "Draw Vectors", "", true, true);
  doDrawGridButton = newButton(15, 15, 200, 50, "Draw Grid", "", true, true);
  spawnRandomButton = newButton(15, 80, 200, 50, "Spawn Random Objs", "", true, true);
  drawDebugButton = newButton(15, 145, 200, 50, "Debug Mode", "", true, true);
  collisionButton = newButton(15, 210, 200, 50, "Do Collisions", "", true, true);
  drawStarButton = newButton(15, 275, 200, 50, "Draw Stars", "", true, true);
  //newMassiveObject(5, [500, 200], createVector(0, 1), true, true, 500);
  //newMassiveObject(20, [700, 300], createVector(0, 0), true, true, 500);
  for (let i = 0; i < 100; i++)
  {
    //newRandomObject();
  }
}

function draw()
{
  lastFrameObjLength = massiveObjects.length;
  trailSections = 0;
  background(0);
  cameraControls();
  if (doDrawGrid == true) drawGrid();

  // draw particles and do their physics
  noStroke();
  for (let i = 0; i < parts.length; i++)
  {
    parts[i].view();
  }

  // draw trails the (true) determines if trails are drawn or not, just to make sure they are the bottom layer
  for (let i = 0; i < massiveObjects.length; i++)
  {
    massiveObjects[i].drawSelf(true);
    if (massiveObjects[mostMassiveObjectID] == undefined) mostMassiveObjectID = round(random(-1, massiveObjects.length));
  }

  // draw the actual objects
  for (let i = 0; i < massiveObjects.length; i++)
  {
    if (runPhysics == true) massiveObjects[i].updateSelf();
    else massiveObjects[i].drawSelf();
  }

  // stars
  if (doDrawStars)
  {
    for (let i = 0; i < 10; i++)
    {
      let s = random(0.1, 10);
      let nP = deAdjustForCamera(random(-1000, width + 1000), random(-1000, width + 1000));
      newParticle(nP[0], nP[1], 0, 0, s, s, 255, 255, 255, 0, 0, 0, random(100, 450), -0.01, -0.01);
    }
  }
  mouseScrolled = 0;

  // draw UI
  if (UION == true)
  {
    UI();
    gravityMultSlider.show();
    trailLength.show();
  }
  else
  {
    gravityMultSlider.hide();
    trailLength.hide();
  }

  if (mouseIsPressed == false) buttonPressed = false;

  if (lastFrameObjLength != massiveObjects.length) resetObjID();
}

function UI()
{
  // cursor and growing circle to indicate planet size

  if (doPlaceObjects == true)
  {
    fill(255);

    let p0 = deAdjustForCamera(mouseX, mouseY);
    let p1 = adjustForCamera(p0[0], p0[1]);
    if (mouseIsPressed) { planetScale += 1 / cameraScale; ellipse(p1[0], p1[1], planetScale * cameraScale) }
    else planetScale = 0;
    noFill();
    stroke(255);
    ellipse(p1[0], p1[1], (planetScale * cameraScale) + 10);
    fill(255);
    stroke(0);
  }

  // incriment time ellapsed varialbe
  if (runPhysics == true) timeElapsed++;

  // formatting
  fill(255);
  stroke(0);
  strokeWeight(1);
  textAlign(RIGHT);
  textSize(15);

  // text
  text("Frame Rate:" + round(frameRate()), width - 10, 30);

  // camera info
  switch (moveMode)
  {
    case "FocusBigGuy":
      text("Focusing On Object ID: " + mostMassiveObjectID, width - 10, 80);
      break;
  }

  // general info
  text("Particles Loaded: " + parts.length, width - 10, 60);
  text("Massive Objects Loaded: " + massiveObjects.length, width - 10, 100);
  text("Trail Sections Drawn: " + trailSections, width - 10, 120);
  text("Trail Length:" + trailLength.value(), width - 10, 140);
  text("Gravity Multiplier:" + gravityMultSlider.value(), width - 10, 245);

  // title type thing
  textAlign(CENTER);
  textSize(30)
  text("Time Elapsed:" + floor(timeElapsed / 60) + "\nScale: " + cameraScale, width / 2, 30);
  textAlign(LEFT);
  // draw buttons
  gravityOnButton.drawSelf();
  clearButton.drawSelf();
  timeStopButton.drawSelf();
  placeObjectsButton.drawSelf();
  drawVectorsButton.drawSelf();
  doDrawGridButton.drawSelf();
  spawnRandomButton.drawSelf();
  drawDebugButton.drawSelf();
  collisionButton.drawSelf();
  drawStarButton.drawSelf();

  // button functionality
  if (gravityOnButton.isPressed() == true) { gravityOn = !gravityOn; }
  if (clearButton.isPressed() == true) { massiveObjects = []; mostMass = 0; mostMassiveObjectID = 0; objID = 0 }
  if (timeStopButton.isPressed() == true) { runPhysics = !runPhysics }
  if (placeObjectsButton.isPressed() == true) { doPlaceObjects = !doPlaceObjects }
  if (drawVectorsButton.isPressed() == true) { drawVectors = !drawVectors }
  if (doDrawGridButton.isPressed() == true) { doDrawGrid = !doDrawGrid }
  if (spawnRandomButton.isPressed() == true)
  {
    for (let i = 0; i < 10; i++)
    {
      newRandomObject();
    }
  }
  if (drawDebugButton.isPressed() == true) { doDrawDebug = !doDrawDebug }
  if (collisionButton.isPressed() == true) { doCollisions = !doCollisions }
  if (drawStarButton.isPressed() == true) { doDrawStars = !doDrawStars }
}

function drawGrid()
{
  stroke(50);
  strokeWeight(2);
  push();
  let gridScale = 100 * cameraScale;
  for (let x = 0; x < width; x += gridScale)
  {
    line((cameraX % gridScale) + x, 0, (cameraX % gridScale) + x, height);
  }
  for (let y = 0; y < height; y += gridScale)
  {
    line(0, (cameraY % gridScale) + y, width, (cameraY % gridScale) + y);
  }
  pop();
}

function newRandomObject()
{
  newMassiveObject(random(10, 50), [-cameraX + random(0, width), -cameraY + random(0, height)], createVector(random(-5, 5), random(-5, 5)), true, true, trailLength.value())
}

function newMassiveObject(mass, startPosition, initialForceVector, drawPlanet, drawTail, trailLength) 
{
  // define the new object
  let nmo = new massiveObject(mass, startPosition, initialForceVector, drawPlanet, drawTail, trailLength);
  // push the the array
  massiveObjects.push(nmo);
  resetObjID();
  return nmo;
}

function newParticle(x, y, xSpeed, ySpeed, w, h, red1, green1, blue1, fadeRed, fadeGreen, fadeBlue, Lifespan, scaleX, scaleY)
{
  parts.push(new particle(x, y, xSpeed, ySpeed, 1, w, h, pid, 0, 0, red1, green1, blue1, fadeRed, fadeGreen, fadeBlue, Lifespan, scaleX, scaleY));
}

class massiveObject
{
  constructor(mass, startPosition, initialForceVector, drawPlanet, drawTail, trailLength)
  {
    // mass
    this.mass = mass;

    // start position
    this.startX = startPosition[0];
    this.startY = startPosition[1];

    //current position
    this.x = this.startX;
    this.y = this.startY;

    // force vectors
    this.currentForceVector = initialForceVector;
    this.initialForceVector = initialForceVector;

    // drawing variables
    this.fillColor = [random(50, 200), random(50, 200), random(50, 200)];
    this.drawTrail = drawTail;
    this.drawPlanet = drawPlanet;
    this.trailPositions = [];
    this.trailLength = trailLength;

    // id system
    this.objID = objID;
    objID++;

    // orbitMappings
    this.mapXs = [];
    this.mapYs = [];
    this.colided = false;
  }
  updateSelf()
  {
    if (doCollisions == true && this.colided == true)
    {
      this.colide();
    }
    this.drawSelf();
    this.updateTrail();
    this.doPhysics();
  }
  drawSelf(trail)
  {
    // trail is just a bool to determine whether or not the trail is drawn in order to have them drawn below the planets
    // draw the trail
    if (trail == true && this.drawTrail == true)
    {

      // itterate over the trail positions
      for (let i = 0; i < this.trailPositions.length - 1; i++)
      {

        // stroke and strokeWeight go from a max to a min depending on how far into the array it is
        let c1 = map(i / this.trailPositions.length, 0, this.trailPositions.length, 0, 255) * this.trailPositions.length;
        stroke(c1);
        let s1 = map(this.trailPositions.length - i, 0, this.trailPositions.length, 0, 20) * cameraScale;
        strokeWeight(s1);

        // adjust the positions for the camera
        let pos2 = adjustForCamera(this.trailPositions[i].x, this.trailPositions[i].y);
        let pos3 = adjustForCamera(this.trailPositions[i + 1].x, this.trailPositions[i + 1].y);

        // line between two positions
        if (pos2[0] > 0 && pos2[0] < width && pos2[1] > 0 && pos2[1] < height && pos3[0] > 0 && pos3[0] < width && pos3[1] > 0 && pos3[1] < height)
        {
          line(pos2[0], pos2[1], pos3[0], pos3[1]);
        }
      }
    }
    // draw the planet itself
    let pos1 = adjustForCamera(this.x, this.y);
    if (pos1[0] > 0 && pos1[0] < width && pos1[1] > 0 && pos1[1] < height)
    {
      strokeWeight(1);
      stroke(0);
      fill(this.fillColor[0], this.fillColor[1], this.fillColor[2]);
      if (this.drawPlanet == true && trail == undefined) { ellipse(pos1[0], pos1[1], this.mass * cameraScale); }
    }

    // vector drawing
    if (drawVectors == true && trail == undefined)
    {
      let pos5 = adjustForCamera(this.x + this.currentForceVector.x * 20, this.y);
      let pos6 = adjustForCamera(this.x, this.y + this.currentForceVector.y * 20);
      strokeWeight(6);
      stroke(0);
      line(pos1[0], pos1[1], pos5[0], pos5[1]);
      line(pos1[0], pos1[1], pos6[0], pos6[1]);
      stroke(230);
      strokeWeight(3);
      line(pos1[0], pos1[1], pos5[0], pos5[1]);
      line(pos1[0], pos1[1], pos6[0], pos6[1]);
    }
    if (doDrawDebug == true) this.drawDebug();
  }
  updateTrail()
  {
    // update the new position
    this.trailLength = trailLength.value();
    this.trailPositions.push(createVector(this.x, this.y));

    // if there are too many saved positions, 
    while (this.trailPositions.length > this.trailLength) this.trailPositions.shift();
  }
  doPhysics()
  {
    // define variables that can be added to through the itterations
    let endXForce = 0;
    let endYForce = 0;

    // itterate over every other object
    let hasColided = false;
    for (let i = 0; i < massiveObjects.length; i++)
    {

      // simpler refference to the current object
      let m1 = massiveObjects[i];

      // if the object is not itself
      if (m1.objID != this.objID && gravityOn == true)
      {

        // get the distance between the two points
        let d1 = dist(this.x, this.y, m1.x, m1.y);

        // get the angle between the two points
        let a1 = atan2(this.y - m1.y, this.x - m1.x);

        // defined the force vector
        let forceVec1 = createVector(m1.mass / d1, 0);

        // rotate the vector
        forceVec1.rotate(a1 + PI);

        let inertia = m1.mass / this.mass;

        if (d1 < this.mass / 2 + m1.mass / 2 && this.mass < m1.mass)
        {
          this.colided = true;
          hasColided = true;
          let i1 = m1.mass / 2;
          if (this.mass / m1.mass > 0.7) { m1.colided = true }
          else
          {
            m1.currentForceVector.x += this.currentForceVector.x / i1;
            m1.currentForceVector.y += this.currentForceVector.y / i1;
          }
        }

        // inertia makes it easier to move smaller masses and harder to move larger masses

        // apply the forces
        endXForce += forceVec1.x * inertia / 10;
        endYForce += forceVec1.y * inertia / 10;
      }
    }
    if (hasColided == false) this.colided = false;

    let pos1 = adjustForCamera(this.x, this.y);

    // if it is pressed and you are not placing objects, add the mouse movement
    let throwForce = this.mass / (10 / cameraScale);

    if (doPlaceObjects == false && mouseIsPressed && collc(pos1[0] - this.mass / 2, pos1[1] - this.mass / 2, this.mass, this.mass, mouseX, mouseY, 1, 1, 30, 30))
    {
      this.currentForceVector.x += (movedX * throwForce) / this.mass;
      this.currentForceVector.y += (movedY * throwForce) / this.mass;
      fill(100, 100, 100);
      circle(pos1[0], pos1[1], this.mass * cameraScale);
    }

    // apply the gravity multipler value
    endXForce *= gravityMultSlider.value();
    endYForce *= gravityMultSlider.value();

    // apply forces to the force vectors
    this.currentForceVector.x += endXForce;
    this.currentForceVector.y += endYForce;

    // apply force vectors to position.
    this.x += this.currentForceVector.x;
    this.y += this.currentForceVector.y;
  }
  drawDebug()
  {
    let pos1 = adjustForCamera(this.x, this.y);
    textAlign(CENTER);
    fill(230);
    stroke(0);
    text("Mass: " + round(this.mass), pos1[0], pos1[1] - (this.mass * cameraScale) / 2 - 50);
    text("ID: " + this.objID, pos1[0], pos1[1] - (this.mass * cameraScale) / 2 - 30);
    text("Position: (" + round(this.x) + ", " + round(this.y) + ")", pos1[0], pos1[1] - (this.mass * cameraScale) / 2 - 10);
    text("Total Velocity:" + (round(abs(this.currentForceVector.x)) + round(abs(this.currentForceVector.y))), pos1[0], pos1[1] - (this.mass * cameraScale) / 2 - 70);
  }
  mapOrbit(objectID)
  {
    if (objectID == undefined) objectID = mostMassiveObjectID;

    this.mapXs.push(tDist(this.x, massiveObjects[objectID].x));
    this.mapYs.push(tDist(this.y, massiveObjects[objectID].y));
  }
  colide()
  {
    for (let i = 0; i < this.mass * 3; i++)
    {
      let newV = createVector(0, random(0, this.mass));
      newV.rotate(random(0, TWO_PI));

      let speedV = createVector(0, random(0, this.mass / 8));
      speedV.rotate(random(0, TWO_PI));

      let size = random(this.mass / 10, this.mass / 5)

      newParticle(this.x + newV.x, this.y + newV.y, speedV.x, speedV.y, size, size, 100, 100, 100, 0, 0, 0, random(50, 250), -0.05, -0.05);
      newParticle(this.x + newV.y, this.y + newV.x, speedV.x, speedV.y, size, size, 170, 20, 20, 250, 250, 0, random(50, 250), -0.05, -0.05);
    }
    massiveObjects = del(massiveObjects, this.objID);
    objID--;
    resetObjID();
  }
}

function collc(x, y, w, h, x2, y2, w2, h2, bx, by)
{
  // apply the bezzle to the xs
  if (bx != 0 && bx != undefined)
  {
    x = x - bx / 2;
    x2 = x2 - bx / 2;
    w = w + bx;
    w2 = w2 + bx;
  }

  // apply the bezzle to the ys
  if (by != 0 && by != undefined)
  {
    y = y - by / 2;
    y2 = y2 - by / 2;
    h = h + by;
    h2 = h2 + by;
  }

  // draw hit boxes if debug mode is on and H is pressed
  if (keyIsDown(72)) { fill(200, 50, 50, 100); rect(x, y, w, h); rect(x2, y2, w2, h2) }

  if (x + w > x2 && x < x2 + w2 && y + h > y2 && y < y2 + h2) return true;

  return false;
}

function cameraControls()
{
  // up/down/left/right movement
  if (moveMode == "SelfMove")
  {
    let movingX = 0;
    let movingY = 0;

    if (keyIsDown(87)) { cameraY += cameraMoveSped / cameraScale; movingY = 1; } else
      if (keyIsDown(83)) { cameraY -= cameraMoveSped / cameraScale; movingY = -1; }
    if (keyIsDown(68)) { cameraX -= cameraMoveSped / cameraScale; movingX = -1; } else
      if (keyIsDown(65)) { cameraX += cameraMoveSped / cameraScale; movingX = 1; }

    if (keyIsDown(82)) cameraMoveSped = 6;
    else cameraMoveSped = 3;

    // moving diagonal moves at the same overall speed, not double the speed as it would be otherwise
    if (movingX != false && movingY != false) { cameraX -= cameraMoveSped * 0.1 * movingX; cameraY -= cameraMoveSped * 0.1 * movingY }
    // cameraScale makes the relative speed the same as it gets larger and smaller
  } else if (massiveObjects[mostMassiveObjectID] != undefined)
  {
    cameraX = -massiveObjects[mostMassiveObjectID].x + width / 2;
    cameraY = -massiveObjects[mostMassiveObjectID].y + height / 2;
  }

  if (keyIsDown(38)) cameraScale += round(10 * (0.5 * cameraScale)) / 100; else
    if (keyIsDown(40)) cameraScale -= round(10 * (0.5 * cameraScale)) / 100;
  // mouse scrolling for scale
  cameraScale -= mouseScrolled / 800;
  // constrain the cameraScale to a reasonable amount
  cameraScale = constrain(cameraScale, 0.1, 3);
  cameraScale = round(cameraScale * 100) / 100;
}

function adjustForCamera(x, y, returnVector)
{
  // adjust by camera position

  x += cameraX;
  y += cameraY;

  // adjust the position for the scale arround the center point
  // tDist gets the "true distance" or simply includes negative signs
  // if X is greater than X2
  let c1 = cameraScale - 1

  x += c1 * tDist(x, width / 2);
  y += c1 * tDist(y, height / 2);

  // if the code requests a vector instead of an array, then it returns a vector.
  let pos = [x, y];
  if (returnVector == true) pos = createVector(x, y);
  // return the position
  return pos;
}

function tDist(x, x2)
{
  return x - x2
}

function mouseWheel(event)
{
  mouseScrolled = event.delta;
}

function deAdjustForCamera(x, y)
{

  let c1 = cameraScale - 1;

  // math derevation of the inverse function wtf math ahhhhhh
  x = (x + ((c1 * width) / 2)) / (c1 + 1);
  y = (y + ((c1 * height) / 2)) / (c1 + 1);

  // add camnera pos last because it is done first in the origonal function, 
  x -= cameraX;
  y -= cameraY;

  return [x, y];
}

function mouseReleased()
{
  if (planetScale > 0 && doPlaceObjects == true && mouseX < width - 250)
  {
    let pos1 = deAdjustForCamera(mouseX, mouseY);
    newMassiveObject(planetScale, [pos1[0], pos1[1]], createVector(0), true, true, 100);
  }
}

function keyPressed()
{
  // reset to default scale
  if (keyCode === 81) cameraScale = 1;
  // swap placing mode
  if (keyCode === 84) { doPlaceObjects = !doPlaceObjects }
  // UI on/off
  if (keyCode === 90) { UION = !UION }
}

function dropShadowText(txt, x, y, xoffset, yoffset)
{
  // if a second offset is not provided, it will simply apply the first offset to they y as well
  if (yoffset == undefined) yoffset = xoffset;
  fill(0);
  text(txt, x + xoffset, y + yoffset);
  fill(230);
  text(txt, x, y);
}

function newButton(x, y, w, h, text, subtext, doHighlight, doDraw)
{
  let b1 = new buttonUI(x, y, w, h, text, subtext, doHighlight, doDraw);
  return b1;
}

class buttonUI
{
  constructor(x, y, w, h, text, subtext, doHighlight, doDraw)
  {
    // position and size
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    // text to draw and text to draw when hovered
    this.text = text;
    this.subtext = subtext;

    // if it highlights when the mouse gets closer
    this.doHighlight = doHighlight;

    // background image handling.
    this.doDraw = doDraw;
    // drawing variables
    if (this.doDraw == undefined) this.doDraw = true;
  }
  drawSelf()
  {
    // draw the background;
    if (this.doDraw == true)
    {
      noStroke();
      fill(50, 50, 200, 100);
      rect(this.x, this.y, this.w, this.h);

      // draw the text and subtext
      textAlign(CENTER);
      textSize(18);
      let t = this.text
      if (this.text == "Gravity On") t += ": " + gravityOn;
      dropShadowText(t, this.x + this.w / 2, this.y + this.h / 2 + 7, 3, 5);
      textSize(14);
      textAlign(LEFT);

      if (collc(this.x, this.y, this.w, this.h, mouseX, mouseY, 1, 1, 150, 159) == true);
      {
        // do highlighting for when mouse gets close
        if (this.doHighlight == true) this.drawHighlight();

        if (collc(this.x, this.y, this.w, this.h, mouseX, mouseY, 1, 1))
        {
          // draw subtext
          textSize(15);
          fill(230);
          textAlign(CENTER);
          let t2 = this.subtext;
          if (this.text == "Pause / Unpause")
          {
            if (runPhysics == true) t2 = "Time Is Unpaused";
            else t2 = "Time Is Paused";
          }
          if (this.text == "Debug Mode")
          {
            if (doDrawDebug == true) t2 = "Debug Mode On";
            else t2 = "Debug Mode Off";
          }
          text(t2, this.x + this.w / 2, this.y - 2);
        }
      }
    }
  }
  isPressed()
  {
    if (collc(this.x, this.y, this.w, this.h, mouseX, mouseY, 10, 10) == true && buttonPressed == false && mouseIsPressed && mouseButton == LEFT)
    {
      buttonPressed = true;
      return true;
    }
    return false;
  }
  drawHighlight()
  {
    // get istance from the mouse to the center of the button
    let dx = dist(mouseX, 0, this.x + this.w / 2, 0);
    let dy = dist(mouseY, 0, this.y + this.h / 2, 0);
    let maxAlpha = 150;
    // map the distance from the max istance of 300 down to a range of 0 -the max number
    dx = map(dx, 0, this.w, 0, maxAlpha / 2);
    dy = map(dy, 0, this.h, 0, maxAlpha / 2);
    let totalAlpha = maxAlpha - (dx + dy);

    // load in the pixels to be eddited
    buttonHighlight.loadPixels();

    for (let i = 0; i < buttonHighlight.pixels.length; i += 4)
    {
      buttonHighlight.pixels[i] = 150;
      buttonHighlight.pixels[i + 1] = 150;
      buttonHighlight.pixels[i + 2] = 150;
      buttonHighlight.pixels[i + 3] = totalAlpha;
    }

    // update the image
    buttonHighlight.updatePixels();

    // draw the image
    image(buttonHighlight, this.x, this.y, this.w, this.h);
  }
}

class particle
{
  constructor(x, y, xs, ys, s, w, h, id, yg, xg, r, gc, b, fr, fg, fb, ls, scx, scy)
  {
    // X, Y, Xspeed, Yspeed, Shape, Width, Height, ID, Ygravity, Xgravity, Initial red green blue, final red green blue, lifespan, Scale change x, Scale change y
    // Variables for the location and motion of the particle;
    this.x = x;
    this.y = y;
    this.xs = xs;
    this.ys = ys;
    this.scx = scx;
    this.scy = scy;
    this.mv = createVector(this.xs, this.ys);

    // incriments PID by one so the next particle has the correct ID  
    pid += 1;
    // object id so it is compatable with the del function
    this.id = id;

    //shape

    // this.s = ceil(random(-1,2)); //random shape
    this.s = s; //
    this.w = w;
    this.h = h;

    //Lifespan
    this.ls = ls;
    if (this.ls < 1)
    {
      this.ls = 1;
    }
    this.lc = 0;

    //Gravity variables
    this.ygravity = yg;
    this.xgravity = xg;

    // Variables for color and color changing
    this.r = r;
    this.gc = gc;
    this.b = b;
    this.fr = fr;
    this.fg = fg;
    this.fb = fb;
    this.rd = 0;
    this.gd = 0;
    this.bd = 0;
    this.rd = tDist(this.fr, this.r) / this.ls;
    this.gd = tDist(this.fg, this.gc) / this.ls;
    this.bd = tDist(this.fb, this.b) / this.ls;
  }
  view()
  {
    // modifying the different variables
    if (runPhysics == true)
    {
      this.w += this.scx;
      this.h += this.scy;
      this.x += this.mv.x;
      this.y += this.mv.y;
      this.mv.y += this.ygravity;
      this.mv.x += this.xgravity;
      this.r += this.rd;
      this.gc += this.gd;
      this.b += this.bd;
      this.lc += 1;
    }

    // drawing the particle to the screen
    let pos1 = adjustForCamera(this.x, this.y, true);
    let opacity = map(this.lc / this.ls, 0, 1, 255, 0);
    fill(this.r, this.gc, this.b, opacity);
    if (this.s == 1) ellipse(pos1.x, pos1.y, this.w * cameraScale, this.h * cameraScale);
    else if (this.s == 2)
    {
      push();
      translate(pos1.x, pos1.y);
      rotate(atan2(this.mv.y, this.mv.x));
      rect(0, 0, this.w, this.h);
      pop();
    }

    // parameters for when the particle will delete itself.
    if (this.lc > this.ls || this.lc > 500 || opacity <= 50)
    {
      parts = del(parts, this.id, 180, 1);
      pid -= 1;
    }
    // delete particles when they leave the screen, not included in this method.
    /*
    if (this.x + screenx / screenscale > width / screenscale || this.y + screeny / screenscale > height / screenscale || this.x + screenx / screenscale < 0 || this.y + screeny / screenscale < 0 || this.w < 0 || this.h < 0) {
      parts = del(parts, this.id, 10324, 1);
      pid -= 1;
    }
    */
  }
}

function del(a, id)
{
  // creates an empty array and a duplicate of the input array.
  let array = [];
  let array2 = a;
  for (let i = 0; i < array2.length; i++)
  {
    //For the length of the input array, it pushes the values of the input array into the empty array if the current place in the array does not equal the current ID
    if (i != id)
    {
      array.push(array2[i]);
    }
    if (i > id)
    {
      //If the id of the object is larger than the deleted id, it decreases it's ID by one
      if (array[i - 1].id == undefined) array[i - 1].objID--;
      else array[i - 1].id--;
    }
  }
  return array;
}

function resetObjID()
{
  let totalLarger = 0;
  for (let i = 0; i < massiveObjects.length; i++)
  {
    if (massiveObjects[i].mass >= mostMass)
    {
      totalLarger++;
      mostMass = massiveObjects[i].mass;
      mostMassiveObjectID = i;
    }
  }
  if (mostMass != 0 && totalLarger == 0)
  {
    mostMass = 0;
    resetObjID();
  }
}