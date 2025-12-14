let activeExpandedViewID = undefined;

document.addEventListener('keydown', function(event) {
	if (event.key === 'Escape') {
		hide(activeExpandedViewID);
	}
});

function show(id) {
	const element = document.querySelector(`#${id}`);
	element.style.display = 'block';
	activeExpandedViewID = id;
}

function hide(id) {
	const element = document.querySelector(`#${id}`);
	if (activeExpandedViewID != undefined) element.style.display = 'none';
	activeExpandedViewID = undefined;
}

// temporary spellchecking
//document.body.contentEditable = "true";
//document.body.spellcheck = "true";



// video controller

const videoCount = document.getElementsByTagName("video").length;

const togglePlay = (id) => {
	const play = document.getElementById(`play-${id}`);
	const video = document.getElementById(`video-${id}`);
	if (video.paused) {
		video.play();
	} else {
		video.pause();
	}
	play.style.opacity = '0';
};

const showFull = (id) => {
	const play = document.getElementById(`play-${id}`);
	const video = document.getElementById(`video-${id}`);
//	video.pause();
	if (video.requestFullscreen) {
		video.requestFullscreen();
	} else if (video.webkitRequestFullscreen) { // Safari
		video.webkitRequestFullscreen();
	} else if (video.msRequestFullscreen) { // IE/Edge legacy
		video.msRequestFullscreen();
	}
	play.style.opacity = '0';
	video.focus();
};

for (let id = 1; id <= videoCount; id++) {
	const video = document.getElementById(`video-${id}`);
	const toggle = document.getElementById(`toggle-${id}`);
	const seek = document.getElementById(`seek-${id}`);
	const play = document.getElementById(`play-${id}`);
	const full = document.getElementById(`full-${id}`);

	toggle.addEventListener('click', () => togglePlay(id));
	video.addEventListener('click', () => togglePlay(id));
	seek.addEventListener('input', e => {
		e.stopPropagation(); // (!) prevent bubbling to video
		const percent = parseFloat(seek.value);
		video.currentTime = (percent / 100) * video.duration;
		play.style.opacity = '0';
	});
	video.addEventListener('timeupdate', () => {
		const percent = (video.currentTime / video.duration) * 100;
		seek.value = percent.toFixed(2);
	});
	full.addEventListener('click', () => showFull(id));
}


// highlighting JS code

function highlightJS(preId) {
	const pre = document.getElementById(preId);
	const src = pre.textContent;
	let out = "";
	let i = 0;

	const keywords = new Set([
		"const","let","var","function","return","if","else","for","while",
		"switch","case","break","new"
	]);

	function span(cls, text) {
		return `<span class="${cls}">${text}</span>`;
	}

	while (i < src.length) {
		const ch = src[i];
		if (ch === "/" && src[i+1] === "/") { // line comment
			let start = i;
			while (i < src.length && src[i] !== "\n") i++;
			out += span("comment", src.slice(start, i));
			continue;
		}
		if (ch === "/" && src[i+1] === "*") { // block comment
			let start = i;
			i += 2;
			while (i < src.length && !(src[i] === "*" && src[i+1] === "/")) i++;
			i += 2;
			out += span("comment", src.slice(start, i));
			continue;
		}
		if (ch === "/" && src[i+1] !== "/" && src[i+1] !== "*") { // regex literal
			let start = i;
			i++;
			let inClass = false;
			while (i < src.length) {
				if (src[i] === "\\" && i+1 < src.length) { i += 2; continue; }
				if (src[i] === "[") { inClass = true; i++; continue; }
				if (src[i] === "]") { inClass = false; i++; continue; }
				if (src[i] === "/" && !inClass) { i++; break; }
				i++;
			}
			while (i < src.length && /[a-z]/i.test(src[i])) i++; // flags
			out += span("regex", src.slice(start, i));
			continue;
		}
		if (ch === '"' || ch === "'") { // string
			const quote = ch;
			let start = i;
			i++;
			while (i < src.length) {
				if (src[i] === "\\" && i+1 < src.length) { i += 2; continue; }
				if (src[i] === quote) { i++; break; }
				i++;
			}
			out += span("string", src.slice(start, i));
			continue;
		}
		if (/\d/.test(ch)) { // number
			let start = i;
			while (i < src.length && /[\d.]/.test(src[i])) i++;
			out += span("number", src.slice(start, i));
			continue;
		}
		const punctuationTokens = [ // punctuation (operators, braces, etc.)
			"===","==","!=","<=",">=","+=","-=","&&","||",
			"=","!",">","<","+","-","*","/","%",
			"(",")","{","}","[","]",":",";","."
		];
		let matched = null;
		for (const tok of punctuationTokens) {
			if (src.startsWith(tok, i)) { matched = tok; break; }
		}
		if (matched) {
			out += span("punctuation", matched);
			i += matched.length;
			continue;
		}
		if (/[A-Za-z_$]/.test(ch)) { // identifier / keyword
			let start = i;
			while (i < src.length && /[A-Za-z0-9_$]/.test(src[i])) i++;
			const word = src.slice(start, i);
			if (keywords.has(word)) {
				out += span("keyword", word);
			} else {
				out += word;
			}
			continue;
		}
		out += ch;
		i++;
	}
	pre.innerHTML = out;
}

