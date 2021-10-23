"use strict";

var canvas;
var gl;
 
var  vTranslation = vec3(0,0,1); 
var vScale = vec3(1, 1, 1);
var vColor;

var color =vec3(0,0,0);
var theta=0; // theta represents for rotation angle
var bufferTri, bufferRectangle1, bufferRectangle2, bufferRectangle3, triVertices, rectVertices1, rectVertices2, rectVertices3;
var vPosition;
var transformationMatrix, transformationMatrixLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Make the letters
    triVertices = [
        vec2(  -0.25,  -0.6 ),
        vec2(  0.15,  -0.6),		//Vertices for triangle
        vec2(  -0.05, 0.1 )
    ];

    rectVertices1 = [
        vec2(  -0.1,  0.0 ),
        vec2(  0.0,  -0.1 ),		//Vertices for first rectangle
		vec2(  0.2,  0.3 ),
        vec2(  0.3,  0.2 )
        
    ];
	
	rectVertices2 = [
		vec2(  0.0,  0.0 ),
        vec2(  -0.1,  -0.1 ),		//Vertices for second rectangle
        vec2(  -0.3,  0.3 ),
        vec2(  -0.4,  0.2 )
	];
	
	rectVertices3 = [
		vec2(  0.025,  -0.45 ),   
        vec2(  -0.125, -0.45 ),		//Verticesfor third rectangle
        vec2(  0.025,  -0.05 ),
        vec2(  -0.125,  -0.05 )
	];


    // Load the data into the GPU
    bufferTri = gl.createBuffer();	//Load triangle
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferTri ); 
    gl.bufferData( gl.ARRAY_BUFFER, flatten(triVertices), gl.STATIC_DRAW );

    // Load the data into the GPU
    bufferRectangle1 = gl.createBuffer(); // Load first rectangle
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferRectangle1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rectVertices1), gl.STATIC_DRAW );
	
	
	bufferRectangle2 = gl.createBuffer();  //Load second rectangle
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRectangle2 );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(rectVertices2), gl.STATIC_DRAW );
	
	bufferRectangle3 = gl.createBuffer(); //Load third rectangle
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRectangle3 );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(rectVertices3), gl.STATIC_DRAW );
	
    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    transformationMatrixLoc = gl.getUniformLocation( program, "transformationMatrix" );
	vColor = gl.getUniformLocation( program, "colorVector" );

    document.getElementById("inp_objX").oninput = function(event) {
        //TODO: fill here to adjust translation according to slider value
		 vTranslation[0]=event.target.value;
    };
    document.getElementById("inp_objY").oninput = function(event) {
        //TODO: fill here to adjust translation according to slider value
		 vTranslation[1]=event.target.value;
    };
    document.getElementById("inp_obj_scale").oninput = function(event) {
        //TODO: fill here to adjust scale according to slider value
		vScale[0] = event.target.value;
        vScale[1] = event.target.value;
    };
    document.getElementById("inp_obj_rotation").oninput = function(event) {
        //TODO: fill here to adjust rotation according to slider value
		theta=event.target.value;
		
    };
    document.getElementById("inp_wing_speed").oninput = function(event) {
        //TODO: fill here to adjust wing scale according to slider value
		speed =  event.target.value;
    };
    document.getElementById("redSlider").oninput = function(event) {
        //TODO: fill here to adjust color according to slider value
		color[0]= event.target.value;
    };
    document.getElementById("greenSlider").oninput = function(event) {
        //TODO: fill here to adjust color according to slider value
		color[1]= event.target.value;
    };
    document.getElementById("blueSlider").oninput = function(event) {
        //TODO: fill here to adjust color according to slider value
		color[2]= event.target.value;
    };

    render();

};

function setGeometry(gl) {
	
	
}

var rotationAmount=0;
var speed=1;

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    transformationMatrix = mat4();
	
	
	transformationMatrix = mult(transformationMatrix, translate(vTranslation[0], vTranslation[1], vTranslation[2]));
	transformationMatrix = mult(transformationMatrix, translate(-0.05, -0.025, 0.0));			//inverse of the translation matrix which I applied to move shape to orijin.
	transformationMatrix = mult(transformationMatrix, scalem(vScale[0], vScale[1], vScale[2]));
	transformationMatrix = mult(transformationMatrix, rotateZ(theta));		                  // The middle point of tiangle is P(-0.05,-0.25).
	transformationMatrix = mult(transformationMatrix, translate(0.05, 0.025, 0.0)); 		 // I aligned shape with axes by moving P to orijin, thus
																						    // I can scale my shape with respect to x and y axes. 
																						   // Then I applied inverse translation.
		

    gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );	
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferTri );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(vColor,color[0],color[1],color[2],1.0); // user only chooses triangle's color, fan's colors are predefined. 
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 3 );
	
	rotationAmount=rotationAmount+speed*2; //when rotationAmount is less than 0, rotation changes direction according to this formula and initial values of rotationAmount and speed.
	
	//------------------------------------------------------------------------------------------------------------------------------------/
	// the intersection of 3 rectangles(fans) is P(-0.05,-0.05). In order to make fan rotation with respect to that point, I moved       /
	// that point to orijin.																					           				/	
	//---------------------------------------------------------------------------------------------------------------------------------/
	
	transformationMatrix = mult(transformationMatrix, translate(-0.05, -0.05, 0.0)); // I applied inverse of the translation matrix which I applied to move point "P(-0.05,-0.05)" to orijin
	transformationMatrix = mult(transformationMatrix, rotateZ(rotationAmount));
	transformationMatrix = mult(transformationMatrix, translate(0.05, 0.05, 0.0));
	
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferRectangle1 );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	
	gl.uniform4f(vColor,0.0,1.0,0.0,1.0); //GREEN COLOR CODE 	//It is predifed by programmer
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	gl.bindBuffer( gl.ARRAY_BUFFER,bufferRectangle2 );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(vColor,0.0,0.0,1.0,1.0); //BLUE COLOR CODE  	//It is predifed by programmer
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRectangle3 );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(vColor,1.0,0.0,0.0,1.0); // RED COLOR CODE 	//It is predifed by programmer
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
    window.requestAnimFrame(render);
}
