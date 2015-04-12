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