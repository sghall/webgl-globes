export function getLatLng(vector, radius) {
  radius = radius || 200;

  var latRads = Math.acos(vector.y / radius);
  var lngRads = Math.atan2(vector.z, vector.x);
  var lat = (Math.PI / 2 - latRads) * (180 / Math.PI);
  var lng = (Math.PI - lngRads) * (180 / Math.PI);

  return [lat, lng - 180];
}

export function getXYZ(point, radius) {
  radius = radius || 200;

  var latRads = ( 90 - point[0]) * Math.PI / 180;
  var lngRads = (180 - point[1]) * Math.PI / 180;

  var x = radius * Math.sin(latRads) * Math.cos(lngRads);
  var y = radius * Math.cos(latRads);
  var z = radius * Math.sin(latRads) * Math.sin(lngRads);

  return new THREE.Vector3(x, y, z);
}

export var geodecoder = function (features) {

  var store = {}

  for (var i = 0; i < features.length; i++) {
    store[features[i].id] = features[i];
  }

  return {
    find: function (id) {
      return store[id];
    },
    search: function (lat, lng) {

      var match = false;

      var country, coords;

      for (var i = 0; i < features.length; i++) {
        country = features[i];
        if(country.geometry.type === 'Polygon') {
          match = pointInPolygon(country.geometry.coordinates[0], [lng, lat]);
          if (match) {
            return { 
              code: features[i].id, 
              name: features[i].properties.name
            }
          }
        } else if (country.geometry.type === 'MultiPolygon') {
          coords = country.geometry.coordinates;
          for (var j = 0; j < coords.length; j++) {
            match = pointInPolygon(coords[j][0], [lng, lat]);
            if (match) {
              return { 
                code: features[i].id, 
                name: features[i].properties.name
              }
            }
          }
        }
      }

      return null;
    }
  };
};

// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
var pointInPolygon = function(poly, point) {
    
  var x = point[0];
  var y = point[1];

  var inside = false, xi, xj, xk;

  for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    xi = poly[i][0], yi = poly[i][1];
    xj = poly[j][0], yj = poly[j][1];
    
    xk = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (xk) {
       inside = !inside;
    }
  }

  return inside;
};


