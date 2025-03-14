import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
import gsap from'gsap';

let camera, scene, renderer, controls, spotLight, spotTarget, lightHelper, axisHelper, audioLoader, listener, sound;
let mesh;

let objects = [
    {x: -1.6, y: -1.3, z: 0.6, sound: 'assets/STATIC.mp3'},
    {}
]

document.getElementById('startButton').addEventListener('click', ()=> {
    document.getElementById('controls').style.display= 'none';
    document.getElementById('subT').style.display= 'none';
    document.getElementById('sceneContainer').style.display = 'block';
    document.getElementById('startButton').style.display = 'none';
    setup();
    transAnimation();
});


function setup() {
    //Setup the scene, camera, model. Import controls and render the scene;
    initRenderer();
    initScene();
    initAudio();
    initLights();
    initControls();
    initMesh();
    initGUI();
    animate();
    gameMech();
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('sceneContainer').appendChild(renderer.domElement);
    
    renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;
}

function initScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 150 );
    camera.position.set(-15, 15, 15);
    scene.add( camera );

    axisHelper = new THREE.AxesHelper( 10 );
    //scene.add( axisHelper);
}

function initAudio() {
    listener = new THREE.AudioListener();
    camera.add(listener);

    sound = new THREE.PositionalAudio( listener );
    
    audioLoader = new THREE.AudioLoader();

    listener.context.resume();
}

function initLights() {
    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.9 );
    ambientLight.position.set(2.6, -2, 2.4);
    //scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 0.9 );
    pointLight.position.set(-1.6, -1.3, 0.6);
    scene.add( pointLight );
    

    const pointLightHelper = new THREE.PointLightHelper( pointLight , 0.5 );
    //scene.add( pointLightHelper);

    const spotLightCol = new THREE.Color( "rgb(240, 165, 70)" );

    const light = new THREE.HemisphereLight( 0xffffff, spotLightCol, 0.4 );
    scene.add( light );
    
    spotLight = new THREE.SpotLight( spotLightCol, 200 );
    spotLight.position.set(-2.6, -0.6, 2.4);
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

    spotTarget = new THREE.Object3D();
    spotTarget.position.set(-2.6, -4, 2.4);
    spotLight.target = spotTarget;
    scene.add(spotTarget);

    lightHelper = new THREE.SpotLightHelper( spotLight );
	//scene.add( lightHelper );
}

function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 4;
    controls.maxDistance = 140;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.target.set(0, -2, 0);
    controls.update();
}

function initMesh() {
    const loader = new GLTFLoader();
    loader.load('assets/house.glb', (gltf) => {
        mesh = gltf.scene;
        mesh.position.set(0, -4, 0);
        mesh.receiveShadow = true;

        scene.add(mesh);
    });
    
    // const soundObj = new THREE.Object3D();
    // soundObj.position.set(-1.6, -1.3, 0.6);
    // scene.add(soundObj);
    // soundObj.add(sound);


    const plane = new THREE.PlaneGeometry(8, 8);
    const material = new THREE.MeshLambertMaterial( { color: 0x08082 } );
    const mesh2 = new THREE.Mesh(plane, material);
    mesh2.receiveShadow = true;
    mesh2.castShadow = true;
    mesh2.rotation.x = - Math.PI / 2;
    mesh2.position.set(0, -4, 0);
    //scene.add(mesh2);
}


function initGUI() {
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
}

window.addEventListener('resize', onWindowResize);

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function transAnimation() {
    controls.enableRotate = false;
    controls.enableZoom = false;

    var tl = gsap.timeline({repeat: 0, repeatDelay: 0});

    tl.to(camera.position, {
        delay: 1/3,
        x: 14,
        y: 15,
        z: 14,
        duration: 2,
        ease: "slow"
    });

    tl.to(camera.position, {
        x: 14,
        y: 9,
        z: -14,
        duration: 1,
        ease: "sine"
    });

    tl.to(camera.position, {
        x: -14,
        y: 2,
        z: -14,
        duration: 2,
        ease: "slow"
    });

    tl.to(camera.position, {
        x: -14,
        y: 15,
        z: 14,
        duration: 2,
        ease: "power4"
    });
}

function animate() {
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    lightHelper.update();
    //console.log(listener);
}

function gameLoop() {
    let timer = setInterval(gameMech, 5000);

}

function gameMech() {
    //generate light & sound object at specified positions within the scene
    const loight = new THREE.PointLight( 0xffffff, 0.9 );
    const sssoundObj = new THREE.Object3D();

    loight.position.set(objects[0].x, objects[0].y, objects[0].z);
    sssoundObj.position.set(objects[0].x, objects[0].y, objects[0].z);

    audioLoader.load( objects[0].sound, function( buffer ) {
        sound.setBuffer( buffer );
        sound.setVolume(1);
        sound.setRefDistance(2);
        sound.setRolloffFactor(5);
        sound.loop = true;
        sound.play();
    });

    const posSoundHelper = new PositionalAudioHelper( sound );
    sound.add( posSoundHelper );
}