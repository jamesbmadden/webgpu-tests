const shaderSource: string = `struct VertexOutput {
  @builtin(position) pos: vec4<f32>,
  @location(0) colour: vec4<f32>
};

@vertex
fn vs_main(@location(0) pos: vec3<f32>, @location(1) colour: vec3<f32>) -> VertexOutput {
  var output: VertexOutput;
  output.pos = vec4<f32>(pos, 1.0);
  output.colour = vec4<f32>(colour, 1.0);
  return output;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return in.colour;
}`;

export default shaderSource;