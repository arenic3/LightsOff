/*
LIGHTS OUT -Nicolas Arellano Guzman

Lightweight 3D immersive experience built off THREE.js making use of positional audio in a virtual environment.
The experience is designed to be unwinable and a stressor to whoever gives it a go, fun is not this "games" goal, instead,
this project was created out of sheer frustration against the ever increasing cost of energy and feeling impotent against energy companies.

Through this experience the user is berated by sounds coming from every direction coupled with seeing their score go down faster than it will ever go up.
In development I wanted to explore provoking "bad" emotions/feelings notably stress which is something we have all felt when opening that electricity bill,
but I mostly wanted to try provoking these feelings through auditory stimuli. I've studied human biology and a some neuroscience in the past understanding 
that our main method of recieving warning or alerts is through our aural sense. Now obviously sight plays a role in this which is why I wanted to explore a 3D space,
where users wouldn't immediatly see where an object might be but would instead hear it.
*/

//Libraries
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
import gsap from'gsap';


//Global variables, helpers are for debugging feel free to add them back into the scene
let camera, scene, renderer, controls, spotLight, spotTarget, lightHelper, axisHelper, audioLoader, listener, newSound, videoTex, videoGeom, videoMat, videoObj;
let mesh, mesh2;
let loopInterval = null;
let interval = 5000;
let interval2 = 1000;
const minInterval = 500;
const ramp = 0.95;
let score = 100;
let scoreTimeout = null;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const video = document.createElement('video');
const scoreDiv = document.createElement('div');

//Scene objects, with their coordinates, rotation for the sound to face the correct direction,
//directional cone main and seconday angle values, hitbox scale, sound file and state.
let objects = [
    {x: -0.8, y: -0.6, z: 2.2, rot: 3.1, dir: 80, dir2: 180, scale: 3.5, col: "blue", sound: 'assets/STATIC.mp3', created: false},
    {x: -3.05, y: -2.6, z: 2.6, rot: 3.1, dir: 80, dir2: 140, scale: 1, col: "goldenrod", sound: 'assets/LAMP.mp3', created: false},
    {x: -1.4, y: -2.6, z: 2.6, rot: 4, dir: 70, dir2: 90, scale: 1, col: "goldenrod", sound: 'assets/LAMP.mp3', created: false},
    {x: 2.2, y: -2.2, z: 0, rot: 2, dir: 170, dir2: 220, scale: 8, col: "firebrick", sound: 'assets/CAR.mp3', created: false},
    {x: -0.3, y: -2.5, z: 0.35, rot: 0, dir: 100, dir2: 120, scale: 1.5, col: "cyan", sound: 'assets/FAUCET.mp3', created: false},
    {x: 0.15, y: -2.5, z: -2.5, rot: -0.6, dir: 100, dir2: 180, scale: 2, col: "green", sound: 'assets/DRYER.mp3', created: false},
    {x: -0.55, y: -2.5, z: -2.5, rot: 0, dir: 135, dir2: 200, scale: 2, col: "red", sound: 'assets/WASHER.mp3', created: false},
    {x: -2.5, y: -0.3, z: -0.65, rot: 4.8, dir: 135, dir2: 180, scale: 1, col: "grey", sound: 'assets/LIGHT.mp3', created: false},
    {x: -2.6, y: -0.3, z: 2.1, rot: 5, dir: 155, dir2: 210, scale: 2, col: "grey", sound: 'assets/LIGHT.mp3', created: false},
];

//Second array to be populated with active objects
let scene_objects = [];

//Css lightbulb event listener
const cssLight = document.querySelector('.light');
cssLight.addEventListener('click', () => {
    document.body.classList.toggle('on');
});