function highlightJava(preId) {
	const pre = document.getElementById(preId);
	const src = pre.textContent;
	let out = "";
	let i = 0;

	const keywords = new Set([
		"abstract","assert","boolean","break","byte","case","catch","char","class","const","continue",
		"default","do","double","else","enum","extends","final","finally","float","for","goto","if",
		"implements","import","instanceof","int","interface","long","native","new","package","private",
		"protected","public","return","short","static","strictfp","super","switch","synchronized","this",
		"throw","throws","transient","try","void","volatile","while"
	]);

	function span(cls, text) {
		return `<span class="${cls}">${text}</span>`;
	}

	while (i < src.length) {
		const ch = src[i];

		if (ch === "/" && src[i+1] === "/") { // line comment
			let start = i;
			while (i < src.length && src[i] !== "\n") i++;
			out += span("comment", src.slice(start, i));
			continue;
		}
		if (ch === "/" && src[i+1] === "*") { // block comment
			let start = i;
			i += 2;
			while (i < src.length && !(src[i] === "*" && src[i+1] === "/")) i++;
			i += 2;
			out += span("comment", src.slice(start, i));
			continue;
		}
		if (ch === '"' || ch === "'") { // string
			const quote = ch;
			let start = i;
			i++;
			while (i < src.length) {
				if (src[i] === "\\" && i+1 < src.length) { i += 2; continue; }
				if (src[i] === quote) { i++; break; }
				i++;
			}
			out += span("string", src.slice(start, i));
			continue;
		}
		if (/\d/.test(ch)) { // number
			let start = i;
			while (i < src.length && /[\d.eE]/.test(src[i])) i++;
			out += span("number", src.slice(start, i));
			continue;
		}
		const punctuationTokens = [ // punctuation (operators, braces, etc.)
			"===","==","!=","<=",">=","+=","-=","&&","||",
			"=","!",">","<","+","-","*","/","%",
			"(",")","{","}","[","]",":",";",";",".",",","|"
		];
		let matched = null;
		for (const tok of punctuationTokens) {
			if (src.startsWith(tok, i)) { matched = tok; break; }
		}
		if (matched) {
			out += span("punctuation", matched);
			i += matched.length;
			continue;
		}
		if (/[A-Za-z_$]/.test(ch)) { // identifier / keyword
			let start = i;
			while (i < src.length && /[A-Za-z0-9_$]/.test(src[i])) i++;
			const word = src.slice(start, i);
			if (keywords.has(word)) {
				out += span("keyword", word);
			} else {
				out += word;
			}
			continue;
		}

		out += ch;
		i++;
	}
	pre.innerHTML = out;
}





