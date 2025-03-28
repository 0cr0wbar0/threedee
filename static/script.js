let scene, camera, renderer, model, mixer, actions = [], clock, isWireframe = false;
function init(uri) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa570ff);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera = new THREE.PerspectiveCamera(60,
        window.innerWidth / window.innerHeight, 0.1,
        1000);
    camera.position.set(-2, 3, -5);
    const ambient = new
    THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
    scene.add(ambient);
    const light = new
    THREE.DirectionalLight(0xFFFFFF, 2);
    light.position.set(0, 0, 0);
    camera.add(light);
    scene.add(camera);
    document.body.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    const btn = document.getElementById("btn");
    btn.addEventListener('click', function() {
        actions.forEach(action => {
            action.timeScale = 1;
            action.reset();
            action.setLoop(THREE.LoopRepeat, 1); // Plays twice (original + 1 repeat)
            action.clampWhenFinished = true;
            action.play();
        });
    });
    const wireframeBtn = document.getElementById("wireframe");
    wireframeBtn.addEventListener('click', function () {
        isWireframe = !isWireframe;
        toggleWireframe(isWireframe);
    });
    const loader = new THREE.GLTFLoader();
    loader.load(uri, function (gltf) {
        model = gltf.scene;
        scene.add(model);

        if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                actions.push(mixer.clipAction(clip));
            });
        }
        
    });

    clock = new THREE.Clock();

    animate();
}

function toggleWireframe(enable) {
    scene.traverse(function (object) {
       if (object.isMesh) {
           object.material.wireframe = enable;
       }
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
    }
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});