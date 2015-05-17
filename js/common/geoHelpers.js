
export function getPoint(event) {

  // Get the vertices
  let a = this.geometry.vertices[event.face.a];
  let b = this.geometry.vertices[event.face.b];
  let c = this.geometry.vertices[event.face.c];

  // Averge them together
  let point = {
    x: (a.x + b.x + c.x) / 3,
    y: (a.y + b.y + c.y) / 3,
    z: (a.z + b.z + c.z) / 3
  };

  return point;
}

export function getEventCenter(event, radius) {
  radius = radius || 200;

  var point = getPoint.call(this, event);

  var latRads = Math.acos(point.y / radius);
  var lngRads = Math.atan2(point.z, point.x);
  var lat = (Math.PI / 2 - latRads) * (180 / Math.PI);
  var lng = (Math.PI - lngRads) * (180 / Math.PI);

  return [lat, lng - 180];
}

export function convertToXYZ(point, radius) {
  radius = radius || 200;

  var latRads = ( 90 - point[0]) * Math.PI / 180;
  var lngRads = (180 - point[1]) * Math.PI / 180;

  var x = radius * Math.sin(latRads) * Math.cos(lngRads);
  var y = radius * Math.cos(latRads);
  var z = radius * Math.sin(latRads) * Math.sin(lngRads);

  return {x: x, y: y, z: z};
}

export var geodecoder = function (features) {

  let store = {};

  for (let i = 0; i < features.length; i++) {
    store[features[i].id] = features[i];
  }

  return {
    find: function (id) {
      return store[id];
    },
    search: function (lat, lng) {

      let match = false;

      let country, coords;

      for (let i = 0; i < features.length; i++) {
        country = features[i];
        if(country.geometry.type === 'Polygon') {
          match = pointInPolygon(country.geometry.coordinates[0], [lng, lat]);
          if (match) {
            return {
              code: features[i].id,
              name: features[i].properties.name
            };
          }
        } else if (country.geometry.type === 'MultiPolygon') {
          coords = country.geometry.coordinates;
          for (let j = 0; j < coords.length; j++) {
            match = pointInPolygon(coords[j][0], [lng, lat]);
            if (match) {
              return {
                code: features[i].id,
                name: features[i].properties.name
              };
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

  let x = point[0];
  let y = point[1];

  let inside = false, xi, xj, yi, yj, xk;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    xi = poly[i][0];
    yi = poly[i][1];
    xj = poly[j][0];
    yj = poly[j][1];

    xk = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (xk) {
       inside = !inside;
    }
  }

  return inside;
};


