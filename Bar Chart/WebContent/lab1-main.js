var gl;
var textContext;
var shaderProgram;
var draw_type = 2;

// ////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialize WebGL canvas, sorry!");
	}
}

function initText(canvas) {
	try {
		textContext = canvas.getContext("2d");
		textContext.width = canvas.width;
		textContext.height = canvas.height;
	} catch (e) {
	}
	if (!textContext) {
		alert("Could not initialize Text canvas, sorry!");
	}
}

// /////////////////////////////////////////////////////////

var squareVertexPositionBuffer;
var squareVertexColorBuffer;
var squareVertexIndexBuffer;

var vertices = [];
var indices = [];
var colors = [];
var axisLabelXs = [];
var margin = 0.25;
var num_vertices;
var num_indices;
var num_groups;
var bars_per_group;

var bar_colors = [ [ 0.7, 0.0, 0.0, 1.0 ], [ 0.0, 0.7, 0.0, 1.0 ],
		[ 0.0, 0.0, 0.7, 1.0 ], [ 0.7, 0.7, 0.0, 1.0 ] ];

function setColorForIndex(i) {
	for (var count = 0; count < 4; count++) {
		for (var j = 0; j < 4; j++) {
			colors.push(bar_colors[i][j]);
		}
	}
}

function createAllBarVertices(avgs) {

	vertices = [];
	indices = [];
	colors = [];
	axisLabelXs = [];

	num_groups = avgs.length;
	bars_per_group = avgs[0].length;
	var num_bars = num_groups * bars_per_group;
	num_vertices = num_bars * 4;
	num_indices = num_bars * 6;

	var min, max;
	var range;
	min = 0;
	max = Number(avgs[0][0]);
	// find min and max
	for (var i = 0; i < num_groups; i++) {
		for (var j = 0; j < bars_per_group; j++) {
			if (Number(avgs[i][j]) < min)
				min = Number(avgs[i][j]);
			if (Number(avgs[i][j]) > max)
				max = Number(avgs[i][j]);
		}
	}
	range = max - min;

	var group_margin = (2 - 2*margin) / num_bars;
	var group_width = (2 - 2*margin - ((num_groups - 1) * group_margin)) / num_groups;
	var bar_width = group_width / bars_per_group;
	var bar_margin = bar_width / 6;
	var l = 0;
	for (var g = 0; g < num_groups; g++) {
		for (var i = 0; i < bars_per_group; i++) {

			vertices.push(-1 + margin + g * group_margin + g * group_width + i
					* bar_width + bar_margin / 2);
			vertices.push(-1 + margin);
			vertices.push(0.0);
			vertices.push(-1 + margin + g * group_margin + g * group_width
					+ (i + 1) * bar_width - bar_margin / 2);
			vertices.push(-1 + margin);
			vertices.push(0.0);
			vertices.push(-1 + margin + g * group_margin + g * group_width
					+ (i + 1) * bar_width - bar_margin / 2);
			vertices.push(-1 + margin + (2 - 2 * margin)
					* (avgs[g][i] - min) / range);
			vertices.push(0.0);
			vertices.push(-1 + margin + g * group_margin + g * group_width + i
					* bar_width + bar_margin / 2);
			vertices.push(-1 + margin + (2 - 2 * margin)
					* (avgs[g][i] - min) / range);
			vertices.push(0.0);

			indices.push(0 + 4 * l);
			indices.push(1 + 4 * l);
			indices.push(2 + 4 * l);
			indices.push(0 + 4 * l);
			indices.push(2 + 4 * l);
			indices.push(3 + 4 * l);

			setColorForIndex(i % 4);

			l++;
		}
		axisLabelXs.push((textContext.width / 2) * (margin + (g + 0.5) * group_width + g * group_margin));		
	}
	initBuffers();
	drawScene();
}

