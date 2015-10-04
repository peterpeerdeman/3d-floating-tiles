
	var updateFcts	= [];
	var renderer;
	var scene;
	var camera;
	var planes	= [];
	var files = [
		'1.jpg',
		'2.jpg',
		'3.jpg',
		'4.jpg',
		'5.jpg',
		'6.jpg',
		'7.jpg',
		'8.jpg',
		'9.jpg',
		'10.jpg',
		'11.jpg',
		'12.jpg',
		'13.jpg',
		'14.jpg',
		'15.jpg',
		'16.jpg',
		'17.jpg'
	];
	var mouse = {
		x : 0, 
		y : 0
	}

	setup();

	function setup() {
		setupRenderer();
		setupWorld();
		setupObjects();
		setupControls();
		setupRenderLoop();
		setupShaderVignette();
	}

	function setupRenderer() {
		if (window.WebGLRenderingContext) {
			renderer = new THREE.WebGLRenderer();
		} else {
			renderer = new THREE.CanvasRenderer();
		}
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.setClearColor( 0x32b38c);
		document.body.appendChild( renderer.domElement );
	}

	function setupWorld() {
		scene	= new THREE.Scene();
		camera	= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10 );
		camera.position.z = -5;
	}

	function setupControls() {

		document.addEventListener('mousemove', function(event){
			mouse.x	= (event.clientX / window.innerWidth ) - 0.5
			mouse.y	= (event.clientY / window.innerHeight) - 0.5
		}, false);

		window.addEventListener( 'resize', onWindowResize, false );
	}
	
	function setupShaderVignette() {
		composer = new THREE.EffectComposer( renderer );
		composer.addPass( new THREE.RenderPass( scene, camera ) );
		
		var shaderVignette = THREE.VignetteShader;
		var effectVignette = new THREE.ShaderPass( shaderVignette );
		effectVignette.uniforms[ "offset" ].value = 1.1;
		effectVignette.uniforms[ "darkness" ].value = 1.0;
		effectVignette.renderToScreen = true;
		composer.addPass(effectVignette);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function setupRenderLoop() {
		var lastTimeMsec= null
		requestAnimationFrame(function animate(nowMsec){
			// keep looping
			requestAnimationFrame( animate );
			// measure time
			lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
			var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
			lastTimeMsec	= nowMsec
			// call each update function
			updateFcts.forEach(function(updateFn){
				updateFn(deltaMsec/1000, nowMsec/1000)
			})

			composer.render( scene, camera );	
		})
	}
	function createTexture() {

	}

	function createLine(x, y, z) {
		var material = new THREE.LineBasicMaterial({
	        color: 0xccffcc
	    });
	    var geometry = new THREE.Geometry();
	    geometry.vertices.push(new THREE.Vector3(x, y, z));
	    geometry.vertices.push(new THREE.Vector3(x, y+2,z));
	    var line = new THREE.Line(geometry, material);
	    return line;
	}
	function setupObjects() {
		var geometry	= new THREE.PlaneGeometry(1,1);

		var materials = [];
		for(var i = 0; i<files.length;i++) {
			var texture = createTexture()
			var material	= new THREE.MeshBasicMaterial({ 
				map:THREE.ImageUtils.loadTexture('basic_files/' + files[i])
			})
			material.side	= THREE.DoubleSide
			material.map.needsUpdate = true;
			materials.push(material);
		}

		var nObjects	= 35
		for(var i = 0; i < nObjects; i++){
//			var mesh	= new THREE.Mesh(geometry, materials[i%files.length]);
			
			var colorMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

			// cube
			var mesh = new THREE.Mesh(new THREE.CubeGeometry(1, 1, .1), 
				materials[i%files.length]
			);
			mesh.rotation.y = 0.45
			mesh.rotation.z = de2ra(45);
			mesh.overdraw = true;
			//scene.add(cube);

			scene.add(mesh);
			initializeMeshPosition(mesh);
			planes.push(mesh);

		}

	}

	function de2ra (degree)   { return degree*(Math.PI/180); }

	function initializeMeshPosition(mesh) {
		mesh.position.x	= (Math.random()-0.5) * 10
		mesh.position.y	= - (Math.random() * 10) - 2
		mesh.position.z	= Math.random() * 5 
		mesh.rotation.x	= Math.random() * Math.PI * .05 - 0.025
		mesh.rotation.y	= Math.random() * Math.PI * .05 - 0.025
		mesh.rotation.z	+= Math.random() * .05 - 0.025
		mesh.speed = Math.random() * 0.01 + 0.005;
	}

	// update meshes
	updateFcts.push(function(delta, now){
		for(var i = 0; i<planes.length;i++) {
			//bounds checking
			if (planes[i].position.y > 4) {
				initializeMeshPosition(planes[i]);
			}
			//update meshes
			planes[i].position.y += planes[i].speed;
		}
	})
	
	updateFcts.push(function() {
		camera.position.x += ( mouse.x - camera.position.x ) * .05;
		camera.position.y += ( - mouse.y - camera.position.y ) * .05;
		camera.lookAt( scene.position );
	})
