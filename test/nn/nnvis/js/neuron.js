class Neuron {
  constructor(px, py, pz, vx, vy, vz) {
    this.pos = { x: px, y: py, z: pz };
    this.vel = { x: vx, y: vy, z: vz };
    this.predicted = false;
    this.activated = false;
    this.distalNodes = new Set();
    this.proximalNodes = new Set();
  }
}
