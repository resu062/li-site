import '/web/oda/oda.js';
import GlobalParams from './gui.js';
import CortexMesh from './cortex.js';
import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';

let camera, scene, renderer, group, cortex, gui;
let size = 800,
    numLayers = 2;

window.addEventListener('resize', onWindowResize, false);

function init() {
    gui = new GlobalParams(size);

    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

    let aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 1, 4000);
    camera.position.z = 1850;

    const controls = new OrbitControls(camera, canvas);

    scene = new THREE.Scene();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.gammaInput = true;
    renderer.outputEncoding = THREE.sRGBEncoding;

    let group = initScene();
    scene.add(group);

    animate();
}

function initScene() {
    group = new THREE.Group();

    cortex = new CortexMesh(size, numLayers, gui);
    gui.setCortex(cortex);
    group.add(cortex);
    // for (let k = 1; k < cortex.numLayers; ++k) {
    //     cortex.distalLayer[k].visible = false;
    //     cortex.proximalLayer[k].visible = false;
    // }

    let bbox = new THREE.Mesh(new THREE.BoxGeometry(size, size, size));
    let helper = new THREE.BoxHelper(bbox);
    helper.material.color.setHex(0x80808);
    helper.material.blending = THREE.AdditiveBlending;
    helper.material.transparent = true;
    group.add(helper);

    group.rotation.y = 0.65;
    group.rotation.x = .65;

    return group;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    // if (gui.moving) {
    //     cortex.updateNodePos();
    //     cortex.updateDistalConnections();
    //     cortex.updateProximalConnections();
    //     cortex.updateProximalPos();
    // }
    // if (gui.update)
    cortex.updateNodeStates();
   // cortex.updateDistalCol();
    //cortex.updateProximalCol();

    requestAnimationFrame(animate);
    render();
    return;
}

function render() {
    // let time = Date.now() * 0.005;
    // group.rotation.y = time * 0.01;
    renderer.render(scene, camera);
}

init();
