var gl;
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
		alert("Could not initialise WebGL, sorry :-(");
	}
}

// /////////////////////////////////////////////////////////

var squareVertexPositionBuffer;
var squareVertexColorBuffer;
var squareVertexIndexBuffer;

var vertices = [];
var indices = [];
var colors = [];
var num_vertices;
var num_indices;
var num_groups;
var bars_per_group;

function createAllBarVertices(avgs) {

	vertices = [];
	indices = [];
	colors = [];

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

	var v_margin = 0.25;
	var group_margin = 2 / (num_bars + 1);
	var group_width = (2 - ((num_groups + 1) * group_margin)) / num_groups;
	var bar_width = group_width / bars_per_group;
	var l = 0;
	for (var g = 0; g < num_groups; g++) {
		for (var i = 0; i < bars_per_group; i++) {

			vertices.push(-1 + g * group_width + (g + 1) * group_margin + i
					* bar_width);
			vertices.push(-1 + v_margin);
			vertices.push(0.0);
			vertices.push(-1 + g * group_width + (g + 1) * group_margin
					+ (i + 1) * bar_width);
			vertices.push(-1 + v_margin);
			vertices.push(0.0);
			vertices.push(-1 + g * group_width + (g + 1) * group_margin
					+ (i + 1) * bar_width);
			vertices.push(-1 + v_margin + (2 - 2 * v_margin)
					* (avgs[g][i] - min) / range);
			vertices.push(0.0);
			vertices.push(-1 + g * group_width + (g + 1) * group_margin + i
					* bar_width);
			vertices.push(-1 + v_margin + (2 - 2 * v_margin)
					* (avgs[g][i] - min) / range);
			vertices.push(0.0);

			indices.push(0 + 4 * l);
			indices.push(1 + 4 * l);
			indices.push(2 + 4 * l);
			indices.push(0 + 4 * l);
			indices.push(2 + 4 * l);
			indices.push(3 + 4 * l);

			colors.push(1.0, 0.0, 0.0, 1.0);
			colors.push(0.0, 1.0, 0.0, 1.0);
			colors.push(0.0, 0.0, 1.0, 1.0);
			colors.push(1.0, 0.0, 0.0, 1.0);

			l++;
		}
	}
	initBuffers();
	drawScene();
}

function createSpeciesBarVertices(avgs) {

	vertices = [];
	indices = [];
	colors = [];

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

	var v_margin = 0.25;
	var h_margin = 2 / (3 * num_bars + 1);
	for (var i = 0; i < num_bars; i++) {

		vertices.push(-1 + (3 * i + 1) * h_margin);
		vertices.push(-1 + v_margin);
		vertices.push(0.0);
		vertices.push(-1 + (3 * i + 3) * h_margin);
		vertices.push(-1 + v_margin);
		vertices.push(0.0);
		vertices.push(-1 + (3 * i + 3) * h_margin);
		vertices.push(-1 + v_margin + (2 - 2 * v_margin) * (avgs[i] - min)
				/ range);
		vertices.push(0.0);
		vertices.push(-1 + (3 * i + 1) * h_margin);
		vertices.push(-1 + v_margin + (2 - 2 * v_margin) * (avgs[i] - min)
				/ range);
		vertices.push(0.0);

		indices.push(0 + 4 * i);
		indices.push(1 + 4 * i);
		indices.push(2 + 4 * i);
		indices.push(0 + 4 * i);
		indices.push(2 + 4 * i);
		indices.push(3 + 4 * i);

		colors.push(1.0, 0.0, 0.0, 1.0);
		colors.push(0.0, 1.0, 0.0, 1.0);
		colors.push(0.0, 0.0, 1.0, 1.0);
		colors.push(1.0, 0.0, 0.0, 1.0);
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
	var canvas = document.getElementById("gl-canvas");
	initGL(canvas);
	initShaders();

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram,
			"aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

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
