import shaderSource from "./shader.wgsl.js";

// get references to canvas, image element, and surface
const canvas = document.querySelector('canvas') || document.createElement('canvas');
const img = document.querySelector('img') || document.createElement('img');
const surface = canvas.getContext('webgpu');

// create vertices
const vertices = new Float32Array([
  // position  texture coords
  -1,  1, 0,   0, 0,
  -1, -1, 0,   0, 1,
   1, -1, 0,   1, 1,

  -1,  1, 0,   0, 0,
   1, -1, 0,   1, 1,
   1,  1, 0,   1, 0
]);

async function main () {

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter?.requestDevice();

  // make sure all variables exist properly
  if (device === undefined) return;
  if (adapter === null) return;
  if (surface === null) return;

  // get the ideal format
  const format = surface.getPreferredFormat(adapter);
  // and configure the surface (it'll be configured again later to set the size)
  surface.configure({ device, format });

  const shader = device.createShaderModule({ code: shaderSource });

  // create and write to vertex buffer
  const vertexBuf = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true
  });
  new Float32Array(vertexBuf.getMappedRange()).set(vertices);
  vertexBuf.unmap();

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shader,
      entryPoint: 'vs_main',
      buffers: [{
        arrayStride: 4 * 5,
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
            format: 'float32x2'
          }
        ]
      }]
    },
    fragment: {
      module: shader,
      entryPoint: 'fs_main',
      targets: [{ format }]
    }
  });


  async function drawImg () {

    if (device === undefined) return;
    if (adapter === null) return;
    if (surface === null) return;

    // make sure image is loaded before anything happens
    await img.decode();

    // make sure the canvas and surface matches the size of the image
    canvas.width = img.width;
    canvas.height = img.height;
    surface.configure({ device, format, size: { width: img.width * devicePixelRatio, height: img.height * devicePixelRatio } });

    // create the texture
    let texture: GPUTexture;
    {
      const imgBitmap = await createImageBitmap(img);

      texture = device.createTexture({
        size: [ imgBitmap.width, imgBitmap.height, 1 ],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
      });
      device.queue.copyExternalImageToTexture(
        { source: imgBitmap },
        { texture },
        [ imgBitmap.width, imgBitmap.height ]
      );
    }

    // Create a sampler with linear filtering for smooth interpolation.
    const sampler = device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });

    // create bind group for texture
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: sampler
        },
        {
          binding: 1,
          resource: texture.createView()
        }
      ]
    });

    // create view to render to and make sure its not underfined
    const view = surface?.getCurrentTexture().createView();
    if (view === undefined) return;

    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view,
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: 'clear',
        storeOp: 'store'
      }]
    });

    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.setVertexBuffer(0, vertexBuf);
    renderPass.draw(6, 1);
    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);

  }

  // loading the texture, creating the bind group, etc will have to happen on every draw as the texture and size changes. 
  drawImg();

  document.querySelector('button')?.addEventListener('click', () => {
    
    // create a file input element and click it
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.hidden = true;
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);

    // when a file gets uploaded we should do something about that
    input.addEventListener('input', (event: any) => {

      img.src = URL.createObjectURL(event.target.files[0]);
      drawImg();

    });

  });

}

// fallback error message for unsupported browsers
if (navigator.gpu) main();
else {
  const error = document.createElement('p');
  error.className = 'errorMsg';
  error.textContent = "It seems your browser doesn't support WebGPU. Make sure you're using the Nightly version of Firefox or the Canary version of Chrome or Edge and enable the WebGPU flag.";
  document.body.replaceChild(error, canvas);
}