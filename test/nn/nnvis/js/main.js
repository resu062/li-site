"use strict";
var group;
var container, stats;
var neuronData = [];
var camera, scene, renderer;
var synapsePos, synapseCol;
var cortex;
var pointCloud;
var neuronPos;
var neuronCol;
var neuronSize;
var proxDendrites;
var maxNeurons = 1000;
var r = 800;
var numLayers = 8;
var gui;

window.addEventListener( 'load', init, false );
window.addEventListener( 'resize', onWindowResize, false );

//--------------------------------------------------------------------
function init() {
  gui = new GlobalParams(r);

	container = document.getElementById( 'container' );

  var aspect = window.innerWidth / window.innerHeight;
	camera = new THREE.PerspectiveCamera( 45, aspect, 1, 4000 );
	camera.position.z = 1750;

	var controls = new THREE.OrbitControls( camera, container );

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	container.appendChild( renderer.domElement );

	stats = new Stats();
	container.appendChild( stats.dom );

  var group = initScene();
	scene.add( group );
  
  animate();
}
//--------------------------------------------------------------------
function initScene() {
	group = new THREE.Group();

  cortex = new CortexMesh(numLayers);
	group.add( cortex );

  // var prox = initProximalSynapses();
	// group.add( prox );

  // var dist = initDistalSynapses();
	// group.add( dist );
  
  var bbox = new THREE.Mesh( new THREE.BoxGeometry( r, r, r ) );
	var helper = new THREE.BoxHelper( bbox );
	helper.material.color.setHex( 0x080808 );
	helper.material.blending = THREE.AdditiveBlending;
	helper.material.transparent = true;
	group.add( helper );

  return group;
}
//--------------------------------------------------------------------
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
//--------------------------------------------------------------------
function animate() {
  // update particle positions if moving
  if (gui.moving) {
    cortex.updateNodePos();
    cortex.updateDistalConnections();
    cortex.updateProximalConnections();
    cortex.updateProximalPos();
  }
  cortex.updateNodeStates();
  cortex.updateDistalCol();
  cortex.updateProximalCol();

  
  requestAnimationFrame(animate);
	stats.update();
	render();
  return;
}

function render() {
	var time = Date.now() * 0.005;
	group.rotation.y = time * 0.01;
	renderer.render( scene, camera );
}

