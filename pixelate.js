
// Pixelate Filter

const SHADER = [
  'precision highp float;',
  'varying vec2 vUv;',
  'uniform vec2 size;',
  'uniform sampler2D texture;',

  'vec2 pixelate(vec2 coord, vec2 size) {',
    'return floor( coord / size ) * size;',
  '}',

  'void main(void) {',
    'gl_FragColor = vec4(0.0);',
    'vec2 coord = pixelate(vUv, size);',
    'gl_FragColor += texture2D(texture, coord);',
  '}',
].join('\n');


export default (compileShader, gl, draw) => {

  const pixelate = (width, height, size = 0) => {

    const blurSizeX = size / width;
    const blurSizeY = size / height;

    const program = compileShader(SHADER);

    // Horizontal
    gl.uniform2f(program.uniform.size, blurSizeX, blurSizeY);

    draw();
  };

  return {pixelate};
};
