(function(global, THREE) {
  // Wetterlandschaft als Klasse
  function WeatherLandscape(container, options) {
    options = options || {};
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    const width = container.clientWidth, height = container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.up.set(0, 1, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sunLight.position.set(50, 60, 25);
    this.sunLight.lookAt(0, 0, 0);
    this.scene.add(this.sunLight);

    const loader = new THREE.GLTFLoader();
    loader.load(options.modelUrl || '', (gltf) => {
      this.model = gltf.scene;
      this.scene.add(this.model);
      this.centerAndZoom();
    }, undefined, (err) => console.error('GLTF load error', err));

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  WeatherLandscape.prototype.centerAndZoom = function() {
    const box = new THREE.Box3().setFromObject(this.model);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * 2.2;
    this.camera.position.set(center.x + dist, center.y + dist*0.8, center.z + dist);
    this.camera.lookAt(center);
  };

  WeatherLandscape.prototype.animate = function() {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  WeatherLandscape.prototype.onResize = function() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    this.camera.aspect = w/h; this.camera.updateProjectionMatrix();
    this.renderer.setSize(w,h);
  };

  WeatherLandscape.prototype.setTime = function(t) {
    const az = (t/24)*Math.PI*2 - Math.PI/2;
    const r=60, y = Math.sin(az)*30+20, x = Math.cos(az)*r, z = Math.sin(az)*r;
    this.sunLight.position.set(x,y,z);
    this.sunLight.lookAt(0,0,0);
  };

  WeatherLandscape.prototype.setTemperature = function(temp) {
    if (!this.model) return;
    const cold = new THREE.Color(0x3399ff), hot = new THREE.Color(0xff6600);
    const t = Math.max(0, Math.min(1, (temp-0)/40));
    const col = cold.clone().lerp(hot, t);
    this.model.traverse(o => {
      if (o.isMesh && o.material) {
        if (Array.isArray(o.material))
          o.material.forEach(m => m.color.copy(col));
        else
          o.material.color.copy(col);
      }
    });
  };

  WeatherLandscape.prototype.setWeather = function(type) {
    console.log('WeatherLandscape.setWeather:', type);
  };

  global.WeatherLandscape = WeatherLandscape;
})(window, THREE);
