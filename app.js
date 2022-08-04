
var vsText = 
[
'precision mediump float;',
'',
'attribute vec3 vPosition;',
'attribute vec2 vTexCoord;',
'varying vec2 fTexCoord;',
'uniform mat4 MV;',
'uniform mat4 V;',
'uniform mat4 P;',
'',
'void main()',
'{',
'  fTexCoord = vTexCoord;',
'  gl_Position = P * V * MV * vec4(vPosition, 1.0);',
'}'
].join('\n');

var fsText =
[
'precision mediump float;',
'',
'varying vec2 fTexCoord;',
'uniform sampler2D sampler;',
'',
'void main()',
'{',
'  gl_FragColor = texture2D(sampler, fTexCoord);',
'}'
].join('\n');




var Init = function () 
{
	var canvas = document.getElementById('WebGL Canvas');
	var gl = canvas.getContext('webgl');

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	var vShader = gl.createShader(gl.VERTEX_SHADER);
	var fShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vShader, vsText);
	gl.shaderSource(fShader, fsText);
	gl.compileShader(vShader);
	if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) 
	{
		console.error('ERROR compiling vertex shader', gl.getShaderInfoLog(vShader));
		return;
	}

	gl.compileShader(fShader);
	if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) 
	{
		console.error('ERROR compiling fragment shader', gl.getShaderInfoLog(fShader));
		return;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vShader);
	gl.attachShader(program, fShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR', gl.getProgramInfoLog(program));
		return;
	}

  var boxIndices =
	[
		// top
		0, 1, 2,
		0, 2, 3,

		// left
		5, 4, 6,
		6, 4, 7,

		// right
		8, 9, 10,
		8, 10, 11,

		// front
		13, 12, 14,
		15, 14, 12,

		// back
		16, 17, 18,
		16, 18, 19,

		// bottom
		21, 20, 22,
		22, 20, 23
	];

	var boxVertices = 
	[ 
		//top
		-1.0, 1.0, -1.0,   0, 0,
		-1.0, 1.0, 1.0,    0, 1,
		1.0, 1.0, 1.0,     1, 1,
		1.0, 1.0, -1.0,    1, 0,

		//left
		-1.0, 1.0, 1.0,    0, 0,
		-1.0, -1.0, 1.0,   1, 0,
		-1.0, -1.0, -1.0,  1, 1,
		-1.0, 1.0, -1.0,   0, 1,

		//right
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,   0, 1,
		1.0, -1.0, -1.0,  0, 0,
		1.0, 1.0, -1.0,   1, 0,

		//front
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,    1, 0,
		-1.0, -1.0, 1.0,    0, 0,
		-1.0, 1.0, 1.0,    0, 1,

		//back
		1.0, 1.0, -1.0,    0, 0,
		1.0, -1.0, -1.0,    0, 1,
		-1.0, -1.0, -1.0,    1, 1,
		-1.0, 1.0, -1.0,    1, 0,

		//bottom
		-1.0, -1.0, -1.0,   1, 1,
		-1.0, -1.0, 1.0,    1, 0,
		1.0, -1.0, 1.0,     0, 0,
		1.0, -1.0, -1.0,    0, 1,
	];

	
	var VertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

	var IndexBuffer= gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, 'vPosition');
	var texCoordAttribLocation = gl.getAttribLocation(program, 'vTexCoord');
	gl.vertexAttribPointer
	(
		positionAttribLocation, 
		3, 
		gl.FLOAT, 
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, 
		0 
	);
	gl.vertexAttribPointer
	(
		texCoordAttribLocation, 
		2, 
		gl.FLOAT, 
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, 
		3 * Float32Array.BYTES_PER_ELEMENT 
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(texCoordAttribLocation);

	
	var boxTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		document.getElementById('earth-image')
	);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'MV');
	var matViewUniformLocation = gl.getUniformLocation(program, 'V');
	var matProjUniformLocation = gl.getUniformLocation(program, 'P');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function () {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [1, 1, 1]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 1, 1]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		gl.bindTexture(gl.TEXTURE_2D, boxTexture);
		gl.activeTexture(gl.TEXTURE0);

		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};