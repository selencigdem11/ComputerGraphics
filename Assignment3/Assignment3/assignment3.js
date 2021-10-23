"use strict";

var canvas;
var gl;

var modelViewMatrixLoc, projectionMatrixLoc;
var bufferPlane, planeVertices,bufferCone,bufferFan,fanVertices;
var translate,rotate,scale,color;
var vPosition;
var transformationMatrixLoc,modelViewMatrixLoc, projectionMatrixLoc;
var translation, scaling, rotation;
var color, colorLoc, speed;
var eye = vec3(0.0,1.0,3.0);
var at = vec3(0.0,0.0,0.0);
var fovy = 45.0;
var aspect = 1.0;
var near = 1.0;
var far = 20.0;
var up = vec3(0.0,1.0,0.0);
var count = 36;

var mvMatrix ;
var tMatrix ; 
var pMatrix ;
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    gl.viewport( 0, 0, canvas.width, canvas.height );


    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);  
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	translation = [0,0,0];
    scaling = [1,1,1];
    rotation = [0,0,0];
    color = [0,0,0,1];	//BLACK

	
	var vertices = [vec3(0,0,0)];

    for (var i = 0; i < count+2; i++) {
        var angle = i*(360/count)*(Math.PI/180);
        vertices.push(vec3(0.20*Math.sin(angle),-0.9,0.20*Math.cos(angle)));
    };
    vertices.push(vec3(vertices[1]));

	bufferCone = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferCone );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
	

	 
	fanVertices = [
        vec3(  0.0,  0.0,-0.05 ),
        vec3(  0.3, 0.0 ,-0.05),
        vec3(  0.0,  0.0,0.05 ),
        vec3(  0.3,  0.0,0.05)
    ];

    planeVertices = [
        vec3(  -1.0, -1.0,-1.0 ),
        vec3(  1.0,  -1.0,-1.0 ),
        vec3(  -1.0, -1.0,  1.0 ),
        vec3(  1.0, -1.0, 1.0 )
    ];
	
	

	bufferFan = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferFan );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(fanVertices), gl.STATIC_DRAW );
	
    // Load the data into the GPU
    bufferPlane = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlane );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(planeVertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    transformationMatrixLoc = gl.getUniformLocation( program, "transformationMatrix" );
	modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    colorLoc = gl.getUniformLocation( program, "color" );
	
	document.getElementById("fovy").oninput = function(event) {
        fovy = event.target.value;
    };

	document.getElementById("camera_posX").oninput = function(event) {
		eye[0] = event.target.value;
    };
	document.getElementById("camera_posY").oninput = function(event) {
        eye[1] = event.target.value;
    };
    document.getElementById("camera_posZ").oninput = function(event) {
        eye[2] = event.target.value;
    };


	
	document.getElementById("camera_tarX").oninput = function(event) {
        at[0] = event.target.value;
    };
	document.getElementById("camera_tarY").oninput = function(event) {
        at[1] = event.target.value;
    };
    document.getElementById("camera_tarZ").oninput = function(event) {
        at[2] = event.target.value;
    };



   
    document.getElementById("inp_objX").oninput = function(event) {
        translation[0] = event.target.value;
    };
    document.getElementById("inp_objY").oninput = function(event) {
        translation[1] = event.target.value;
    };
	 document.getElementById("inp_objZ").oninput = function(event) {
        translation[2] = event.target.value;
    };
	
	
	
	
    document.getElementById("inp_obj_scale").oninput = function(event) {
        scaling[0] = event.target.value;
        scaling[1] = event.target.value;
		scaling[2] = event.target.value;
    };
	
	
	
    document.getElementById("inp_rotationX").oninput = function(event) {
        rotation[0] = event.target.value;
    };
	document.getElementById("inp_rotationY").oninput = function(event) {
        rotation[1] = event.target.value;
    };
	document.getElementById("inp_rotationZ").oninput = function(event) {
        rotation[2] = event.target.value;
    };
	
	
	
	
    document.getElementById("redSlider").oninput = function(event) {
        color[0] = event.target.value;
    };
    document.getElementById("greenSlider").oninput = function(event) {
        color[1] = event.target.value;
    };
    document.getElementById("blueSlider").oninput = function(event) {
        color[2] = event.target.value;
    };


    render();

};

var theta = 0;

function render() {

	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
    mvMatrix = lookAt(eye, at , up);
	
	
    pMatrix = perspective(fovy, aspect, near, far);

	tMatrix=mat4();
	
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(pMatrix) );
    gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix));
    gl.uniform4fv( colorLoc, [0.60,0.40,0.11,0.6] ); //BROWN PLANE
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlane );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	

	tMatrix = mult(tMatrix, translate(0.0,-0.1,0.0));// translate to move cone to plane.
	tMatrix = mult(tMatrix, translate(0.0,-0.9,0.0));// After scaling my object with respect to axes, I applied inverse transformation and moved it back.
	tMatrix = mult(tMatrix, translate(translation[0],translation[1],translation[2]));
	tMatrix = mult(tMatrix, rotate(rotation[2],vec3(0,0,1) ));
	tMatrix = mult(tMatrix, rotate(rotation[1], vec3(0,1,0) ));
	tMatrix = mult(tMatrix, rotate(rotation[0], vec3(1,0,0) ));
	tMatrix = mult(tMatrix, scalem(scaling[0],scaling[1],scaling[2]));
	tMatrix = mult(tMatrix, translate(0.0,0.9,0.0));// translate cone to origin so that I can scale my shape with respect to x and y axes. 
	gl.uniform4fv( colorLoc,color );
    gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix));
   
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferCone );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, count+2 );
	
	

	
	tMatrix = mult(tMatrix, translate(-0.035,-0.15,0.25)); // little cone connects fans and locates below the top vertice of cone. I set translate coordinates to place it proper position.
	tMatrix = mult(tMatrix, rotateX(90));				
	tMatrix = mult(tMatrix, scalem(0.3,0.3,0.3)); //Since the shape is bigger than desired, I shrunk cone
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix));
	gl.uniform4fv( colorLoc, color );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferCone );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 14 );


	
	theta+=0.3; // ıt is an angle provides fans to rotate
	
	
	tMatrix = mult(tMatrix, rotateY(theta));
	tMatrix = mult(tMatrix, scalem(4,4,4)); // I scaled shape to get the size that I need
	tMatrix = mult(tMatrix, rotateY(120));
	gl.uniform4fv( colorLoc, [1.0,0.0,0.0,1.0] ); //RED
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix));
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferFan );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	
	gl.uniform4fv( colorLoc, [0.0,0.0,1.0,1.0] ); //BLUE
	tMatrix = mult(tMatrix, rotateY(120));
	tMatrix = mult(tMatrix, rotateZ(1));	//I added tiny rotation to prevent fans from overlapping
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix));
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

	
	gl.uniform4fv( colorLoc, [0.0,1.0,0.0,1.0] ); //GREEN
	tMatrix = mult(tMatrix, rotateZ(1)); 	//I added tiny rotation to prevent fans from overlapping
	tMatrix = mult(tMatrix, rotateY(120));
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix));
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );





    

    window.requestAnimFrame(render);
}
