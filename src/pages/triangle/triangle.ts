// load shader code
import shaderSource from './shader.wgsl';

// create some constants for accessing WebGPU
const canvas = document.querySelector('canvas') || document.createElement('canvas');
const surface = canvas.getContext('webgpu');

async function main () {

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter?.requestDevice();

  // device must exist to continue
  if (device === undefined) return;

  // configure the surface (canvas) for the device
  surface?.configure({
    device,
    format: 'bgra8unorm'
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