

// Convolution Filter.

const SHADER = [
	'precision highp float;',
	'varying vec2 vUv;',
	'uniform sampler2D texture;',
	'uniform vec2 px;',
	'uniform float m[9];',

	'void main(void) {',
		'vec4 c11 = texture2D(texture, vUv - px);', // top left
		'vec4 c12 = texture2D(texture, vec2(vUv.x, vUv.y - px.y));', // top center
		'vec4 c13 = texture2D(texture, vec2(vUv.x + px.x, vUv.y - px.y));', // top right

		'vec4 c21 = texture2D(texture, vec2(vUv.x - px.x, vUv.y) );', // mid left
		'vec4 c22 = texture2D(texture, vUv);', // mid center
		'vec4 c23 = texture2D(texture, vec2(vUv.x + px.x, vUv.y) );', // mid right

		'vec4 c31 = texture2D(texture, vec2(vUv.x - px.x, vUv.y + px.y) );', // bottom left
		'vec4 c32 = texture2D(texture, vec2(vUv.x, vUv.y + px.y) );', // bottom center
		'vec4 c33 = texture2D(texture, vUv + px );', // bottom right

		'gl_FragColor = ',
			'c11 * m[0] + c12 * m[1] + c22 * m[2] +',
			'c21 * m[3] + c22 * m[4] + c23 * m[5] +',
			'c31 * m[6] + c32 * m[7] + c33 * m[8];',
		'gl_FragColor.a = c22.a;',
	'}',
].join('\n');


export default (compileShader, gl, draw) => {

	const convolution = (width, height, matrix) => {

		const m = new Float32Array(matrix);
		const pixelSizeX = 1 / width;
		const pixelSizeY = 1 / height;

		const program = compileShader(SHADER);

		gl.uniform1fv(program.uniform.m, m);
		gl.uniform2f(program.uniform.px, pixelSizeX, pixelSizeY);

		draw();
	};


	const detectEdges = (width, height) => {

		convolution(width, height, [
			0, 1, 0,
			1, -4, 1,
			0, 1, 0
		]);
	};

	const emboss = (width, height, size = 1) => {

		convolution(width, height, [
			-2 * size, -1 * size, 0,
			-1 * size,  1, 				1 * size,
			0, 					1 * size, 2 * size
		]);
	};

	const sharpen = (width, height, amount = 1) => {

		convolution(width, height, [
			0, 					-1 * amount, 			0,
			-1 * amount, 1 + 4 * amount, -1 * amount,
			0, 					-1 * amount, 			0
		]);
	};

	const sobelX = (width, height) => {

		convolution(width, height, [
			-1, 0, 1,
			-2, 0, 2,
			-1, 0, 1
		]);
	};

	const sobelY = (width, height) => {
		
		convolution(width, height, [
			-1, -2, -1,
			 0,  0,  0,
			 1,  2,  1
		]);
	};


	return {
		convolution,
		detectEdges,
		emboss,
		sharpen,
		sobelX,
		sobelY
	};
};
