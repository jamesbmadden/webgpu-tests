const shaderSource = `struct VertexOutput {
  [[builtin(position)]] pos: vec4<f32>;
  [[location(0)]] tex_coords: vec2<f32>;
};

[[stage(vertex)]]
fn vs_main(
  [[location(0)]] pos: vec3<f32>,
  [[location(1)]] tex_coords: vec2<f32>
) -> VertexOutput {
  var out: VertexOutput;
  out.pos = vec4<f32>(pos, 1.0);
  out.tex_coords = tex_coords;
  return out;
}

[[group(0), binding(0)]] var tex_sampler: sampler;
[[group(0), binding(1)]] var texture: texture_2d<f32>;

[[stage(fragment)]]
fn fs_main(in: VertexOutput) -> [[location(0)]] vec4<f32> {
  var colours: vec4<f32> = textureSample(texture, tex_sampler, in.tex_coords);
  var average: f32 = (colours.x + colours.y + colours.z) / 3.0;
  return vec4<f32>(average, average, average, colours.w);
}

`;
export default shaderSource;