function createSpeciesBarVertices(avgs) {

	vertices = [];
	indices = [];
	colors = [];
	axisLabelXs = [];

	var num_bars = avgs.length;
	num_vertices = num_bars * 4;
	num_indices = num_bars * 6;

	var min, max;
	var range;
	min = 0;
	max = Number(avgs[0]);
	// find min and max
	for (var i = 0; i < num_bars; i++) {
		if (Number(avgs[i]) < min)
			min = Number(avgs[i]);
		if (Number(avgs[i]) > max)
			max = Number(avgs[i]);
	}
	range = max - min;

	var h_margin = (2 - 2*margin) / (3 * num_bars - 1);
	for (var i = 0; i < num_bars; i++) {

		vertices.push(-1 + margin + (3 * i) * h_margin);
		vertices.push(-1 + margin);
		vertices.push(0.0);
		vertices.push(-1 + margin + (3 * i + 2) * h_margin);
		vertices.push(-1 + margin);
		vertices.push(0.0);
		vertices.push(-1 + margin + (3 * i + 2) * h_margin);
		vertices.push(-1 + margin + (2 - 2 * margin) * (avgs[i] - min)
				/ range);
		vertices.push(0.0);
		vertices.push(-1 + margin + (3 * i) * h_margin);
		vertices.push(-1 + margin + (2 - 2 * margin) * (avgs[i] - min)
				/ range);
		vertices.push(0.0);

		indices.push(0 + 4 * i);
		indices.push(1 + 4 * i);
		indices.push(2 + 4 * i);
		indices.push(0 + 4 * i);
		indices.push(2 + 4 * i);
		indices.push(3 + 4 * i);

		setColorForIndex(i % 4);
		
		axisLabelXs.push((textContext.width / 2) * (margin + (3 * i + 1) * h_margin));
	}

	initBuffers();

	drawScene();

}

// ////////////// Initialize VBO ////////////////////////

function initBuffers() {

	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	squareVertexPositionBuffer.itemSize = 3;
	squareVertexPositionBuffer.numItems = num_vertices;

	squareVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
			gl.STATIC_DRAW);
	squareVertexIndexBuffer.itemsize = 1;
	squareVertexIndexBuffer.numItems = num_indices;

	squareVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	squareVertexColorBuffer.itemSize = 4;
	squareVertexColorBuffer.numItems = num_vertices;
}

function drawTextAndAxes(title, labelTitles) {
    textContext.clearRect(0, 0, textContext.width, textContext.height);
	
	textContext.textAlign = "center";
	textContext.font = "32px sans-serif";
	textContext.textBaseline = "middle";
	textContext.fillText(title, textContext.width/2, textContext.height*(margin / 4));
	
	textContext.font = "16pt sans-serif";
	textContext.textBaseline = "hanging";
	
	for (var i = 0; i < labelTitles.length; i++) {
		textContext.fillText(labelTitles[i], axisLabelXs[i], textContext.height - textContext.height*(margin/2) + 5);
	}
	
	textContext.lineWidth = 3;
	
	textContext.beginPath();
	textContext.moveTo(margin/2 * textContext.width, margin/2 * textContext.height - 10);
	textContext.lineTo(margin/2 * textContext.width, textContext.height - (margin/2 * textContext.height));
	textContext.lineTo(textContext.width - (margin/2 * textContext.width) + 10, textContext.height - (margin/2 * textContext.height));
	textContext.stroke();
}

// ///////////////////////////////////////////////////////

function drawScene() {

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// draw elementary arrays - triangle indices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
	gl.drawElements(gl.TRIANGLES, num_indices, gl.UNSIGNED_SHORT, 0);
}

// ///////////////////////////////////////////////////////

function webGLStart() {
	var glCanvas = document.getElementById("gl-canvas");
	var textCanvas = document.getElementById("text-canvas");
	initGL(glCanvas);
	initText(textCanvas);
	initShaders();

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram,
			"aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram,
			"aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	gl.clearColor(1.0, 1.0, 1.0, 1.0);

}

function BG(red, green, blue) {

	gl.clearColor(red, green, blue, 1.0);
	drawScene();

}

function redraw() {
	drawScene();
}

function geometry(type) {

	draw_type = type;
	drawScene();

}
