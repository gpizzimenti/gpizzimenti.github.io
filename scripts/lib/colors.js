export function HexToRGB(H) {
	let r = 0;
	let g = 0;
	let b = 0;
	if (H.length === 4) {
		r = `0x${H[1]}${H[1]}`;
		g = `0x${H[2]}${H[2]}`;
		b = `0x${H[3]}${H[3]}`;
	} else if (H.length === 7) {
		r = `0x${H[1]}${H[2]}`;
		g = `0x${H[3]}${H[4]}`;
		b = `0x${H[5]}${H[6]}`;
	}

	return [r, g, b];
}

/*-----------------------------------------------------------------------------------------------*/

export function HexToHSL(H) {
	const rgb = HexToRGB(H);
	let r = rgb[0];
	let g = rgb[1];
	let b = rgb[2];

	r /= 255;
	g /= 255;
	b /= 255;
	const cmin = Math.min(r, g, b);
	const cmax = Math.max(r, g, b);
	const delta = cmax - cmin;
	let h = 0;
	let s = 0;
	let l = 0;

	if (delta === 0) h = 0;
	else if (cmax === r) h = ((g - b) / delta) % 6;
	else if (cmax === g) h = (b - r) / delta + 2;
	else h = (r - g) / delta + 4;

	h = Math.round(h * 60);

	if (h < 0) h += 360;

	l = (cmax + cmin) / 2;
	s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
	s = +(s * 100).toFixed(1);
	l = +(l * 100).toFixed(1);

	return [h, s, l];
}

/*-----------------------------------------------------------------------------------------------*/

export function HSLToRGB(h, s, l) {
	const S = s / 100;
	const L = l / 100;

	const c = (1 - Math.abs(2 * L - 1)) * S;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = L - c / 2;
	let r = 0;
	let g = 0;
	let b = 0;

	if (0 <= h && h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (60 <= h && h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (120 <= h && h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (180 <= h && h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (240 <= h && h < 300) {
		r = x;
		g = 0;
		b = c;
	} else if (300 <= h && h < 360) {
		r = c;
		g = 0;
		b = x;
	}
	// Having obtained RGB, convert channels to hex
	r = Math.round((r + m) * 255).toString(16);
	g = Math.round((g + m) * 255).toString(16);
	b = Math.round((b + m) * 255).toString(16);

	return [r, g, b];
}

/*-----------------------------------------------------------------------------------------------*/

export function HSLToHex(h, s, l) {
	const rgb = HSLToRGB(h, s, l);

	if (rgb[0].length === 1) rgb[0] = `0${r}`;
	if (rgb[1].length === 1) rgb[1] = `0${g}`;
	if (rgb[2].length === 1) rgb[2] = `0${b}`;

	return `#${rgb[0]}${rgb[1]}${rgb[2]}`;
}

/*-----------------------------------------------------------------------------------------------*/

export function invertColor(hex) {
	let HEX = hex;

	if (hex.indexOf("#") === 0) {
		HEX = hex.slice(1);
	}
	// convert 3-digit hex to 6-digits.
	if (HEX.length === 3) {
		HEX = HEX[0] + HEX[0] + HEX[1] + HEX[1] + HEX[2] + HEX[2];
	}

	if (HEX.length !== 6) {
		throw new Error("Invalid HEX color.");
	}
	// invert color components
	const r = (255 - parseInt(HEX.slice(0, 2), 16)).toString(16);
	const g = (255 - parseInt(HEX.slice(2, 4), 16)).toString(16);
	const b = (255 - parseInt(HEX.slice(4, 6), 16)).toString(16);
	// pad each with zeros and return
	return `#${padZero(r)}${padZero(g)}${padZero(b)}`;
}

/*-----------------------------------------------------------------------------------------------*/

function padZero(str, len) {
	const LEN = len || 2;
	const zeros = new Array(LEN).join("0");
	return (zeros + str).slice(-LEN);
}