//Event listener to clear the screen for the experience & add the score counter
document.getElementById('startButton').addEventListener('click', ()=> {
    document.body.style.transition = 'none';
    document.getElementById('heading').style.transition = 'none';
    document.getElementById('heading').style.backgroundColor = 'rgba(0, 0, 0, 0)';
    document.getElementById('header1').style.margin = '10px';
    document.getElementById('header1').style.boxShadow = 'none';
    document.getElementById('header1').style.backgroundColor = 'transparent';
    document.getElementById('header1').style.fontSize = '2em';
    document.getElementById('header2').style.margin = '10px';
    document.getElementById('header2').style.boxShadow = 'none';
    document.getElementById('header2').style.backgroundColor = 'transparent';
    document.getElementById('header2').style.fontSize = '2em';
    document.getElementById('sceneContainer').style.display = 'block';
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('lightbulb').style.display = 'none';
    document.getElementById('author').style.display = 'none';
    scoreDiv.id = 'score';
    scoreDiv.style.position = 'fixed';
    scoreDiv.style.top = '20px';
    scoreDiv.style.right = '40px';
    scoreDiv.style.fontFamily = 'Monaco'
    scoreDiv.style.fontSize = '2em';
    scoreDiv.style.color = '#D3D3D3D3';
    scoreDiv.style.zIndex = '9999';
    scoreDiv.innerText = `${score}`;
    document.body.appendChild(scoreDiv);

    setup();    //Initialize scene, camera, mesh(s), audio & lights -> game Loop
    transAnimation();
    introMech();
});

//Score display, red if negative & green if pos.
function updateScoreDisplay() {
    scoreDiv.innerText = `${score}`;
    if(score > 50){
        scoreDiv.style.color = '#D3D3D3';
    } else if(score < 50){
        scoreDiv.style.color = '#FF0000';
    };
}

//Setup
function setup() {
    //Setup the scene, camera, model. Import controls and render the scene;
    initRenderer();
    initScene();
    initAudio();
    initVideo();
    initLights();
    initControls();
    initMesh();
    //initGUI();    //Debugging tools for spotlight
    animate();
}

//Initialize webGL renderer 
function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('sceneContainer').appendChild(renderer.domElement);
    
    renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;
}

//Setup scene, size, camera and axis helper (for debug)
function initScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 150 );
    camera.position.set(-15, 15, -15);
    scene.add( camera );

    //Debugger
    // axisHelper = new THREE.AxesHelper( 10 );
    // scene.add( axisHelper);
}

//Initialize audio
function initAudio() {
    listener = new THREE.AudioListener();
    camera.add(listener);
    
    audioLoader = new THREE.AudioLoader();

    listener.context.resume();  //Resume context (needed for safari)
}

function initVideo() {
    video.src = 'assets/TV.mp4'; // Path to your video file
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true; // Set to true if you want autoplay without user interaction
    video.playsInline = true;
    video.load();

    videoTex = new THREE.VideoTexture(video);
    videoTex.minFilter = THREE.LinearFilter;
    videoTex.magFilter = THREE.LinearFilter;
    videoTex.format = THREE.RGBFormat;

    videoGeom = new THREE.PlaneGeometry(1.2, 0.55); // Adjust size as needed
    videoMat = new THREE.MeshBasicMaterial({ map: videoTex, side: THREE.DoubleSide });
    videoObj = new THREE.Mesh(videoGeom, videoMat);
    videoObj.position.set(-0.85, -0.59, 2.295); // Adjust position as needed
    videoObj.visible = false; // Hide by default
    scene.add(videoObj);
}

//Initialize base scene lights if not it would be pitch black
function initLights() {
    const spotLightCol = new THREE.Color( "rgb(240, 165, 70)" );

    const light = new THREE.HemisphereLight( 0xffffff, spotLightCol, 0.2 );
    scene.add( light );
    
    spotLight = new THREE.SpotLight( spotLightCol, 200 );
    spotLight.position.set(-3.9, -1.5, -3.77);
    spotLight.angle = 0.5;
	spotLight.penumbra = 0.5;
	spotLight.decay = 2;
	spotLight.distance = 2;
    spotLight.castShadow = true;
	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 1;
	spotLight.shadow.camera.far = 10;
	spotLight.shadow.focus = 1;
    scene.add(spotLight);

    spotTarget = new THREE.Object3D();
    spotTarget.position.set(-3.9, -3, -3.77);
    spotLight.target = spotTarget;
    scene.add(spotTarget);

    //Debug tool
    // lightHelper = new THREE.SpotLightHelper( spotLight );
	// scene.add( lightHelper );
}

