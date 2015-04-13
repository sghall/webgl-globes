
var projection = d3.geo.equirectangular()
  .translate([2000, 1000])
  .scale(640);

export function mapTexture(json, fill, color) {
  var texture, context, canvas;

  canvas = d3.select("body").append("canvas")
    .style("display", "none")
    .attr("width", "4000px")
    .attr("height", "2000px");

  context = canvas.node().getContext("2d");

  var path = d3.geo.path()
    .projection(projection)
    .context(context);

  context.strokeStyle = "#000000";
  context.lineWidth = 0.25;
  context.fillStyle = color || "#CDB380";

  context.beginPath();

  path(json);

  if (fill) {
    context.fill();
  }

  context.stroke();

  // DEBUGGING
  // console.log(canvas.node().toDataURL());

  texture = new THREE.Texture(canvas.node());
  texture.needsUpdate = true;

  canvas.remove();

  return texture;
}