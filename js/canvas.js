
var projection = d3.geo.equirectangular()
  .translate([1000, 500])
  .scale(320);

export function mapTexture(json, fill, color) {
  var texture, context, canvas;

  canvas = d3.select("body").append("canvas")
    .style("display", "none")
    .attr("width", "2000px")
    .attr("height", "1000px");

  context = canvas.node().getContext("2d");

  var path = d3.geo.path()
    .projection(projection)
    .context(context);

  context.strokeStyle = "#000000";
  context.lineWidth = 0.25;
  context.fillStyle = color || "blue";

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