import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let camera, scene, renderer, controls, spotLight, lightHelper;
let mesh;

setup();

function setup() {

    //Setup the scene, camera, model. Import controls and render the scene;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 150 );
    camera.position.set(-10, 10, 10);

    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.3 );
    scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 0.9 );
    camera.add( pointLight );
    scene.add( camera );
    
    spotLight = new THREE.SpotLight( 0xddd, 200 );
    spotLight.position.set(0, 1.3, 0);
    spotLight.angle = 0.35;
	spotLight.penumbra = 0.5;
	spotLight.decay = 2;
	spotLight.distance = 4;
    spotLight.castShadow = true;
	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 1;
	spotLight.shadow.camera.far = 10;
	spotLight.shadow.focus = 1;
    scene.add(spotLight);

    //lightHelper = new THREE.SpotLightHelper( spotLight );
	//scene.add( lightHelper );

    const loader = new GLTFLoader();
    loader.load('assets/house.glb', (gltf) => {
        mesh = gltf.scene;
        mesh.position.set(2.6, -2, -2.4);
        mesh.receiveShadow = true;

        scene.add(mesh);
    });

    const plane = new THREE.PlaneGeometry(8, 8);
    const material = new THREE.MeshLambertMaterial( { color: 0xbcbcbc } );
    const mesh2 = new THREE.Mesh(plane, material);
    mesh2.receiveShadow = true;
    mesh2.castShadow = true;
    mesh2.rotation.x = - Math.PI / 2;
    mesh2.position.set(2.6, -2, -2.4);
    scene.add(mesh2);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 140;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.target.set(2.6, -2, -2.4);
    controls.update();
}

const gui = new GUI();

const params = {
    color: spotLight.color.getHex(),
    intensity: spotLight.intensity,
    distance: spotLight.distance,
    angle: spotLight.angle,
    penumbra: spotLight.penumbra,
    decay: spotLight.decay,
    x: spotLight.position.x,
    y: spotLight.position.y,
    z: spotLight.position.z,
};

gui.addColor( params, 'color' ).onChange( function ( val ) {

    spotLight.color.setHex( val );

} );

gui.add( params, 'intensity', 0, 500 ).onChange( function ( val ) {

    spotLight.intensity = val;

} );


gui.add( params, 'distance', -10, 50 ).onChange( function ( val ) {

    spotLight.distance = val;

} );

gui.add( params, 'angle', 0, Math.PI / 3 ).onChange( function ( val ) {

    spotLight.angle = val;

} );

gui.add( params, 'penumbra', 0, 1 ).onChange( function ( val ) {

    spotLight.penumbra = val;

} );

gui.add( params, 'decay', 1, 2 ).onChange( function ( val ) {

    spotLight.decay = val;

} );

gui.add( params, 'x', -20, 20).onChange( function ( val ){

    spotLight.position.x = val;
});

gui.add( params, 'y', -20, 20).onChange( function ( val ){

    spotLight.position.y = val;
});

gui.add( params, 'z', -20, 20).onChange( function ( val ){

    spotLight.position.z = val;
});


document.addEventListener('keydown', onDocumentKeyDown);
window.addEventListener('resize', onWindowResize);

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    switch (keyCode) {
        case 37: // left arrow key
            mesh.rotation.y += 0.01;
            break;
        case 39: // right arrow key
            mesh.rotation.y -= 0.01;
            break;
        case 38: // up arrow key
            mesh.rotation.x += 0.01;
            break;
        case 40: // down arrow key
            mesh.rotation.x -= 0.01;
            break;
    }
}

function animate() {
    controls.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    //lightHelper.update();
}
animate();

function gameLoop() {
    // Game mechanics here

}

function eventTimer(){
    //Set intervals for events to go off -> ramp with time

}

function toggleEvent(){
    //Set off light & sound components

}