//Orbital controls
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

//Load our MagicaVoxel model in glb, one mesh for the interior 
//and one for the exterior which fades the closer the camera gets
function initMesh() {
    const loader = new GLTFLoader();
    loader.load('assets/models/untitled.glb', (gltf) => {
        mesh = gltf.scene.children[0];
        console.log(gltf.scene.children);
        mesh.position.set(0, -3, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        mesh.traverse(child => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({ 
            map: child.material.map, 
            color: child.material.color 
        });
        child.castShadow = true;
        child.receiveShadow = true;
    }
});
        
    });

    loader.load('assets/models/exterior.glb', (gltf) => {
        mesh2 = gltf.scene.children[0];
        mesh2.position.set(0, -3, 0);
        mesh2.castShadow = true;
        mesh2.receiveShadow = true;
        mesh2.material.transparent = true;
        mesh2.material.opacity = 1;
        mesh2.scale.set(1.001, 1.001, 1.001);  //Avoid clipping with the interior
        scene.add(mesh2);

        mesh2.traverse(child => {
    if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ 
            map: child.material.map, 
            color: child.material.color 
        });
        child.castShadow = true;
        child.receiveShadow = true;
    }
});
    });
}

//Debugging tools
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

//Allow scene to be resized
window.addEventListener('resize', onWindowResize);

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}

//Intro animation, spin around the house and showcase a first object 
//turning on to point the user in the right direction
function transAnimation() {
    controls.enableRotate = false;
    controls.enableZoom = false;

    var tl = gsap.timeline({repeat: 0, repeatDelay: 0});

    //Bottom right corner
    tl.to(camera.position, {
        delay: 2/3,
        x: -8,
        y: 5,
        z: 8,
        duration: 2,
        ease: "slow"
    });

    //Top right corner
    tl.to(camera.position, {
        x: 8,
        y: -2,
        z: 8,
        duration: 2,
        ease: "slow"
    });

    //Zoom on active object
    tl.to(camera.position, {
        x: 7,
        y: -2,
        z: 0,
        duration: 1,
        ease: "slow"
    });

    //Top left corner
    tl.to(camera.position, {
        x: 8,
        y: 0,
        z: -8,
        duration: 2,
        ease: "slow"
    });

    //Bottom left / starting position
    tl.to(camera.position, {
        x: -15,
        y: 15,
        z: -15,
        duration: 2,
        ease: "slow"
    });
}

function resetAnimation() {
    controls.enableRotate = false;
    controls.enableZoom = false;
}

//Main loop
function animate() {
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.update();

    //Dynamic exterior mesh
    if (mesh2 && mesh2.material) {
        const mesh2Pos = new THREE.Vector3();
        mesh2.getWorldPosition(mesh2Pos);
        const distance = camera.position.distanceTo(mesh2Pos);

        //Threshold
        const minDist = 12;
        const maxDist = 25;

        let opacity = (distance - minDist) / (maxDist - minDist);
        opacity = THREE.MathUtils.clamp(opacity, 0.1, 1);

        mesh2.material.transparent = true;
        mesh2.material.opacity = opacity;
    };

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    //lightHelper.update();
}

//Main loop to run game logic at ramping intervals (increasing difficulty)
function gameLoop() {
   if (loopInterval) clearTimeout(loopInterval);

   gameMech();

   interval = Math.max(minInterval, interval * ramp);
   interval2 = Math.max(minInterval, interval2 * ramp);
   loopInterval = setTimeout(gameLoop, interval);
}

