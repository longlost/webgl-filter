
const collect = (source, prefix, collection) => {
	const r = new RegExp(`\\b${prefix} \\w+ (\\w+)`, 'ig');
	
	source.replace(r, (match, name) => {
		collection[name] = 0;
		
		return match;
	});
};


const compile = (gl, source, type) => {
	const shader = gl.createShader(type);

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader));

		return null;
	}

	return shader;
};


const webGLProgram = function(gl, vertexSource, fragmentSource) {

	const uniform 	= {};
	const attribute = {};

	const vsh = compile(gl, vertexSource, 	gl.VERTEX_SHADER);
	const fsh = compile(gl, fragmentSource, gl.FRAGMENT_SHADER);

	const id = gl.createProgram();

	gl.attachShader(id, vsh);
	gl.attachShader(id, fsh);
	gl.linkProgram(id);

	if (!gl.getProgramParameter(id, gl.LINK_STATUS)) {
		console.log(gl.getProgramInfoLog(id));
	}

	gl.useProgram(id);

	// Collect attributes
	collect(vertexSource, 'attribute', attribute);

	for (const a in attribute) {
		attribute[a] = gl.getAttribLocation(id, a);
	}

	// Collect uniforms
	collect(vertexSource, 	'uniform', uniform);
	collect(fragmentSource, 'uniform', uniform);

	for (const u in uniform) {
		uniform[u] = gl.getUniformLocation(id, u);
	}

	return {
		attribute,
		id,
		uniform
	}
};


export default webGLProgram;
