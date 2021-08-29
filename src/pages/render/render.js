"use strict";
// create some constants for accessing WebGPU
const canvas = document.querySelector('canvas') || document.createElement('canvas');
const surface = canvas.getContext('webgpu');
// allow for await syntax
async function main() {
    var _a;
    // create adapter and device
    const adapter = await ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
    const device = await (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice());
    // make sure device exists
    if (device === undefined)
        return;
    // configure the surface (canvas context) to be able to draw from this device
    surface === null || surface === void 0 ? void 0 : surface.configure({
        device,
        format: 'bgra8unorm'
    });
    // put the draw function inside the main function to allow use of scoped variables
    async function draw() {
        // make sure device exists
        if (device === undefined)
            return;
        // create the view to render to and make sure its not null
        const view = surface === null || surface === void 0 ? void 0 : surface.getCurrentTexture().createView();
        if (view === undefined)
            return;
        // create command encoder and render pass
        const commandEncoder = device.createCommandEncoder();
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                    view,
                    loadValue: { r: 0.0, g: 0.5, b: 1.0, a: 1.0 },
                    storeOp: 'store'
                }]
        });
        renderPass.endPass();
        device.queue.submit([commandEncoder.finish()]);
    }
    requestAnimationFrame(() => {
        draw();
    });
}
main();
