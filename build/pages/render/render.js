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
        format: 'bgra8unorm',
        alphaMode: 'opaque'
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
                    clearValue: { r: 0.0, g: 0.5, b: 1.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store'
                }]
        });
        renderPass.end();
        device.queue.submit([commandEncoder.finish()]);
    }
    requestAnimationFrame(() => {
        draw();
    });
}
if (navigator.gpu) {
    main();
}
else {
    const error = document.createElement('p');
    error.className = 'errorMsg';
    error.textContent = "It seems your browser doesn't support WebGPU. Make sure you're using the Nightly version of Firefox or the Canary version of Chrome or Edge and enable the WebGPU flag.";
    document.body.replaceChild(error, canvas);
}