//Duplicate of gameMech but calls a set object, doesnt update score at first
//only runs once then the gameLoop takes over
function introMech(){
    const obj = objects[3];

    if(!obj.created){
        const c = obj.col;
        const col = new THREE.Color(c);
        const loight = new THREE.PointLight( col, 0.9 );
        const ssoundObj = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const mat = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0});

        const sssoundObj = new THREE.Mesh(ssoundObj, mat);

        loight.position.set(obj.x, obj.y, obj.z);
        sssoundObj.position.set(obj.x, obj.y, obj.z);
        sssoundObj.rotation.set(0, obj.rot, 0);
        sssoundObj.scale.set(obj.scale, obj.scale, obj.scale);

        const sound = new THREE.PositionalAudio(listener);
        audioLoader.load(obj.sound, function(buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(1);
            sound.loop = true;
            sound.play();
        });

        sound.setDirectionalCone(obj.dir, obj.dir2, 0.1);
        
        sssoundObj.add(sound);
        scene.add(loight);
        scene.add(sssoundObj);

        scene_objects.push({
            obj: sssoundObj,
            light: loight,
            sound: sound,
            penalty: 0,
            timeActive: 0,
            createdObj: obj,
            isIntro: true // flag for intro object
        });

        obj.created = true;
    }
}

//Game logic, copilot autocomplete says "this is where the magic happens"
function gameMech() {   

    //Log coordinates being used by active objects & filter out available objects and unoccupied positions
    const occupiedPositions = scene_objects.map(o => `${o.createdObj.x},${o.createdObj.y},${o.createdObj.z}`);
    const uncreatedObjects = objects.filter(obj => 
        !obj.created && !occupiedPositions.includes(`${obj.x},${obj.y},${obj.z}`)
    );

    //Randomly choose an object that hasn't been created
    const obx = Math.floor(Math.random()* uncreatedObjects.length);
    const obj = uncreatedObjects[obx];
    
    //Local vars for intances of objects
    const c = obj.col;
    const col = new THREE.Color(c);
    const baseSize = 0.15;
    const loight = new THREE.PointLight( col, 0.9 );
    const ssoundObj = new THREE.BoxGeometry(baseSize, baseSize, baseSize);
    const mat = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0});

    const sssoundObj = new THREE.Mesh(ssoundObj, mat);

    //Play video if object is TV
    if (obj === objects[0]) {
        videoObj.visible = true;
        video.play();
    };

    //Create objects if available
    if(uncreatedObjects.length > 0){
        loight.position.set(obj.x, obj.y, obj.z);
        sssoundObj.position.set(obj.x, obj.y, obj.z);
        sssoundObj.rotation.set(0, obj.rot, 0);
        sssoundObj.scale.set(obj.scale, obj.scale, obj.scale);
        
        //Load sound
        newSound = new THREE.PositionalAudio(listener);
        audioLoader.load(obj.sound, function(buffer) {
            newSound.setBuffer(buffer);
            newSound.setRefDistance(1);
            newSound.loop = true;
            newSound.play();
        });

        //Sound properties
        newSound.setDirectionalCone(obj.dir, obj.dir2, 0.1);

        //Debugging tool
        const posSoundHelper = new PositionalAudioHelper( newSound, 1 );
        newSound.add( posSoundHelper );

        // const geoHelper = new THREE.BoxHelper(sssoundObj, 0xffff00);
        // scene.add(geoHelper);

        sssoundObj.add(newSound);
        scene.add(loight);
        scene.add(sssoundObj);

        //Add to active objects with new properties for score
        scene_objects.push({
            obj: sssoundObj,
            light: loight,
            sound: newSound,
            penalty: 0,
            timeActive: 0,
            createdObj: obj
        });

        obj.created = true;
    };

    if (!scoreTimeout) {
    scoreLoop();
    };
}

//Score logic loop, ramps in conjunctions with difficulty
function scoreLoop() {
    if (scoreTimeout) clearTimeout(scoreTimeout);

    if (scene_objects.length === 0) {
        scoreTimeout = null;
        return;
    };

    scene_objects.forEach(active => {
        active.timeActive += 1;
        score -= 1;
    });

    updateScoreDisplay();

    scoreTimeout = setTimeout(scoreLoop, interval2);

    //"Game over" conditions
    if (score <= 0 || scene_objects.length == 9) {
        score = 0;
        updateScoreDisplay();

        controls.enabled = false;

        scene_objects.forEach(obj => {
            obj.sound.setVolume(0.4);
        });

        end();
        } else if (score > 100) {
            score = 100;
            updateScoreDisplay();
        };
}

