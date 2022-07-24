

/**
	*
	*		'webgl-filter' is a port of the WebGLImageFilter by Dominic Szablewski.
	* 	
	*		This version modernizes the original sourcecode to esNext and es6 modules.
	*
	*
	*
	*		Thank you to Dominic Szablewski - phoboslab.org - for all the hard work!
	*		https://github.com/phoboslab/WebGLImageFilter
	*
	*
	*
	**/


import webGLProgram  from './program.js';
import standard 		 from './standard.js';
import convolutional from './convolutional.js';
import blur 				 from './blur.js';


const DRAW_INTERMEDIATE = 1;
const FLOAT_SIZE 				= Float32Array.BYTES_PER_ELEMENT;
const VERT_SIZE 				= 4 * FLOAT_SIZE;

const SHADER_VERTEX_IDENTITY = [
	'precision highp float;',
	'attribute vec2 pos;',
	'attribute vec2 uv;',
	'varying vec2 vUv;',
	'uniform float flipY;',

	'void main(void) {',
		'vUv = uv;',
		'gl_Position = vec4(pos.x, pos.y*flipY, 0.0, 1.);',
	'}'
].join('\n');

const SHADER_FRAGMENT_IDENTITY = [
	'precision highp float;',
	'varying vec2 vUv;',
	'uniform sampler2D texture;',

	'void main(void) {',
		'gl_FragColor = texture2D(texture, vUv);',
	'}',
].join('\n');


const createFramebufferTexture = (gl, width, height) => {

	const fbo = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

	const renderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	return {fbo, texture};
};


const imageFilter = (params = {}) => {
	
	const	canvas = params.canvas 							|| document.createElement('canvas');
	const gl 		 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	if (!gl) {
		throw `Couldn't get WebGL context`;
	}

	let drawCount 							= 0;
	let sourceTexture 					= null;
	let lastInChain 						= false;
	let	currentFramebufferIndex = -1;
	let tempFramebuffers 			  = [null, null];
	let filterChain 						= [];
	let width 									= -1; 
	let	height 								 	= -1;
	let	vertexBuffer 					 	= null;
	let	currentProgram 				 	= null;

	// Key is the shader program source, value is the compiled program.
	const shaderProgramCache = {};	
	
	const getTempFramebuffer = index => {

		tempFramebuffers[index] = tempFramebuffers[index] || 
															createFramebufferTexture(gl, width, height);

		return tempFramebuffers[index];
	};

	const draw = flags => {

		let source = null; 
		let target = null;
		let flipY  = false;

		// Set up the source
		if (drawCount === 0) {

			// First draw call - use the source texture.
			source = sourceTexture;
		}
		else {

			// All following draw calls use the temp buffer last drawn to.
			source = getTempFramebuffer(currentFramebufferIndex).texture;
		}

		drawCount += 1;

		// Set up the target.
		if (lastInChain && !(flags & DRAW_INTERMEDIATE)) {

			// Last filter in our chain - draw directly to the WebGL Canvas. 
			// We may also have to flip the image vertically now.
			target = null;
			flipY  = drawCount % 2 === 0;
		}
		else {

			// Intermediate draw call - get a temp buffer to draw to.
			currentFramebufferIndex = (currentFramebufferIndex + 1) % 2;
			target = getTempFramebuffer(currentFramebufferIndex).fbo;
		}

		// Bind the source and target and draw the two triangles.
		gl.bindTexture(gl.TEXTURE_2D, source);
		gl.bindFramebuffer(gl.FRAMEBUFFER, target);

		gl.uniform1f(currentProgram.uniform.flipY, (flipY ? -1 : 1));
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	};
	

	const compileShader = fragmentSource => {

		if (shaderProgramCache[fragmentSource]) {
			currentProgram = shaderProgramCache[fragmentSource];

			gl.useProgram(currentProgram.id);

			return currentProgram;
		}

		// Compile shaders
		currentProgram = webGLProgram(gl, SHADER_VERTEX_IDENTITY, fragmentSource);
		
		gl.enableVertexAttribArray(currentProgram.attribute.pos);
		gl.vertexAttribPointer(currentProgram.attribute.pos, 2, gl.FLOAT, false, VERT_SIZE , 0);
		gl.enableVertexAttribArray(currentProgram.attribute.uv);
		gl.vertexAttribPointer(currentProgram.attribute.uv, 2, gl.FLOAT, false, VERT_SIZE, 2 * FLOAT_SIZE);

		shaderProgramCache[fragmentSource] = currentProgram;

		return currentProgram;
	};


	const resize = (w, h) => {

		// Same width/height? Nothing to do here.
		if (w === width && h === height) { return; }

		canvas.width  = width  = w;
		canvas.height = height = h;

		// Create the context if we don't have it yet.
		if (!vertexBuffer) {

			// Create the vertex buffer for the two triangles [x, y, u, v] * 6.
			const vertices = new Float32Array([
				-1, -1, 0, 1,  1, -1, 1, 1,  -1, 1, 0, 0,
				-1,  1, 0, 0,  1, -1, 1, 1,   1, 1, 1, 0
			]);

			vertexBuffer = gl.createBuffer();

			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

			// Note sure if this is a good idea; at least it makes texture loading
			// in Ejecta instant.
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		}

		gl.viewport(0, 0, width, height);

		// Delete old temp framebuffers.
		tempFramebuffers = [null, null];
	};


	const filters = {
		...standard(compileShader, gl, draw),
		...convolutional(compileShader, gl, draw),
		...blur(compileShader, gl, draw)
	};

	
	const addFilter = (name, ...args) => {

		const func = filters[name];

		filterChain.push({func, args});
	};


	const reset = () => {

		filterChain = [];
	};


	let applied = false;


	const apply = image => {

		resize(image.width, image.height);

		drawCount = 0;

		// Create the texture for the input image
		if (!sourceTexture) {			
			sourceTexture = gl.createTexture();
		}

		gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); 

		if (!applied) {

			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			
			applied = true;
		} 
		else {
			gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		}

		// No filters? Just draw
		if (filterChain.length === 0) {

			compileShader(SHADER_FRAGMENT_IDENTITY);

			draw();

			return canvas;
		}

		const count = filterChain.length - 1;

		filterChain.forEach((filter, index) => {

			lastInChain = (index === count);

			const {func, args} = filter;

			// Include width, height for convolutional functions.
			func(width, height, ...args);
		});

		return canvas;
	};
	

	return {
		addFilter,
		apply,
		reset
	};
	
};


export default imageFilter;
