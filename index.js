import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer;
let object;

setup();

function setup() {

//Setup the scene, camera, model. Import controls and render the scene
    camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 500;
    camera.position.z = 100;

    scene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
    camera.add( pointLight );
    scene.add( camera );

    const loader = new OBJLoader();
    loader.load( 
        "assets/House.obj",
        function ( obj ) {
            object = obj;
            scene.add( object );
        },
        function xhr() {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        function error() {
            console.log( 'An error happened', error );
    });

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const controls = new OrbitControls( camera, renderer.domElement );
	controls.minDistance = 2;
	controls.maxDistance = 5;
	controls.addEventListener( 'change', render );

    function render() {
        renderer.render( scene, camera );
    };
}

function gameMechanics() {
    // Game mechanics here
}



