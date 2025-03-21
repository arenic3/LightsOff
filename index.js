import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
import gsap from'gsap';

let camera, scene, renderer, controls, spotLight, spotTarget, lightHelper, axisHelper, audioLoader, listener, sound;
let mesh;

let objects = [
    {x: -1.5, y: -1.3, z: 0.6, sound: 'assets/STATIC.mp3', created: false},
    {x: 0.9, y: -1.6, z: 0.25, sound: 'assets/LAMP.mp3', created: false},
    {x: -0.1, y: -3.2, z: -1.15, sound: 'assets/FAUCET.mp3', created: false},
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
    //initGUI();
    animate();
    gameLoop();
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

    //const pointLight = new THREE.PointLight( 0xffffff, 0.9 );
    //pointLight.position.set(-1.6, -1.3, 0.6);
    //scene.add( pointLight );
    

    //const pointLightHelper = new THREE.PointLightHelper( pointLight , 0.5 );
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

    // const wallGeometry = new THREE.BoxGeometry( 2, 1, 0.1 );
	// const wallMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.5 } );
	// const wall = new THREE.Mesh( wallGeometry, wallMaterial );
    // wall.rotation.set(0, 55, 0);
    // wall.position.set(-10.5, -1.3, 0.6);
    // scene.add(wall);
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
        y: 6,
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
}

function gameLoop() {
    let timer

    if(timer){
        clearInterval(timer);
    }
    timer = setInterval(gameMech, 3500);
}

function gameMech() {
    //generate light & sound object at specified positions within the scene
    const uncreatedObjects = objects.filter(obj => !objects.created);
    const loight = new THREE.PointLight( 0xffffff, 0.9 );
    const ssoundObj = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0});

    const sssoundObj = new THREE.Mesh(ssoundObj, mat);

    if(uncreatedObjects.length > 0){
        const obx = Math.floor(Math.random()* objects.length);
        const obj = uncreatedObjects[obx];

        loight.position.set(obj.x, obj.y, obj.z);
        sssoundObj.position.set(obj.x, obj.y, obj.z);

        audioLoader.load( obj.sound, function( buffer ) {
            sound.setBuffer( buffer );
            sound.setRefDistance(1);
            sound.loop = true;
            sound.play();
        });

        sound.setDirectionalCone(140, 180, 0.1);

        const posSoundHelper = new PositionalAudioHelper( sound, 1 );
        sound.add( posSoundHelper );

        sssoundObj.rotation.set(0, -55, 0);
        sssoundObj.add(sound);
        scene.add(loight);
        scene.add(sssoundObj);

        obj.created = true;
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event){
        mouse.x = (event.clientX / window.innerWidth) * 2 -1;
        mouse.y = -((event.clientY / window.innerHeight) * 2 -1);

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([sssoundObj], false);

        if(intersects.length > 0){
            console.log("clicked");
            const obj = intersects[0].object;
            if(obj === sssoundObj){
                sound.stop();
                loight.visible = false;
            }
        }
    }

    window.addEventListener('click', onMouseClick, false);
}