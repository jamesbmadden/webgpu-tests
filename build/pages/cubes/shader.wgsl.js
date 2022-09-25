export default `struct Uniforms {
  transformation: mat4x4<f32>
}
@binding(0)
@group(0)
var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(@location(0) pos: vec3<f32>) -> @builtin(position) vec4<f32> {

  return vec4<f32>(pos, 1.0) * uniforms.transformation;

}

@fragment
fn fs_main(@builtin(position) in: vec4<f32>) -> @location(0) vec4<f32> {
  return vec4<f32>(0.0, 0.0, 0.0, 1.0);
}
`;