function end() {
    let gameOverDiv = document.getElementById('gameOver');
    if (!gameOverDiv) {
        gameOverDiv = document.createElement('div');
        gameOverDiv.id = 'gameOver';
        gameOverDiv.style.position = 'fixed';
        gameOverDiv.style.top = '50%';
        gameOverDiv.style.left = '50%';
        gameOverDiv.style.transform = 'translate(-50%, -50%)';
        gameOverDiv.style.fontSize = '4em';
        gameOverDiv.style.fontFamily = 'Lucida Console, monospace';
        gameOverDiv.style.color = '#D3D3D3D3';
        gameOverDiv.style.background = 'rgba(46, 47, 48, 0.4)';
        gameOverDiv.style.padding = '0.5em 1em';
        gameOverDiv.style.borderRadius = '5px';
        gameOverDiv.style.zIndex = '10000';
        gameOverDiv.innerText = 'YOU FAILED';

        const restartBtn = document.createElement('button');
        restartBtn.innerText = 'Restart';
        restartBtn.cursor = 'pointer';
        restartBtn.style.display = 'block';
        restartBtn.style.margin = '0 auto 1em auto';
        restartBtn.style.fontSize = '0.5em';
        restartBtn.style.fontFamily = 'Lucida Console, monospace';
        restartBtn.style.padding = '0.5em 1em';
        restartBtn.style.cursor = 'pointer';
        restartBtn.onclick = refresh;

        gameOverDiv.insertBefore(restartBtn, gameOverDiv.firstChild);

        document.body.appendChild(gameOverDiv);
    } else {
        gameOverDiv.style.display = 'block';
    }
}

function refresh() {

    controls.enabled = true;

    scene_objects.forEach(obj => {
        scene.remove(obj.obj);
        scene.remove(obj.light);
        if(obj.sound && obj.sound.isPlaying) obj.sound.stop();
        obj.createdObj.created = false;
    });

    scene_objects = [];

    score = 0;
    updateScoreDisplay();

    if(loopInterval) clearTimeout(loopInterval);
    if(scoreTimeout) clearTimeout(scoreTimeout);
    interval = 5000;
    interval2 = 1000;

    const gameOverDiv = document.getElementById('gameOver');
    if(gameOverDiv) gameOverDiv.style.display = 'none';

    if(videoObj) {
        videoObj.visible = false;
        video.pause();
        video.currentTime = 0;
    };

    animate();
    transAnimation();
    introMech();
}

//Raycasting logic to handle clicks within the scene and turn off objects + score logic
function onMouseClick(event){
        mouse.x = (event.clientX / window.innerWidth) * 2 -1;
        mouse.y = -((event.clientY / window.innerHeight) * 2 -1);

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene_objects.map(obj => obj.obj), false);

        if(intersects.length > 0){
            console.log("clicked");
            const clickedObj = intersects[0].object;
            const idx = scene_objects.findIndex(active => active.obj === clickedObj);
            if (idx !== -1){
                const wasIntro = !!scene_objects[idx].isIntro;
                score += Math.max(5, 15 - scene_objects[idx].timeActive);
                if (score > 100) score = 100;
                updateScoreDisplay();

                if (scene_objects[idx].createdObj === objects[0]) {
                    videoObj.visible = false;
                    video.pause();
                    video.currentTime = 0;
                }

                scene.remove(scene_objects[idx].obj);
                scene.remove(scene_objects[idx].light);
                scene_objects[idx].sound.stop();
                scene_objects[idx].createdObj.created = false;
                scene_objects.splice(idx, 1);

                if(wasIntro){
                   gameLoop();
                }
            }

        } 
 }

window.addEventListener('click', onMouseClick, false);