
// Blur Filter.

const DRAW_INTERMEDIATE = 1;

const SHADER = [
	'precision highp float;',
	'varying vec2 vUv;',
	'uniform sampler2D texture;',
	'uniform vec2 px;',

	'void main(void) {',
		'gl_FragColor = vec4(0.0);',
		'gl_FragColor += texture2D(texture, vUv + vec2(-7.0*px.x, -7.0*px.y))*0.0044299121055113265;',
		'gl_FragColor += texture2D(texture, vUv + vec2(-6.0*px.x, -6.0*px.y))*0.00895781211794;',
		'gl_FragColor += texture2D(texture, vUv + vec2(-5.0*px.x, -5.0*px.y))*0.0215963866053;',
		'gl_FragColor += texture2D(texture, vUv + vec2(-4.0*px.x, -4.0*px.y))*0.0443683338718;',
		'gl_FragColor += texture2D(texture, vUv + vec2(-3.0*px.x, -3.0*px.y))*0.0776744219933;',
		'gl_FragColor += texture2D(texture, vUv + vec2(-2.0*px.x, -2.0*px.y))*0.115876621105;',
		'gl_FragColor += texture2D(texture, vUv + vec2(-1.0*px.x, -1.0*px.y))*0.147308056121;',
		'gl_FragColor += texture2D(texture, vUv                             )*0.159576912161;',
		'gl_FragColor += texture2D(texture, vUv + vec2( 1.0*px.x,  1.0*px.y))*0.147308056121;',
		'gl_FragColor += texture2D(texture, vUv + vec2( 2.0*px.x,  2.0*px.y))*0.115876621105;',
		'gl_FragColor += texture2D(texture, vUv + vec2( 3.0*px.x,  3.0*px.y))*0.0776744219933;',
		'gl_FragColor += texture2D(texture, vUv + vec2( 4.0*px.x,  4.0*px.y))*0.0443683338718;',
		'gl_FragColor += texture2D(texture, vUv + vec2( 5.0*px.x,  5.0*px.y))*0.0215963866053;',
		'gl_FragColor += texture2D(texture, vUv + vec2( 6.0*px.x,  6.0*px.y))*0.00895781211794;',
		'gl_FragColor += texture2D(texture, vUv + vec2( 7.0*px.x,  7.0*px.y))*0.0044299121055113265;',
	'}',
].join('\n');


export default (compileShader, gl, draw) => {

	const blur = (width, height, radius = 0) => {

		const blurSizeX = (radius / 7) / width;
		const blurSizeY = (radius / 7) / height;

		const program = compileShader(SHADER);

		// Vertical
		gl.uniform2f(program.uniform.px, 0, blurSizeY);

		draw(DRAW_INTERMEDIATE);

		// Horizontal
		gl.uniform2f(program.uniform.px, blurSizeX, 0);

		draw();
	};


	return {blur};
};
