// load shader code
import shaderSource from './shader.wgsl.js';

// create some constants for accessing WebGPU
const canvas = document.querySelector('canvas') || document.createElement('canvas');
const surface = canvas.getContext('webgpu');

// make array of vertices
const vertices = new Float32Array([
  // pos          colour
  0.0,  0.5,  0.0, 1.0, 0.0, 0.0,
  -0.5, -0.5, 0.0, 0.0, 1.0, 0.0,
  0.5,  -0.5, 0.0, 0.0, 0.0, 1.0
]);

async function main () {

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter?.requestDevice();

  // device must exist to continue
  if (device === undefined) return;
  if (adapter === null) return;
  if (surface === null) return;

  // get the ideal format
  const format = navigator.gpu.getPreferredCanvasFormat();

  // configure the surface (canvas) for the device
  surface?.configure({ device, format, alphaMode: 'premultiplied' });

  // create the shader module
  const shader = device.createShaderModule({
    code: shaderSource
  });
  // and the vertex buffer
  const vertexBuf = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true
  });
  new Float32Array(vertexBuf.getMappedRange()).set(vertices);
  vertexBuf.unmap();

  // create render pipeline
  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: []
  });
  const renderPipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: shader,
      entryPoint: 'vs_main',
      buffers: [{
        arrayStride: 4 * 6,
        attributes: [
          { 
            // position
            shaderLocation: 0,
            offset: 0,
            format: 'float32x3'
          },
          {
            // colour
            shaderLocation: 1,
            offset: 4 * 3,
            format: 'float32x3'
          }
        ]
      }]
    },
    fragment: {
      module: shader,
      entryPoint: 'fs_main',
      targets: [{ format }]
    },
    primitive: {
      topology: 'triangle-list',
      cullMode: 'back'
    }
  });

  // okay now lets render
  async function draw () {

    // make sure device exists
    if (device === undefined) return;

    // create view to render to and make sure its not underfined
    const view = surface?.getCurrentTexture().createView();
    if (view === undefined) return;

    // create command encoder and render pass
    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view,
        loadOp: 'load',
        storeOp: 'store'
      }]
    });

    // render :)
    renderPass.setPipeline(renderPipeline);
    renderPass.setVertexBuffer(0, vertexBuf);
    renderPass.draw(3, 1);
    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);

  }

  requestAnimationFrame(() => {
    draw();
  });

}

// check if WebGPU is supported. Otherwise, show an error message
if (navigator.gpu) {
  main();
} else {
  const error = document.createElement('p');
  error.className = 'errorMsg';
  error.textContent = "It seems your browser doesn't support WebGPU. Make sure you're using the Nightly version of Firefox or the Canary version of Chrome or Edge and enable the WebGPU flag.";
  document.body.replaceChild(error, canvas);
}