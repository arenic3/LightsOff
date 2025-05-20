import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
import gsap from'gsap';

let camera, scene, renderer, controls, spotLight, spotTarget, lightHelper, axisHelper, audioLoader, listener, newSound;
let mesh, mesh2;
let loopInterval = null;
let interval = 5000;
const minInterval = 1000;
const ramp = 0.95;
let score = 0;
let scoreInterval = null;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const scoreDiv = document.createElement('div');


let objects = [
    {x: -1.5, y: -0.3, z: 0.6, rot: 3.1, dir: 180, dir2: 80, sound: 'assets/STATIC.mp3', created: false},
    {x: -3.05, y: -2.6, z: 2.7, rot: 3.1, dir: 140, dir2: 80, sound: 'assets/LAMP.mp3', created: false},
    {x: 2.2, y: -2.6, z: 0, rot: 2, dir: 170, dir2: 220, sound: 'assets/CAR.mp3', created: false},
    {x: -0.1, y: -3.2, z: -1.15, rot: 3.1, dir: 120, dir2: 90, sound: 'assets/FAUCET.mp3', created: false},
]

let scene_objects = [
]

const cssLight = document.querySelector('.light');
cssLight.addEventListener('click', () => {
    document.body.classList.toggle('on');
})

document.getElementById('startButton').addEventListener('click', ()=> {
    document.getElementById('heading').style.backgroundColor = 'rgba(0, 0, 0, 0';
    document.getElementById('header').style.margin = '10px';
    document.getElementById('header').style.fontSize = '4em';
    document.getElementById('sceneContainer').style.display = 'block';
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('lightbulb').style.display = 'none';
    scoreDiv.id = 'score';
    scoreDiv.style.position = 'fixed';
    scoreDiv.style.top = '20px';
    scoreDiv.style.right = '40px';
    scoreDiv.style.fontSize = '2em';
    scoreDiv.style.color = '#FF0000';
    scoreDiv.style.zIndex = '9999';
    scoreDiv.innerText = `Score: ${score}`;
    document.body.appendChild(scoreDiv);

    setup();
    transAnimation();
});

function updateScoreDisplay() {
    scoreDiv.innerText = `Score: ${score}`;
}

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
    scene.add( axisHelper);
}

function initAudio() {
    listener = new THREE.AudioListener();
    camera.add(listener);
    
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
    
    // spotLight = new THREE.SpotLight( spotLightCol, 200 );
    // spotLight.position.set(-2.6, 1.6, 2.4);
    // spotLight.angle = 0.35;
	// spotLight.penumbra = 0.5;
	// spotLight.decay = 2;
	// spotLight.distance = 4;
    // spotLight.castShadow = true;
	// spotLight.shadow.mapSize.width = 1024;
	// spotLight.shadow.mapSize.height = 1024;
    // spotLight.shadow.camera.near = 1;
	// spotLight.shadow.camera.far = 10;
	// spotLight.shadow.focus = 1;
    // scene.add(spotLight);

    // spotTarget = new THREE.Object3D();
    // spotTarget.position.set(-2.6, -4, 2.4);
    // spotLight.target = spotTarget;
    // scene.add(spotTarget);

    // lightHelper = new THREE.SpotLightHelper( spotLight );
	// scene.add( lightHelper );
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
    loader.load('assets/interior.glb', (gltf) => {
        mesh = gltf.scene.children[0];
        console.log(gltf.scene.children);
        mesh.position.set(0, -3, 0);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add(mesh);
        
    });

    loader.load('assets/exterior.glb', (gltf) => {
        mesh2 = gltf.scene.children[0];
        mesh2.position.set(0, -3, 0);
        mesh2.receiveShadow = true;
        mesh2.castShadow = true;
        mesh2.material.transparent = true;
        mesh2.material.opacity = 1;
        mesh2.scale.set(1.01, 1.01, 1.01);  //Avoid clipping
        scene.add(mesh2);
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
        x: 8,
        y: 5,
        z: 8,
        duration: 2,
        ease: "slow"
    });

    tl.to(camera.position, {
        x: 8,
        y: -2,
        z: -8,
        duration: 2,
        ease: "slow"
    });

    tl.to(camera.position, {
        x: -8,
        y: 0,
        z: -8,
        duration: 2,
        ease: "slow"
    });

    tl.to(camera.position, {
        x: -15,
        y: 15,
        z: 15,
        duration: 2,
        ease: "slow"
    });
}

