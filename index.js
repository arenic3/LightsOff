import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer;
let mesh;

setup();

function setup() {

//Setup the scene, camera, model. Import controls and render the scene
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.set = (10, 10, 10); 
    camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
    camera.add( pointLight );
    scene.add( camera );

    const spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 0, -10, 0 );
    scene.add(spotLight);

    const loader = new GLTFLoader();
    loader.load('assets/house.glb', (gltf) => {
        mesh = gltf.scene;
        mesh.position.set(0, -4, 4);
        scene.add(mesh);
    });

    const controls = new OrbitControls( camera, renderer.domElement );
	controls.minDistance = 2;
	controls.maxDistance = 5;
	controls.addEventListener( 'change', animate );
};

document.addEventListener('keydown', onDocumentKeyDown);

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    switch (keyCode) {
        case 37: // left arrow key
            mesh.rotation.y += 0.1;
            break;
        case 39: // right arrow key
            mesh.rotation.y -= 0.1;
            break;
        case 38: // up arrow key
            mesh.rotation.x += 0.1;
            break;
        case 40: // down arrow key
            mesh.rotation.x -= 0.1;
            break;
    }
};

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
};

animate();

function gameLoop() {
    // Game mechanics here

};

function eventTimer(){
    //Set intervals for events to go off -> ramp with time

};

function toggleEvent(){
    //Set off light & sound components

};


