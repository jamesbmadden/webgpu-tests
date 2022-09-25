import shaderSource from './shader.wgsl.js';
// let's access webgpu!
const canvas = document.querySelector('canvas') || document.createElement('canvas');
// make sure the canvas size matches the window size
sizeCanvas(innerWidth, innerHeight);
// and run the sizing anytime the window size changes
addEventListener('resize', () => sizeCanvas(innerWidth, innerHeight));
// get the surface for webgpu
const surface = canvas.getContext('webgpu');
// make an array of vertices for a cube :)
const cubeVertices = new Float32Array([
    // front face
    0.0, 1.0, 1.0,
    0.0, 0.0, 1.0,
    1.0, 0.0, 1.0,
    1.0, 1.0, 1.0,
    // back face
    0.0, 1.0, 0.0,
    0.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 1.0, 0.0, // top right
]);
// and an array of indices
const cubeIndices = new Uint16Array([
    // front face
    0, 1, 2,
    0, 2, 3,
    // left face
    4, 5, 0,
    5, 1, 0
]);
// used linear algebra to calculate this transformation matrix by hand :)
const transformationMatrix = [
    Math.cos(Math.PI / 4), 0, Math.sin(Math.PI / 4), 0,
    0, 1, 0, 0,
    -Math.sin(Math.PI / 4), 0, Math.cos(Math.PI / 4), 0,
    0, 0, 0, 1
];
/**
 * Either on init or when the window is resized, make sure the canvas resolution matches the screen
 * @param width
 * @param height
 */
function sizeCanvas(width, height) {
    canvas.width = width;
    canvas.height = height;
}
/**
 * Actually create the webgpu instance and draw some stuff to the screen :)
 */
async function main() {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice());
    // if device and surface don't exist, we failed :(
    if (device === undefined)
        throw "Couldn't load the adapter/device :(";
    if (surface === null)
        throw "Couldn't get the canvas surface for rendering :(";
    // get the ideal format
    const format = navigator.gpu.getPreferredCanvasFormat();
    // configure the surface
    surface.configure({ device, format, alphaMode: 'opaque' });
    // create the shader module
    const shader = device.createShaderModule({ code: shaderSource });
    // and some buffers :)
    const vertexBuf = device.createBuffer({
        size: cubeVertices.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    });
    // add the vertices into the buffer
    new Float32Array(vertexBuf.getMappedRange()).set(cubeVertices);
    vertexBuf.unmap();
    // do the same with an index buffer
    const indexBuf = device.createBuffer({
        size: cubeIndices.byteLength,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true
    });
    new Uint16Array(indexBuf.getMappedRange()).set(cubeIndices);
    indexBuf.unmap();
    // create the uniform buffer
    const uniformBuf = device.createBuffer({
        size: 4 * 16,
        usage: GPUBufferUsage.UNIFORM,
        mappedAtCreation: true
    });
    new Float32Array(uniformBuf.getMappedRange()).set(transformationMatrix);
    uniformBuf.unmap();
    // create a bind group layout that describes the uniforms
    const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                    hasDynamicOffset: false
                }
            }
        ]
    });
    // and the bind group 😊
    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniformBuf
                }
            }
        ]
    });
    // create the render pipeline
    const pipeline = await device.createRenderPipelineAsync({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        }),
        vertex: {
            module: shader,
            entryPoint: 'vs_main',
            buffers: [{
                    arrayStride: 4 * 3,
                    attributes: [
                        // position
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: 'float32x3'
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
    // draw - if we ever animate this will be moved to its own function
    const view = surface.getCurrentTexture().createView();
    // create command encoder and render pass
    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
                view,
                clearValue: { r: 1, g: 1, b: 1, a: 1 },
                loadOp: 'clear',
                storeOp: 'store'
            }]
    });
    // finally, we can render :)
    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.setVertexBuffer(0, vertexBuf);
    renderPass.setIndexBuffer(indexBuf, 'uint16');
    renderPass.drawIndexed(cubeIndices.length);
    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);
}
main();