function resetAnimation() {

}

function animate() {
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.update();

    if (mesh2 && mesh2.material) {
        const mesh2Pos = new THREE.Vector3();
        mesh2.getWorldPosition(mesh2Pos);
        const distance = camera.position.distanceTo(mesh2Pos);

        const minDist = 12;
        const maxDist = 25;
        let opacity = (distance - minDist) / (maxDist - minDist);
        opacity = THREE.MathUtils.clamp(opacity, 0.1, 1);

        mesh2.material.transparent = true;
        mesh2.material.opacity = opacity;
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    //lightHelper.update();
}

function gameLoop() {
   if (loopInterval) clearTimeout(loopInterval);

   gameMech();

   interval = Math.max(minInterval, interval * ramp);
   loopInterval = setTimeout(gameLoop, interval);
}

function gameMech() {               
    //generate light & sound object at specified positions within the sceeeene

    const occupiedPositions = scene_objects.map(o => `${o.createdObj.x},${o.createdObj.y},${o.createdObj.z}`);
    const uncreatedObjects = objects.filter(obj => 
        !obj.created && !occupiedPositions.includes(`${obj.x},${obj.y},${obj.z}`)
    );
    
    const loight = new THREE.PointLight( 0xffffff, 0.9 );
    const ssoundObj = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const mat = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0});

    const sssoundObj = new THREE.Mesh(ssoundObj, mat);

    const obx = Math.floor(Math.random()* uncreatedObjects.length);
    const obj = uncreatedObjects[obx];

    if(uncreatedObjects.length > 0){
        loight.position.set(obj.x, obj.y, obj.z);
        sssoundObj.position.set(obj.x, obj.y, obj.z);
        sssoundObj.rotation.set(0, obj.rot, 0);

        newSound = new THREE.PositionalAudio( listener );

        audioLoader.load( obj.sound, function( buffer ) {
            newSound.setBuffer( buffer );
            newSound.setRefDistance(1);
            newSound.loop = true;
            newSound.play();
        });

        newSound.setDirectionalCone(obj.dir, obj.dir2, 0.1);
        const posSoundHelper = new PositionalAudioHelper( newSound, 1 );
        newSound.add( posSoundHelper );

        sssoundObj.add(newSound);
        scene.add(loight);
        scene.add(sssoundObj);

        scene_objects.push({
            obj: sssoundObj,
            light: loight,
            sound: newSound,
            penalty: 0,
            timeActive: 0,
            createdObj: obj
        });

        obj.created = true;
    }

    if (!scoreInterval) {
        scoreInterval = setInterval(() => {
        if (scene_objects.length === 0) {
            clearInterval(scoreInterval);
            scoreInterval = null;
            return;
        }

        scene_objects.forEach(active => {
            active.timeActive += 1;
            score -= 1;            
        });

        updateScoreDisplay();
        }, 1000);
    }
}

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
                score += Math.max(10, 20 - scene_objects[idx].timeActive);
                updateScoreDisplay();
                scene.remove(scene_objects[idx].obj);
                scene.remove(scene_objects[idx].light);
                scene_objects[idx].sound.stop();
                scene_objects[idx].createdObj.created = false;
                scene_objects.splice(idx, 1);

                if(scene_objects.length === 0){
                    clearInterval(scoreInterval);
                    scoreInterval = null;
                }
            }

        } 
 }

window.addEventListener('click', onMouseClick, false);