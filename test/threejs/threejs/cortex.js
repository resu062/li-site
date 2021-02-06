import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';

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
//--------------------------------------------------------------------
// CortexMesh displays a visualization of the current state of the
// neural network.
//--------------------------------------------------------------------
let gui, r;
export default class CortexMesh extends THREE.Object3D {
    //------------------------------------------------------------------
    constructor(size, layers, _gui) {
        super();
        r = size;
        this.numLayers = layers || 1;
        gui = _gui;
        this.maxNodesPerLayer = gui.maxNodesPerLayer;
        this.nodeGeom = [];
        this.nodePos = [];
        this.nodeCol = [];
        this.nodeSize = [];
        this.posAttrib = [];
        this.colAttrib = [];
        this.sizeAttrib = [];
        this.nodeData = [];
        this.nodeLayer = [];
        //------------------
        this.proximalGeom = [];
        this.proximalPos = [];
        this.proximalCol = [];
        this.proximalInd = [];
        this.proximalPosAttrib = [];
        this.proximalColAttrib = [];
        this.proximalIndAttrib = [];
        this.proximalLayer = [];
        //------------------
        this.distalGeom = [];
        this.distalCol = [];
        this.distalInd = [];
        this.distalColAttrib = [];
        this.distalIndAttrib = [];
        this.distalLayer = [];
        //------------------
        this.initNodes();
        //this.initDistalDendrites();
        //this.updateDistalConnections();
        //this.updateDistalCol();
        this.initProximalDendrites();
        //this.updateProximalConnections();
        //this.updateProximalPos();
        //this.updateProximalCol();
    }
    //------------------------------------------------------------------
    initNodes() {
        var N = this.maxNodesPerLayer;

        var uniforms = {
            color: {
                value: new THREE.Color(0xffffff)
            },
            texture: {
                value: new THREE.TextureLoader().load("./spark1.png")
            }
        };

        var nodeMat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `
                attribute float size;
                attribute vec3 customColor;
                varying vec3 vColor;
                void main() {
                    vColor = customColor;
                    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                    gl_PointSize = size * ( 100.0 / -mvPosition.z );
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform sampler2D texture;
                varying vec3 vColor;
                void main() {
                    gl_FragColor = vec4( color * vColor, 1.0 );
                    // gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });

        for (var k = 0; k < this.numLayers; ++k) {
            this.nodeGeom[k] = new THREE.BufferGeometry();
            this.nodePos[k] = new Float32Array(3 * N);
            this.nodeCol[k] = new Float32Array(3 * N);
            this.nodeSize[k] = new Float32Array(N);
            this.nodeData[k] = [];
            for (var i = 0, n = 0, c = 0; i < N; ++i) {
                var px = (Math.random() - 0.5) * r;
                var py = r * (k / (this.numLayers - 1) - 0.5);
                var pz = (Math.random() - 0.5) * r;
                var vx = 2 * Math.random() - 1
                var vy = 0;
                var vz = 2 * Math.random() - 1;

                this.nodeCol[k][c++] = 1;
                this.nodeCol[k][c++] = 1;
                this.nodeCol[k][c++] = 1;

                this.nodePos[k][n++] = px;
                this.nodePos[k][n++] = py;
                this.nodePos[k][n++] = pz;

                this.nodeSize[k][i] = 5;

                // create extra data item
                this.nodeData[k].push(new Neuron(px, py, pz, vx, vy, vz));
            }

            this.posAttrib[k] = new THREE.BufferAttribute(this.nodePos[k], 3)
                .setUsage(THREE.DynamicDrawUsage);
            this.colAttrib[k] = new THREE.BufferAttribute(this.nodeCol[k], 3)
                .setUsage(THREE.DynamicDrawUsage);
            this.sizeAttrib[k] = new THREE.BufferAttribute(this.nodeSize[k], 1)
                .setUsage(THREE.DynamicDrawUsage);

            this.nodeGeom[k].setAttribute('position', this.posAttrib[k]);
            this.nodeGeom[k].setAttribute('customColor', this.colAttrib[k]);
            this.nodeGeom[k].setAttribute('size', this.sizeAttrib[k]);
            this.nodeGeom[k].setDrawRange(0, N);
            this.nodeGeom[k].computeBoundingSphere();

            this.nodeLayer[k] = new THREE.Points(this.nodeGeom[k], nodeMat);
            this.add(this.nodeLayer[k]);
        }
    }
    //------------------------------------------------------------------
    initDistalDendrites() {
        var N = this.maxNodesPerLayer;
        var lineMat = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.25
        });
        // DISTAL
        for (var k = 1; k < this.numLayers; ++k) {
            this.distalGeom[k] = new THREE.BufferGeometry();
            this.distalCol[k] = new Float32Array(6 * N * (N - 1) * gui.maxDistDend);
            this.distalInd[k] = new Uint32Array(2 * N * (N - 1) * gui.maxDistDend);
            this.distalColAttrib[k] = new THREE.BufferAttribute(this.distalCol[k], 3)
                .setUsage(THREE.DynamicDrawUsage);
            this.distalIndAttrib[k] = new THREE.BufferAttribute(this.distalInd[k], 1)
                .setUsage(THREE.DynamicDrawUsage);
            this.distalGeom[k].setIndex(this.distalIndAttrib[k]);

            this.distalGeom[k].setAttribute('position', this.posAttrib[k]);
            // this.distalGeom[k].setAttribute('color', this.colAttrib[k]);
            this.distalGeom[k].setAttribute('color', this.distalColAttrib[k]);
            this.distalGeom[k].setDrawRange(0, 0);

            this.distalLayer[k] = new THREE.LineSegments(this.distalGeom[k], lineMat);
            this.add(this.distalLayer[k]);
        }
    }
    //------------------------------------------------------------------
    initProximalDendrites() {
        var N = this.maxNodesPerLayer;
        var lineMat = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.25
        });
        // PROXIMAL
        for (var k = 0; k < this.numLayers; ++k) {
            this.proximalGeom[k] = new THREE.BufferGeometry();
            this.proximalPos[k] = new Float32Array(6 * N * gui.maxProxDend * 20);
            this.proximalCol[k] = new Float32Array(6 * N * gui.maxProxDend * 20);
            // this.proximalInd[k]  = new Uint32Array(2*N*gui.maxProxDend);

            // this.proximalIndAttrib[k] = new THREE.BufferAttribute(this.proximalInd[k], 1)
            //   .setUsage( THREE.DynamicDrawUsage  );
            this.proximalPosAttrib[k] = new THREE.BufferAttribute(this.proximalPos[k], 3)
                .setUsage(THREE.DynamicDrawUsage);
            this.proximalColAttrib[k] = new THREE.BufferAttribute(this.proximalCol[k], 3)
                .setUsage(THREE.DynamicDrawUsage);

            this.proximalGeom[k].setAttribute('position', this.proximalPosAttrib[k]);
            this.proximalGeom[k].setAttribute('color', this.proximalColAttrib[k]);
            // this.proximalGeom[k].setIndex(this.proximalIndAttrib[k]);
            this.proximalGeom[k].setDrawRange(0, 0);

            this.proximalLayer[k] = new THREE.LineSegments(this.proximalGeom[k], lineMat);
            this.add(this.proximalLayer[k]);
        }
    }
    //------------------------------------------------------------------
    // Update distal synapse connections
    //------------------------------------------------------------------
    updateDistalConnections() {
        var N = this.maxNodesPerLayer;
        for (var k = 1; k < this.numLayers; ++k) {
            var n = 0;
            var iPos = this.nodePos[k];
            for (var i = 0, i0 = 0, i2 = 2; i < N; ++i, i0 += 3, i2 += 3) {
                var iData = this.nodeData[k][i];
                var nearest = this.findNearestNodes(iPos[i0], iPos[i2],
                    k, gui.numDistDend,
                    gui.maxDistDist);
                iData.distalNodes.clear();
                nearest.forEach(function (j) {
                    iData.distalNodes.add(j);
                    this.distalInd[k][n++] = i;
                    this.distalInd[k][n++] = j;
                }, this);
            }
            this.distalIndAttrib[k].needsUpdate = true;
            this.distalGeom[k].setDrawRange(0, 2 * n);
        }
    }
    //------------------------------------------------------------------
    // Update proximal connections
    //------------------------------------------------------------------
    updateProximalConnections() {
        var N = this.maxNodesPerLayer;
        for (var k = 1; k < this.numLayers; ++k) {
            var n = 0;
            var iPos = this.nodePos[k];
            for (var i = 0, i0 = 0, i2 = 2; i < N; ++i, i0 += 3, i2 += 3) {
                var iData = this.nodeData[k][i];
                var nearest = this.findNearestNodes(iPos[i0], iPos[i2],
                    k - 1, gui.numProxDend,
                    gui.maxProxDist);
                iData.proximalNodes.clear();
                nearest.forEach(function (j) {
                    iData.proximalNodes.add(j);
                });
                n += nearest.length;
            }
            this.proximalGeom[k].setDrawRange(0, 2 * n * gui.numDendSegs);
        }
    }
    //------------------------------------------------------------------
    updateProximalPos() {
        var N = this.maxNodesPerLayer;
        for (var k = 1; k < this.numLayers; ++k) {
            var n = 0;
            var iPos = this.nodePos[k];
            var jPos = this.nodePos[k - 1];
            var proxPos = this.proximalPos[k];
            for (var i = 0, i0 = 0, i1 = 1, i2 = 2; i < N; ++i, i0 += 3, i1 += 3, i2 += 3) {
                var iData = this.nodeData[k][i];
                iData.proximalNodes.forEach(function (j) {
                    var j0 = 3 * j, j1 = j0 + 1, j2 = j0 + 2;
                    var dy = iPos[i1] - jPos[j1];
                    var pCrv = new THREE.CubicBezierCurve3(
                        new THREE.Vector3(iPos[i0], iPos[i1], iPos[i2]),
                        new THREE.Vector3(iPos[i0], iPos[i1] - dy, iPos[i2]),
                        new THREE.Vector3(jPos[j0], jPos[j1] + dy, jPos[j2]),
                        new THREE.Vector3(jPos[j0], jPos[j1], jPos[j2])
                    );
                    var pos = pCrv.getPoints(gui.numDendSegs);
                    for (var s = 0; s < gui.numDendSegs; ++s) {
                        proxPos[n++] = pos[s].x;
                        proxPos[n++] = pos[s].y;
                        proxPos[n++] = pos[s].z;
                        proxPos[n++] = pos[s + 1].x;
                        proxPos[n++] = pos[s + 1].y;
                        proxPos[n++] = pos[s + 1].z;
                    }
                });
            }
            this.proximalGeom[k].attributes.position.needsUpdate = true;
        }
    }
    //------------------------------------------------------------------
    // Update distal synapse colors
    //------------------------------------------------------------------
    updateDistalCol() {
        var N = this.maxNodesPerLayer;
        for (var k = 1; k < this.numLayers; ++k) {
            var c = 0;
            var iCol = this.nodeCol[k];
            var jCol = this.nodeCol[k];
            var distCol = this.distalCol[k];
            for (var i = 0, i0 = 0, i1 = 1, i2 = 2; i < N; ++i, i0 += 3, i1 += 3, i2 += 3) {
                var iData = this.nodeData[k][i];
                iData.distalNodes.forEach(function (j) {
                    var j0 = 3 * j, j1 = j0 + 1, j2 = j0 + 2;
                    var w = jCol[j0];
                    distCol[c++] = Math.max(jCol[j0], 0.1);
                    distCol[c++] = Math.max(jCol[j1], 0.1);
                    distCol[c++] = Math.max(jCol[j2], 0.1);
                    distCol[c++] = Math.max(jCol[j0], 0.1);
                    distCol[c++] = Math.max(jCol[j1], 0.1);
                    distCol[c++] = Math.max(jCol[j2], 0.1);
                }, this);
            }
            this.distalGeom[k].attributes.color.needsUpdate = true;
        }
    }
    //------------------------------------------------------------------
    updateProximalCol() {
        var N = this.maxNodesPerLayer;
        for (var k = 1; k < this.numLayers; ++k) {
            var c = 0;
            var iCol = this.nodeCol[k];
            var jCol = this.nodeCol[k - 1];
            var proxCol = this.proximalCol[k];
            for (var i = 0, i0 = 0, i1 = 1, i2 = 2; i < N; ++i, i0 += 3, i1 += 3, i2 += 3) {
                var iData = this.nodeData[k][i];
                iData.proximalNodes.forEach(function (j) {
                    var j0 = 3 * j, j1 = j0 + 1, j2 = j0 + 2;
                    var cCrv = new THREE.LineCurve3(
                        // new THREE.Vector3(iCol[i0], iCol[i1], 0),
                        new THREE.Vector3(jCol[j0], jCol[j1], 0),
                        new THREE.Vector3(jCol[j0], jCol[j1], 0)
                    );
                    var col = cCrv.getPoints(gui.numDendSegs);
                    for (var s = 0; s < gui.numDendSegs; ++s) {
                        proxCol[c++] = Math.max(col[s].x, 0.1);
                        proxCol[c++] = Math.max(col[s].y, 0.1);
                        proxCol[c++] = Math.max(col[s].z, 0.1);
                        proxCol[c++] = Math.max(col[s + 1].x, 0.1);
                        proxCol[c++] = Math.max(col[s + 1].y, 0.1);
                        proxCol[c++] = Math.max(col[s + 1].z, 0.1);
                    }
                });
            }
            this.proximalGeom[k].attributes.color.needsUpdate = true;
        }
    }
    //------------------------------------------------------------------
    updateNodePos() {
        var N = this.maxNodesPerLayer;
        var rHalf = r / 2;
        for (var k = 0; k < this.numLayers; ++k) {
            for (var i = 0, i0 = 0, i1 = 1, i2 = 2; i < N; ++i, i0 += 3, i1 += 3, i2 += 3) {
                var iData = this.nodeData[k][i];
                // update particle positions if moving
                this.nodePos[k][i0] += iData.vel.x;
                this.nodePos[k][i1] += iData.vel.y;
                this.nodePos[k][i2] += iData.vel.z;
                if (this.nodePos[k][i0] < -rHalf ||
                    this.nodePos[k][i0] > rHalf)
                    iData.vel.x *= -1;
                if (this.nodePos[k][i1] < -rHalf ||
                    this.nodePos[k][i1] > rHalf)
                    iData.vel.y *= -1;
                if (this.nodePos[k][i2] < -rHalf ||
                    this.nodePos[k][i2] > rHalf)
                    iData.vel.z *= -1;
            }
            this.nodeGeom[k].attributes.position.needsUpdate = true;
        }
    }
    //------------------------------------------------------------------
    // Render active neurons
    //------------------------------------------------------------------
    setActiveNeurons() {
        var N = this.maxNodesPerLayer;
        for (var k = 0; k < this.numLayers; ++k) {
            for (var i = 0, i0 = 0; i < N; ++i, i0 += 3) {
                var iData = this.nodeData[k][i];
                if (iData.predicted) {
                    this.nodeCol[k][i0] = 0;
                    this.nodeCol[k][i1] = 1;
                    this.nodeCol[k][i2] = 0;
                }
                else {
                    this.nodeCol[k][i0] = 1;
                    this.nodeCol[k][i1] = 0;
                    this.nodeCol[k][i2] = 0;
                }
                this.nodeSize[k][i] = 100;
            }
        }
    }
    //------------------------------------------------------------------
    //------------------------------------------------------------------
    // Update Neuron States
    //------------------------------------------------------------------
    updateNodeStates() {
        var N = this.maxNodesPerLayer;
        var color = this.nodeCol[0];
        var sizes = this.nodeSize[0];
        for (var i = 0, i0 = 0, i1 = 1, i2 = 2; i < N; ++i, i0 += 3, i1 += 3, i2 += 3) {
            var iData = this.nodeData[0][i];
            if (!iData.activated && Math.random() > 0.99) {
                sizes[i] = 100;
                color[i0] = 0;
                color[i1] = 1;
                color[i2] = 0;
                iData.activated = true;
            }
            else {
                sizes[i] *= 0.95;
                color[i0] *= 0.95;
                color[i1] *= 0.95;
                color[i2] *= 0.95;
                iData.activated = (sizes[i] > 5);
            }
        }
        this.nodeGeom[0].attributes.customColor.needsUpdate = true;
        this.nodeGeom[0].attributes.size.needsUpdate = true;
        for (var k = 1; k < this.numLayers; ++k) {
            color = this.nodeCol[k];
            sizes = this.nodeSize[k];
            for (var i = 0, i0 = 0, i1 = 1, i2 = 2; i < N; ++i, i0 += 3, i1 += 3, i2 += 3) {
                var iData = this.nodeData[k][i];
                // The size of each node is proportional to its activation energy.
                var sumDist = 0;
                iData.distalNodes.forEach(function (j) {
                    sumDist += this.nodeSize[k][j];
                }, this);
                var distalActivation = (sumDist > 10);

                var sumProx = 0;
                iData.proximalNodes.forEach(function (j) {
                    sumProx += this.nodeSize[k - 1][j];
                }, this);
                var proximalActivation = (sumProx > 100);

                if (iData.activated) {
                    // Node has recently been activated. Node cannot fire again
                    // until sizes[i] falls below 5.  This simulates the neurons
                    // physical limitations on firing rate based on available
                    // metabolic resources.
                    sizes[i] *= 0.95;
                    color[i0] *= 0.95;
                    color[i1] *= 0.95;
                    color[i2] *= 0.95;
                    iData.activated = (sizes[i] > 5);
                }
                else if (proximalActivation) {
                    // Node is not active, but has recieved enough stimulation on
                    // its proximal dendrites to trigger activation.
                    if (iData.predicted) {
                        // Node was already in the predicted state.
                        color[i0] = 0;
                        color[i1] = 1;
                        color[i2] = 0;
                    }
                    else {
                        // Node was not in the predicted state.
                        color[i0] = 1;
                        color[i1] = 0;
                        color[i2] = 0;
                    }
                    sizes[i] = 100;
                    iData.activated = true;
                    iData.predicted = false;
                }
                else if (distalActivation) {
                    // Node is not active, but its distal synapes have received
                    // enough stimulation to partially depolarize the neuron. Thus
                    // this node is now in the predictive state.
                    sizes[i] = 50;
                    color[i0] = 0;
                    color[i1] = 1;
                    color[i2] = 1;
                    iData.predicted = true;
                }
                else if (iData.predicted) {
                    // Node is in the predicted state, but no activation has
                    // occured.  The partial depolarization is now decaying.
                    sizes[i] *= 0.9;
                    color[i0] *= 0.9;
                    color[i1] *= 0.9;
                    color[i2] *= 0.9;
                    iData.predicted = (sizes[i] > 5);
                }
                else {
                    // Node is not active and is not being predicted.
                    color[i0] = 0.05;
                    color[i1] = 0.05;
                    color[i2] = 0.05;
                    sizes[i] = 5;
                }
            }
            this.nodeGeom[k].attributes.customColor.needsUpdate = true;
            this.nodeGeom[k].attributes.size.needsUpdate = true;
        }
    }
    //--------------------------------------------------------------------
    // Find K-nearest neighbors
    //--------------------------------------------------------------------
    findNearestNodes(x0, z0, layer, maxNeighbors, maxDist) {
        var L = layer;
        var K = maxNeighbors;
        var N = this.maxNodesPerLayer;
        var Y = r * (L / (this.numLayers - 1) - 0.5);
        var maxDistSq = maxDist * maxDist;
        var minDistSq = [];
        var nearest = [];
        for (var i = 0, i0 = 0, i1 = 1, i2 = 2; i < N; ++i, i0 += 3, i1 += 3, i2 += 3) {
            var dx = this.nodePos[L][i0] - x0;
            var dz = this.nodePos[L][i2] - z0;
            var distSq = dx * dx + dz * dz;
            // Skip self connections
            if (distSq < 0.001) continue;
            // Limit maximum horizontal connection distance
            if (distSq > maxDistSq) continue;
            // Add this node if there are less than K nodes already in the array
            // or if this node is closer than the last node in the array.
            if (minDistSq.length < K || distSq < minDistSq[K - 1]) {
                // Insert this node into the sorted list of nearest neighbors
                var idx = minDistSq.findIndex(function (dSq) {
                    return dSq > distSq;
                });
                if (idx < 0) {
                    minDistSq.push(distSq);
                    nearest.push(i);
                }
                else {
                    minDistSq.splice(idx, 0, distSq);
                    nearest.splice(idx, 0, i);
                }
                if (nearest.length > K) nearest.pop();
                if (minDistSq.length > K) minDistSq.pop();
            }
        }
        return nearest;
    }
};

