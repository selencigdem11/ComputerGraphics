"use strict";

var canvas;
var gl;

var modelViewMatrixLoc, projectionMatrixLoc,viewMatrixLoc;
var bufferPlane, planeVertices,bufferCone,bufferFan,fanVertices,fanNormals;
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
var mvMatrix ;
var tMatrix ; 
var pMatrix ;


var conePoints,bufferConeNormals,coneNormals,vNormal;
var normalMatrix, normalMatrixLoc;

var lightPosition = vec4(3.0, 6.0, 9.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );;

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 1.0, 1.0 );

var materialShininess = 0.5;

var ambientProduct;
var diffuseProduct;
var specularProduct;

var ambientLoc, diffuseLoc, specularLoc, shininessLoc;

var triNum = 20;

var planeNormals,bufferPlaneNormals,bufferFanNormals;

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
    color = [1,0,0,1];	//RED
	conePoints = [];
    coneNormals = [];
	 
	 
   fanVertices = [
        vec4(-0.15,	 0.0,	0.3,	1.0), 	//equation for plane:			
        vec4( 0.15,	 0.0,	0.3,	1.0),  //0x+ 0y + 0.36z-0.108=0	
        vec4(-0.15,	 1.2,	0.3,	1.0),
        vec4( 0.15,	 1.2,	0.3,	1.0)
    ];
	
	fanNormals = [
        vec4( 0.0,	 0.0,	1.0,	0.0),
        vec4( 0.0,	 0.0,	1.0,	0.0),
        vec4( 0.0,	 0.0,	1.0,	0.0),
        vec4( 0.0,	 0.0,	1.0,	0.0)
    ];		
    planeVertices = [
		vec4(-1.0,	-1.0,	-1.0,	1.0),	//equation for plane:
		vec4( 1.0,	-1.0,	-1.0,	1.0),  //0x-4y+0z-4=0	
		vec4(-1.0,	-1.0,	 1.0,	1.0),
		vec4( 1.0,	-1.0,	 1.0,	1.0)
    ];
	
	planeNormals = [
        vec4(  0.0,  1.0, 0.0, 0.0 ),
        vec4(  0.0,  1.0, 0.0, 0.0 ),
        vec4(  0.0,  1.0, 0.0, 0.0 ),
        vec4(  0.0,  1.0, 0.0, 0.0 )
    ];
	
	//2 vertices and 2 normals at each iteration
    for (var i = 0; i <=triNum; i++) {//triNum for slices
        var angle = 2*i*Math.PI/triNum;
        conePoints.push(vec4( 0,1.15,0,1 ));//0.6 
        coneNormals.push(normalize(vec4( 0.35*Math.sin(angle),1.15, 0.35*Math.cos(angle),0)));//*radius
        conePoints.push(vec4(0.35* Math.sin(angle),0,0.3*Math.cos(angle),1 ) );
        coneNormals.push(normalize(vec4( 0.35*Math.sin(angle),1.15, 0.35*Math.cos(angle),0)));
    };
	console.log(conePoints);
	console.log(coneNormals);
	
	//FAN
	bufferFan = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferFan );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(fanVertices), gl.STATIC_DRAW );
	//FAN NORMAL
	bufferFanNormals = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferFanNormals );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(fanNormals), gl.STATIC_DRAW );
	
    // PLANE
    bufferPlane = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlane );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(planeVertices), gl.STATIC_DRAW );
	//PLANE NORMAL
	bufferPlaneNormals = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlaneNormals);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(planeNormals), gl.STATIC_DRAW );
	
	//CONE
	bufferCone = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferCone);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(conePoints), gl.STATIC_DRAW );
	
	// CONE NORMAL
    bufferConeNormals = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferConeNormals);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(coneNormals), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
	
	
	ambientProduct = mult(lightAmbient, materialAmbient); 
	diffuseProduct = mult(lightDiffuse, materialDiffuse); 
	specularProduct = mult(lightSpecular, materialSpecular);
	
	
	viewMatrixLoc = gl.getUniformLocation( program, "viewMatrix" );
    transformationMatrixLoc = gl.getUniformLocation( program, "transformationMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	colorLoc = gl.getUniformLocation(program,"vColor");///fColor
    gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(lightPosition) );
	ambientLoc= gl.getUniformLocation(program, "ambientProduct");
	diffuseLoc= gl.getUniformLocation(program, "diffuseProduct");
	specularLoc= gl.getUniformLocation(program, "specularProduct");
	shininessLoc= gl.getUniformLocation(program, "shininess");
	
	
	
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
	
	
	document.getElementById("lightPosXSlider").oninput = function(event) {
        lightPosition[0] = event.target.value;
        gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(lightPosition) );
    };
    document.getElementById("lightPosYSlider").oninput = function(event) {
        lightPosition[1] = event.target.value;
        gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(lightPosition) );
    };
    document.getElementById("lightPosZSlider").oninput = function(event) {
        lightPosition[2] = event.target.value;
        gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(lightPosition) );
    };



	
	document.getElementById("diffuse_X").oninput = function(event) {
        materialDiffuse[0] = event.target.value;

	};
	
	document.getElementById("diffuse_Y").oninput = function(event) {
        materialDiffuse[1] = event.target.value;

    };
	
	document.getElementById("diffuse_Z").oninput = function(event) {
        materialDiffuse[2] = event.target.value;

    };
	
	document.getElementById("ambient_X").oninput = function(event) {
        materialAmbient[0] = event.target.value;

	};
	
	document.getElementById("ambient_Y").oninput = function(event) {
        materialAmbient[1] = event.target.value;

    };
	
	document.getElementById("ambient_Z").oninput = function(event) {
        materialAmbient[2] = event.target.value;

    };
	
	
	
	document.getElementById("specular_X").oninput = function(event) {
		materialSpecular[0] = event.target.value;
		
	};
	
	document.getElementById("specular_Y").oninput = function(event) {
        materialSpecular[1] = event.target.value;

    };
	
	document.getElementById("specular_Z").oninput = function(event) {
        materialSpecular[2] = event.target.value;

    };

	document.getElementById("shiness").oninput = function(event) {
        materialShininess = event.target.value;

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


	specularProduct = mult(lightSpecular, materialSpecular);
	gl.uniform4fv(specularLoc,flatten(specularProduct));
	
	ambientProduct = mult(lightAmbient, materialAmbient);
	gl.uniform4fv( ambientLoc,flatten(ambientProduct) );
	
	diffuseProduct = mult(lightDiffuse, materialDiffuse);
    gl.uniform4fv( diffuseLoc,flatten(diffuseProduct) );

    gl.uniform1f( shininessLoc,materialShininess );
	

	//PLANE
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix) );
	gl.uniformMatrix4fv( viewMatrixLoc, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(pMatrix) );
    gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix));
	gl.uniform4fv( colorLoc, [0.60,0.40,0.11,0.6] ); //BROWN PLANE
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlane );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlaneNormals );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	

	//CONE
	tMatrix = mult(tMatrix, translate(0.0,-0.6,0.0));
	tMatrix = mult(tMatrix, translate(0.0,-0.4,0.0));
	tMatrix = mult(tMatrix, translate(translation[0],translation[1],translation[2]));
	tMatrix = mult(tMatrix, rotate(rotation[2],vec3(0,0,1) ));
	tMatrix = mult(tMatrix, rotate(rotation[1], vec3(0,1,0) ));
	tMatrix = mult(tMatrix, rotate(rotation[0], vec3(1,0,0) ));
	tMatrix = mult(tMatrix, scalem(scaling[0],scaling[1],scaling[2]));
	tMatrix = mult(tMatrix, scalem(0.6,0.6,0.6));
	gl.uniform4fv( colorLoc,color );
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferCone );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferConeNormals );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, triNum*2+2 );

	
	//LITTLE CONE
	tMatrix = mult(tMatrix, translate(0.0,0.95,0.02)); 				
	tMatrix = mult(tMatrix, rotateX(90));
	tMatrix = mult(tMatrix, scalem(0.2,0.2,0.2)); 
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix));
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, triNum*2+2  );
	
	theta+=0.3; //provides fan to rotate

	//RED FAN
	tMatrix = mult(tMatrix, translate(0.0,0.3,-0.1));
	tMatrix = mult(tMatrix, scalem(2,2,2));
	tMatrix = mult(tMatrix, rotateX(-90));
	tMatrix = mult(tMatrix, rotateZ(theta));
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix));
	gl.uniform4fv( colorLoc, [1.0,0.0,0.0,1.0] ); //RED
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferFan );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferFanNormals );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	
	//BLUE FAN
	tMatrix = mult(tMatrix, rotateZ(-120));
	tMatrix = mult(tMatrix, rotateY(1)); 	//I added tiny rotation to prevent fans from overlapping
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix));
	gl.uniform4fv( colorLoc, [0.0,0.0,1.0,1.0] ); //BLUE
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );



	//GREEN FAN
	tMatrix = mult(tMatrix, rotateZ(-120));
	tMatrix = mult(tMatrix, rotateY(1)); 	//I added tiny rotation to prevent fans from overlapping
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(tMatrix));
	gl.uniform4fv( colorLoc, [0.0,1.0,0.0,1.0] ); //GREEN
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

   

    window.requestAnimFrame(render);
}
