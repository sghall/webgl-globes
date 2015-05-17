import { scene, camera, renderer } from './common/scene';
import { setEvents } from './common/setEvents';
import { convertToXYZ, getEventCenter, geodecoder, getPoint } from './common/geoHelpers';
import { mapTexture } from './common/mapTexture';
import { getTween, memoize } from './common/utils';
import topojson from 'topojson';
import THREE from 'THREE';
import d3 from 'd3';

d3.json('data/world.json', function (err, data) {

  d3.select("#loading").transition().duration(500)
    .style("opacity", 0).remove();

  var currentCountry, overlay, currentPoint;

  var segments = 155; // number of vertices. Higher = better mouse accuracy

  // Setup cache for country textures
  var countries = topojson.feature(data, data.objects.countries);
  var geo = geodecoder(countries.features);

  var textureCache = memoize(function (cntryID, color) {
    var country = geo.find(cntryID);
    return mapTexture(country, color);
  });

  // Geometry/material for the point that follows cursor
  let pointGeometry = new THREE.SphereGeometry(1, 10, 10);
  let pointMaterial = new THREE.MeshPhongMaterial({color: 'red'});

  // Base globe with grey "water" material
  let blueMaterial = new THREE.MeshPhongMaterial({color: '#2B3B59', transparent: true});
  let sphere = new THREE.SphereGeometry(200, segments, segments);
  let baseGlobe = new THREE.Mesh(sphere, blueMaterial);
  baseGlobe.rotation.y = Math.PI;
  baseGlobe.addEventListener('click', onGlobeClick);
  baseGlobe.addEventListener('mousemove', onGlobeMousemove);

  // add base map layer with all countries
  let worldTexture = mapTexture(countries, '#647089');
  let mapMaterial  = new THREE.MeshPhongMaterial({map: worldTexture, transparent: true});
  var baseMap = new THREE.Mesh(new THREE.SphereGeometry(200, segments, segments), mapMaterial);
  baseMap.rotation.y = Math.PI;

  // add wireframe layer
  let wireMaterial  = new THREE.MeshPhongMaterial({wireframe: true, transparent: true});
  var wireFrame = new THREE.Mesh(new THREE.SphereGeometry(201, segments, segments), wireMaterial);
  wireFrame.rotation.y = Math.PI;

  // create a container node and add the two meshes
  var root = new THREE.Object3D();
  root.scale.set(3, 3, 3);
  root.add(baseGlobe);
  root.add(baseMap);
  root.add(wireFrame);
  scene.add(root);

  function onGlobeClick(event) {

    // Get pointc, convert to latitude/longitude
    var latlng = getEventCenter.call(this, event);

    // Get new camera position
    var temp = new THREE.Mesh();
    temp.position.copy(convertToXYZ(latlng, 900));
    temp.lookAt(root.position);
    temp.rotateY(Math.PI);

    for (let key in temp.rotation) {
      if (temp.rotation[key] - camera.rotation[key] > Math.PI) {
        temp.rotation[key] -= Math.PI * 2;
      } else if (camera.rotation[key] - temp.rotation[key] > Math.PI) {
        temp.rotation[key] += Math.PI * 2;
      }
    }

    var tweenPos = getTween.call(camera, 'position', temp.position);
    d3.timer(tweenPos);

    var tweenRot = getTween.call(camera, 'rotation', temp.rotation);
    d3.timer(tweenRot);
  }

  function onGlobeMousemove(event) {
    var map, material;

    // Get pointc, convert to latitude/longitude
    var latlng = getEventCenter.call(this, event);

    // Look for country at that latitude/longitude
    var country = geo.search(latlng[0], latlng[1]);

    if (currentPoint) {
      wireFrame.remove(currentPoint);
    }
    currentPoint = new THREE.Mesh(pointGeometry, pointMaterial);
    currentPoint.position.copy(getPoint.call(this, event));
    wireFrame.add(currentPoint);

    if (country !== null && country.code !== currentCountry) {

      // Track the current country displayed
      currentCountry = country.code;

      // Update the html
      d3.select("#msg").html(country.code);

       // Overlay the selected country
      map = textureCache(country.code, 'grey');

      material = new THREE.MeshPhongMaterial({map: map, transparent: true});
      if (!overlay) {
        overlay = new THREE.Mesh(new THREE.SphereGeometry(201, 40, 40), material);
        overlay.rotation.y = Math.PI;
        root.add(overlay);
      } else {
        overlay.material = material;
      }
    }
  }

  setEvents(camera, [baseGlobe], 'click');
  setEvents(camera, [baseGlobe], 'mousemove', 10);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
