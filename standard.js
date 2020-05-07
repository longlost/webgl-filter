

// Standard Filters that apply a colorMatrix.

import color from './color.js';


const	LUM_R = 0.213;
const	LUM_G = 0.715;
const	LUM_B = 0.072;


export default (compileShader, gl, draw) => {

	const colorMatrix = color(compileShader, gl, draw);

	const brightness = (w, h, brightness = 0) => {
		const b = brightness + 1;

		colorMatrix([
				b, 0, 0, 0, 0,
				0, b, 0, 0, 0,
				0, 0, b, 0, 0,
				0, 0, 0, 1, 0
		]);
	};

	const brownie = () => {
		colorMatrix([
			0.5997023498159715,0.34553243048391263,-0.2708298674538042,0,47.43192855600873,
			-0.037703249837783157,0.8609577587992641,0.15059552388459913,0,-36.96841498319127,
			0.24113635128153335,-0.07441037908422492,0.44972182064877153,0,-7.562075277591283,
			0,0,0,1,0
		]);
	};

	const contrast = (w, h, amount = 0) => {
		var v = amount + 1;
		var o = -128 * (v - 1);
		
		colorMatrix([
			v, 0, 0, 0, o,
			0, v, 0, 0, o,
			0, 0, v, 0, o,
			0, 0, 0, 1, 0
		]);
	};

	const desaturateLuminance = () => {
		colorMatrix([
			0.2764723, 0.9297080, 0.0938197, 0, -37.1,
			0.2764723, 0.9297080, 0.0938197, 0, -37.1,
			0.2764723, 0.9297080, 0.0938197, 0, -37.1,
			0, 0, 0, 1, 0
		]);
	};

	const hue = (w, h, degrees = 0) => {
		const rotation = degrees / 180 * Math.PI;

		const cos = Math.cos(rotation);
		const sin = Math.sin(rotation);		

		colorMatrix([
			LUM_R+cos*(1-LUM_R)+sin*(-LUM_R),LUM_G+cos*(-LUM_G)+sin*(-LUM_G),LUM_B+cos*(-LUM_B)+sin*(1-LUM_B),0,0,
			LUM_R+cos*(-LUM_R)+sin*(0.143),LUM_G+cos*(1-LUM_G)+sin*(0.140),LUM_B+cos*(-LUM_B)+sin*(-0.283),0,0,
			LUM_R+cos*(-LUM_R)+sin*(-(1-LUM_R)),LUM_G+cos*(-LUM_G)+sin*(LUM_G),LUM_B+cos*(1-LUM_B)+sin*(LUM_B),0,0,
			0, 0, 0, 1, 0
		]);
	};

	const kodachrome = () => {
		colorMatrix([
			1.1285582396593525,-0.3967382283601348,-0.03992559172921793,0,63.72958762196502,
			-0.16404339962244616,1.0835251566291304,-0.05498805115633132,0,24.732407896706203,
			-0.16786010706155763,-0.5603416277695248,1.6014850761964943,0,35.62982807460946,
			0,0,0,1,0
		]);
	};

	const polaroid = () => {
		colorMatrix([
			1.438,-0.062,-0.062,0,0,
			-0.122,1.378,-0.122,0,0,
			-0.016,-0.016,1.483,0,0,
			0,0,0,1,0
		]);
	};

	const negative = (w, h) => {
		contrast(w, h, -2);
	};

	const saturation = (w, h, amount = 0) => {
		const x = amount * 2 / 3 + 1;
		const y = ((x - 1) * -0.5);

		colorMatrix([
			x, y, y, 0, 0,
			y, x, y, 0, 0,
			y, y, x, 0, 0,
			0, 0, 0, 1, 0
		]);
	};

	const desaturate = (w, h) => {
		saturation(w, h, -1);
	};

	const sepia = () => {
		colorMatrix([
			0.393, 0.7689999, 0.18899999, 0, 0,
			0.349, 0.6859999, 0.16799999, 0, 0,
			0.272, 0.5339999, 0.13099999, 0, 0,
			0,0,0,1,0
		]);
	};

	const shiftToBGR = () => {
		colorMatrix([
			0,0,1,0,0,
			0,1,0,0,0,
			1,0,0,0,0,
			0,0,0,1,0
		]);
	};

	const technicolor = () => {
		colorMatrix([
			1.9125277891456083,-0.8545344976951645,-0.09155508482755585,0,11.793603434377337,
			-0.3087833385928097,1.7658908555458428,-0.10601743074722245,0,-70.35205161461398,
			-0.231103377548616,-0.7501899197440212,1.847597816108189,0,30.950940869491138,
			0,0,0,1,0
		]);
	};

	const vintagePinhole = () => {
		colorMatrix([
			0.6279345635605994,0.3202183420819367,-0.03965408211312453,0,9.651285835294123,
			0.02578397704808868,0.6441188644374771,0.03259127616149294,0,7.462829176470591,
			0.0466055556782719,-0.0851232987247891,0.5241648018700465,0,5.159190588235296,
			0,0,0,1,0
		]);
	};
	

	return {
		brightness,
		brownie,
		colorMatrix,
		contrast,
		desaturate,
		desaturateLuminance,
		hue,
		kodachrome,
		negative,
		polaroid,
		saturation,
		sepia,
		shiftToBGR,
		technicolor,
		vintagePinhole
	};
};
