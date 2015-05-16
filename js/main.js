import { scene, camera, renderer, canvas } from './scene';
import { raycast } from 'js/events';
import { getXYZ, getLatLng, geodecoder } from './geo';
import { mapTexture } from './canvas';
import topojson from 'topojson';
import { getTween } from './utils';
import d3 from 'd3';

console.log(topojson)

d3.json('data/world.json', function (err, data) {
  var world, earth, sphere, overlay;

  var segments = 200; // increase for better accuracy

  var countries = topojson.feature(data, data.objects.countries);
  var geo = geodecoder(countries.features);

  // Base globe
  earth  = new THREE.MeshBasicMaterial({color: '#033649', transparent: true});
  sphere = new THREE.SphereGeometry(200, segments, segments);

  var globe = new THREE.Mesh(sphere, earth);
  globe.rotation.y = Math.PI;
  globe.scale.set(2.75, 2.75, 2.75);
  globe.addEventListener('click', onGlobeClick);

  // add country outlines
  world  = mapTexture(countries, true);
  earth  = new THREE.MeshBasicMaterial({map: world, transparent: true});
  sphere = new THREE.SphereGeometry(200, segments, segments);

  var outlines = new THREE.Mesh(sphere, earth);
  outlines.rotation.y = Math.PI;
  outlines.scale.set(2.75, 2.75, 2.75);

  // create a container node and add the two meshes
  var root = new THREE.Object3D();
  root.add(globe);
  root.add(outlines);


  scene.add(root);

  function onGlobeClick(event) {

    console.log("click!!", event)

    // Find the middle of the face that was clicked
    var point, map, material;

    // Get the vertices
    var a = this.geometry.vertices[event.face.a];
    var b = this.geometry.vertices[event.face.b];
    var c = this.geometry.vertices[event.face.c];

    // Averge them together
    point = new THREE.Vector3();
    point.x = (a.x + b.x + c.x) / 3;
    point.y = (a.y + b.y + c.y) / 3;
    point.z = (a.z + b.z + c.z) / 3;

    // Convert to latitude/longitude
    var latlng = getLatLng(point);

    // Get new camera position
    var temp = new THREE.Mesh()
    temp.position.copy(getXYZ(latlng, 900));
    temp.lookAt(root.position);
    temp.rotateY(Math.PI);

    console.log("temp", temp.rotation, root.position)

    // tween camera to that new position and rotation;
    var tweenPos = getTween.call(camera, 'position', temp.position);
    d3.timer(tweenPos);

    var tweenRot = getTween.call(camera, 'rotation', temp.rotation);
    d3.timer(tweenRot);

    // See if a country exists at that location
    var country = geo.search(latlng[0], latlng[1]);

    if (country !== null) {
      // Update the html 
      d3.select("#info")
        .html('<h2>' + country.code + '</h2>');

       // Overlay the selected country
      var map = mapTexture(geo.find(country.code), true, '#E8DDCB');
      material = new THREE.MeshBasicMaterial({map: map, transparent: true});

      if (!overlay) {
        overlay = new THREE.Mesh(new THREE.SphereGeometry(201, 40, 40), material);
        overlay.rotation.y = Math.PI;
        overlay.scale.set(2.75, 2.75, 2.75);
        scene.add(overlay);
      } else {
        overlay.material = material;
      }
    }
  }
    window.camera = camera;

  raycast(camera, [globe], 'click');
});

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
}
animate();