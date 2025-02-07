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

    camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set = (10, 10, 10); 
    camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
    camera.add( pointLight );
    scene.add( camera );

    const loader = new GLTFLoader();
    loader.load('assets/untitled.glb', (gltf) => {
        mesh = gltf.scene;
        mesh.position.set(0, -4, 4);
        scene.add(mesh);
    });

    const controls = new OrbitControls( camera, renderer.domElement );
	controls.minDistance = 2;
	controls.maxDistance = 5;
	controls.addEventListener( 'change', animate );
};

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
};

animate();

function gameMechanics() {
    // Game mechanics here
}



