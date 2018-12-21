// MainSnowmanSnowballFightScene.js - Renders a scene containing a simulated
//                                    snowball fight between multiple
//                                    snowmen
//
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -WebGlUtility.js
//  -TessellatedGeometryGenerators.js
//  -RgbColor.js
//  -MathExtMatrix.js
//  -MathUtility.js
//  -TextScroller.js

/**
 *  Class that provides a means of storing data
 *   pertaining to a single snowman instance
 */
function SnowmanInstanceData () {		
	this.snowmanState = null;
	
	// Absolute time at which the current state was initiated (milliseconds)
	this.currentStateInitiationTimeMs = 0.0;
	
	// Absolute time at which the last snowball throw
	// was initiated (milliseconds)
	this.lastSnowballThrowTime = 0.0;
	this.currentTargetSnowman = null;
	
	// Will be set to true after the snowball is thrown
	// during the throwing state (the throw does not
	// occur immediately)
	this.snowballThrownDuringThrowState = false;
	
	// Immediate snowman position in three-dimensional
	// space
	this.snowmanPosition = new Point3d(0.0, 0.0, 0.0);
	
	// Normalized direction vector
	this.snowmanDirectionNormalVector = new Vector3d(0.0, 0.0, 0.0);
	// Pre-determine snowman movement magnitude
	this.snowmanMovementMagnitude = 0.0;
	
	// Minimum interval between snowball throws (milliseconds)
	this.snowmanMinSnowballThrowIntervalMs = 0.0
	
	// Mean expected snowball throwing velocity
	this.snowmanMeanSnowballThrowVelocity = 0.0;
	
	// Target acquisition field-of-view (radians)
	this.snowmanTargetAcquisitionFovDegRad = 0.0;
	
	// Number of times that a snowball associated
	// with this snowman instance struck another
	// snowman
	this.snowmanTargetStrikeCount = 0;
	// Number of times this snowman instance
	// was struck by a snowball associated with
	// another snowman
	this.snowmanStrikeReceptionCount = 0;
	
	// Snow man body section geometry vertex
	// count
	this.snowmanVertexCount = 0;
	// Transformation to be applied to the snowman
	// geometry during rendering
	this.snowmanTransformationMatrixRep = null; 
	
	// Snowman body vertex/color/texture/normal
	// vector buffers to be used by WebGL
	this.snowmanWebGlVertexBuffer = null;
	this.snowmanWebGlColorBuffer = null;
	this.snowmanWebGlTexCoordBuffer = null;
	this.snowmanWebGlNormalBuffer = null;

	// Snowman right arm vertex/color/texture/normal
	// vector buffers to be used by WebGL
	this.snowmanWebGlRightArmVertexBuffer = null;
	this.snowmanWebGlRightArmColorBuffer = null;
	this.snowmanWebGlRightArmNormalBuffer = null;
	this.snowmanWebGlRightArmBaseTransformationMatrix = null;
	this.snowmanRightArmVertexCount = 0;

	// Snowman left arm vertex/color/texture/normal
	// vector buffers to be used by WebGL
	this.snowmanWebGlLeftArmVertexBuffer = null;
	this.snowmanWebGlLeftArmColorBuffer = null;
	this.snowmanWebGlLeftArmNormalBuffer = null;
	this.snowmanWebGlLeftArmBaseTransformationMatrix = null;
	this.snowmanLeftArmVertexCount = 0;

	// Snowman nose vertex/color/texture/normal
	// vector buffers to be used by WebGL	
	this.snowmanWebGlNoseVertexBuffer = null;
	this.snowmanWebGlNoseColorBuffer = null;
	this.snowmanWebGlNoseNormalBuffer = null;
	this.snowmanWebGlNoseBaseTransformationMatrix = null;
	this.snowmanNoseVertexCount = 0;

	// Snowman hat vertex/color/texture/normal
	// vector buffers to be used by WebGL
	this.snowmanWebGlHatVertexBuffer = null;
	this.snowmanWebGlHatColorBuffer = null;
	this.snowmanWebGlHatNormalBuffer = null;
	this.snowmanHatVertexCount = 0;

	// Snowman face button vertex/color/texture/normal
	// vector buffers to be used by WebGL	
	this.snowmanWebGlFaceButtonVertexBuffer = null;
	this.snowmanWebGlFaceButtonColorBuffer = null;
	this.snowmanWebGlFaceButtonNormalBuffer = null;
	this.snowmanFaceButtonVertexCount = 0;
}

/**
 *  Class that provides a means of storing data
 *   pertaining to a single snowball instance
 */
function SnowballInstanceData () {	
	// Velocity vector - not normalized
	this.snowballVelocityVector = new Vector3d(0.0, 0.0, 0.0);
	// Immediate position of the snowball in
	// three-dimensional space
	this.snowballPosition = new Point3d(0.0, 0.0, 0.0);
	
	// Snowman with which the snowball is associated
	this.sourceSnowmanInstance = null;
	// If the snowball has collided with a snowman
	// (that is not the originating snowman), this
	// flag will be set to otrue
	this.invalidatedByCollision = false;
	
	// Number of vertices used in the snowball
	// representation
	this.snowballVertexCount = 0;
	// Transformation to be applied to the snowball
	// geometry during rendering	
	this.snowballTransformationMatrixRep = null; 
	
	// Snowball vertex/color/normal
	// vector buffers to be used by WebGL	
	this.snowballWebGlVertexBuffer = null;
	this.snowballWebGlColorBuffer = null;
	this.snowballWebGlNormalBuffer = null;
}

/**
 *  Class that provides a means of storing data
 *   pertaining to the ground plane
 */
function SceneGroundPlaneData() {
	// Ground plane dimensions
	this.constSceneGroundPlaneWidth = 2.0;
	this.constSceneGroundPlaneLength = 2.0;
	
	// Ground plane color
	this.constSceneGroundPlaneColorRedComp = 0.4;
	this.constSceneGroundPlaneColorGreenComp = 0.4;	
	this.constSceneGroundPlaneColorBlueComp = 0.7;
	
	// Ground plane geometry (used during WebGL vertex
	// data generation)
	this.sceneGroundPlaneVertexList = new Float32Array([
		-this.constSceneGroundPlaneWidth / 2.0, 0.0, -this.constSceneGroundPlaneLength / 2.0,
		-this.constSceneGroundPlaneWidth / 2.0, 0.0, this.constSceneGroundPlaneLength / 2.0,
		this.constSceneGroundPlaneWidth / 2.0, 	0.0, this.constSceneGroundPlaneLength / 2.0,

		this.constSceneGroundPlaneWidth / 2.0, 	0.0, this.constSceneGroundPlaneLength / 2.0,
		this.constSceneGroundPlaneWidth / 2.0, 	0.0, -this.constSceneGroundPlaneLength / 2.0,
		-this.constSceneGroundPlaneWidth / 2.0, 0.0, -this.constSceneGroundPlaneLength / 2.0,
	]);

	// Ground plane color (used during WebGL vertex
	// data generation)
	this.sceneGroundPlaneVertexColors = new Float32Array([
		this.constSceneGroundPlaneColorRedComp, this.constSceneGroundPlaneColorGreenComp, this.constSceneGroundPlaneColorBlueComp, 1.0,
		this.constSceneGroundPlaneColorRedComp, this.constSceneGroundPlaneColorGreenComp, this.constSceneGroundPlaneColorBlueComp, 1.0,
		this.constSceneGroundPlaneColorRedComp, this.constSceneGroundPlaneColorGreenComp, this.constSceneGroundPlaneColorBlueComp, 1.0,

		this.constSceneGroundPlaneColorRedComp, this.constSceneGroundPlaneColorGreenComp, this.constSceneGroundPlaneColorBlueComp, 1.0,
		this.constSceneGroundPlaneColorRedComp, this.constSceneGroundPlaneColorGreenComp, this.constSceneGroundPlaneColorBlueComp, 1.0,
		this.constSceneGroundPlaneColorRedComp, this.constSceneGroundPlaneColorGreenComp, this.constSceneGroundPlaneColorBlueComp, 1.0,
	]);
		
	// Ground vertex normals(used during WebGL vertex
	// data generation)
	this.sceneGroundPlaneVertexNormals = new Float32Array([
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,

		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,		
	]);
	
	// Ground plane vertex/color/normal
	// vector buffers to be used by WebGL	
	this.sceneGroundPlaneWebGlVertexBuffer = null;
	this.sceneGroundPlaneWebGlColorBuffer = null;
	this.sceneGroundPlaneWebGlNormalBuffer = null;
}

/**
 *  Class that provides a means of storing
 *   data pertaining to an ambient light
 *   source
 */
function SceneAmbientLight() {
	// Vector indicating the direction of the
	// ambient light source
	this.constAmbientLightVector = new Float32Array([
		-0.4, -0.3, -0.4
	]);
}

/**
 *  Class that provides a means of storing data
 *   pertaining to the message scroller overlay
 *   geometry
 */
function SceneScrollerGeometry() {
	this.constScrollerOverlayTopY = -0.80;
	this.constScrollerOverlayHeight = 0.10;
	
	// Scroller overlay geometry (used during WebGL vertex
	// data generation)	
	this.scrollerOverlayVertices = new Float32Array([
		// Upper-left (triangle #1)
		-1.0, 	this.constScrollerOverlayTopY, 										-1.0,
		// Lower-left (triangle #1)
		-1.0, 	this.constScrollerOverlayTopY - this.constScrollerOverlayHeight,	-1.0,
		// Lower-right (triangle #1)
		1.0, 	this.constScrollerOverlayTopY - this.constScrollerOverlayHeight,	-1.0,
		
		// Lower-right (triangle #2)
		1.0, 	this.constScrollerOverlayTopY - this.constScrollerOverlayHeight,	-1.0,
		// Upper-right (triangle #2)		
		1.0, 	this.constScrollerOverlayTopY, 										-1.0,
		// Upper-left (triangle #2)
		-1.0, 	this.constScrollerOverlayTopY, 										-1.0,
	]);

	// Scroller overlay texture coordinates (used during WebGL vertex
	// data generation)	
	this.scrollerTextureCoords = new Float32Array([
		// Upper-left (triangle #1)
		0.0, 0.0,
		// Lower-left (triangle #1)
		0.0, 1.0,
		// Lower-right (triangle #1)		
		1.0, 1.0,
		
		// Lower-right (triangle #2)	
		1.0, 1.0,
		// Upper-right (triangle #2)
		1.0, 0.0,
		// Upper-left (triangle #2)
		0.0, 0.0
	]);
	
	// Ground plane vertex/texture coordinate
	// buffers to be used by WebGL		
	this.sceneScrollerWebGlVertexBuffer = null;
	this.sceneScrollerWebGlTexCoordBuffer = null;
	
	this.sceneScrollerWebGlVertexCount = 0;
}

/**
 *  Class that provides a means of storing data
 *   pertaining to the scene backdrop
 *   geometry
 */
function SceneBackdropGeometry() {
	this.backdropVertices = new Float32Array([
		// Upper-left (triangle #1)	
		-1.0,	1.0,	1.0,
		// Lower-left (triangle #1)		
		-1.0,	-1.0,	1.0,
		// Lower-right (triangle #1)
		1.0,	-1.0,	1.0,

		// Lower-right (triangle #2)		
		1.0,	-1.0,	1.0,		
		// Upper-right (triangle #2)
		1.0,	1.0,	1.0,
		// Upper-left (triangle #2)		
		-1.0,	1.0,	1.0
	]);
	
	this.backdropTextureCoords = new Float32Array([
		// Upper-left (triangle #1)
		0.0, 0.0,
		// Lower-left (triangle #1)
		0.0, 1.0,
		// Lower-right (triangle #1)		
		1.0, 1.0,
		
		// Lower-right (triangle #2)		
		1.0, 1.0,
		// Upper-right (triangle #2)
		1.0, 0.0,
		// Upper-left (triangle #2)		
		0.0, 0.0
	]);	
	
	// Scene backdrop vertex/texture coordinate
	// buffers to be used by WebGL	
	this.sceneBackdropWebGlVertexBuffer = null;
	this.sceneBackdropWebGlTexCoordBuffer = null;
	
	this.sceneBackdropWebGlVertexCount = 0;
}

/**
 *  Class that is used to encapsulate data to be rendered using
 *   WebGL
 *  
 *  @param shaderProgram {WebGLProgram} Shader program to be used during rendering
 *  @param vertexBuffer {WebGLBuffer} Vertex buffer that describes the object geometry
 *  @param colorBuffer {WebGLBuffer} Color buffer which indicates the color of each vertex
 *  @param texCoordBuffer {WebGLBuffer} Buffer which indicates the texture coordinates for
 *                                      each vertex
 *  @param normalBuffer {WebGLBuffer} Buffer that contains the normals for each vertex
 *  @param vertexCount {WebGLBuffer} Number of vertices to be rendered
 *
 *  @see MainSnowmanSnowballFightScene.renderGeometry
 */
function ObjectRenderWebGlData(shaderProgram, vertexBuffer, colorBuffer, texCoordBuffer, normalBuffer, vertexCount) {
	this.webGlShaderProgram = shaderProgram
	this.webGlVertexBuffer = vertexBuffer;
	this.webGlVertexColorBuffer = colorBuffer;
	this.webGlTexCoordBuffer = texCoordBuffer,
	this.webGlVertexNormalBuffer = normalBuffer;
	this.vertexCount = vertexCount;
}

function MainSnowmanSnowballFightScene() {
	
}

/**
 *  Initializes the scene - invoked before scene execution
 *  
 *  @see sceneExecution()
 */
MainSnowmanSnowballFightScene.prototype.initialize = function () {
	this.firstIterationExecuted = false;
	this.totalElapsedSceneTimeMs = 0.0;
	this.currentSceneRunningTimeMs = 0.0;
	
	this.constTransformationMatrixRowCount = 4;
	this.constTransformationMatrixColumnCount = 4;
	
	// Scaling factor used to appropriately adjust the world scale to the
	// WebGL coordiante system. Each unit measurement value is roughly
	// equivalent to 1 foot; the world scale does not change the actual
	// equivalent unit length - it only adjusts the scale used for
	// rendering.
	this.constWorldScale = 0.03;
	
	// Gravitational acceleration constant, expressed in
	// feet / milliseconds²
	this.gravitationalAccelerationFtPerMsSq = 32.34 * this.constWorldScale / (Constants.millisecondsPerSecond * Constants.millisecondsPerSecond);
	
	// Radius of the sphere at the base of the snowman
	this.constBaseSnowmanSphereRadius = 1.0 * this.constWorldScale;
	// Ratio of the radii of successive snowman body spheres
	this.constSnowmanUpperSphereReductionFactor = 0.70;
	// Radius fraction of the sphere vertical overlap
	this.constSnowmanSphereOverlap = 0.4;
	// Number of vertical snowman sphere segments
	this.constSnowmanSphereLongSegmentCount = 20;
	// Number of horizontal snowman sphere segments
	this.constSnowmanSphereLatSegmentCount = 10;
	// Default number of snowmen
	this.constSnowmanCount = 15;
	// Number of snowmen that may appear by statistically
	// low random chance
	this.constSpecialSnowmanCount = 100;
	
	// Snowman arm dimensional/positional parameters
	this.constBaseSnowmanArmRadius = 0.07 * this.constWorldScale;
	this.constBaseSnowmanArmLength = 2.5 * this.constWorldScale;
	this.constSnowmanArmSegmentCount = 10;
	this.constSnowmanArmAngleRad = Math.PI / 4;
	
	// Snowman hat dimensional/positional parameters
	this.constSnowmanHatHeight = 0.7 * this.constWorldScale;
	this.constSnowmanHatBrimHeight = 0.03 * this.constWorldScale;
	this.constSnowmanHatOverlap = 0.4;
	this.constSnowmanHatBrimWidthFactor = 1.5;
	this.constSnowmanHatWidthFactor = 0.9;
	
	// Snowman face button dimensional/positional parameters
	this.constSnowmanFaceButtonRadius = 0.08 * this.constWorldScale;
	this.constSnowmanFaceButtonLongSegmentCount = 5;
	this.constSnowmanFaceButtonLatSegmentCount = 5;
	this.constSnowmanFaceButtonEyeElevationDegRad = Math.PI / 8.0;
	this.constSnowmanFaceButtonEyeSepDegRad = Math.PI / 5.0;
	this.constSnowmanFaceButtonStartDeclRad = Math.PI / 20.0;
	this.constSnowmanFaceButtonMouthHorizSpanDegRad = Math.PI / 4.0;
	this.constSnowmanFaceButtonMouthVertSpanDegRad = Math.PI / 10.0;
	this.constSnowmanFaceButtonMouthSegments = 8.0;
		
	// Snowman nose dimensional/positional parameters
	this.constSnowmanNoseSegmentCount = 6;
	this.constSnowmanNoseLength = 1.0 * this.constWorldScale;
	this.constSnowmanNoseRadius = 0.1 * this.constWorldScale;
	this.constSnowmanNoseAngleRad = -Math.PI / 2.0;
		
	// Snowball dimensional/positional parameters
	this.constSnowballSphereLongSegmentCount = 10;
	this.constSnowballSphereLatSegmentCount = 10;
		
	// Number of segments that comprise a snowman
	this.constSnowmanSegments = 3;
		
	// Snowman colors
	this.constSnowmanBaseColor = new RgbColor(0.8, 0.8, 0.8, 1.0);
	this.constSnowmanArmBaseColor = new RgbColor(0.6, 0.3, 0.15, 1.0);
	this.constSnowballBaseColor = new RgbColor(0.7, 0.7, 0.7, 1.0);
	
	this.constSnowmanHatColor = new RgbColor(0.1, 0.1, 0.1, 1.0);
	
	this.constSnowmanFaceButtonColor = new RgbColor(0.05, 0.05, 0.05, 1.0);
	
	this.constSnowmanNoseColor = new RgbColor(1.0, 0.45, 0.2, 1.0);
		
	// Number of floating point values that comprise a vertex
	this.constVertexSize = 3;
	// Number of floating point values that comprise a vector
	this.constVectorSize = 3;
	// Number of floating point values that comprise a vertex
	// color
	this.constVertexColorSize = 4;
	// Number of floating point values that comprise a texture
	// coordinate
	this.constTextureCoordinateSize = 2;
	
	// Center of the "world" in which the rendering will occur
	this.constWorldCenterPoint = new Point3d(0.0, 0.0, 0.0);
	// Boundary for snowman travel (distance from the "world" center)
	this.constWorldBoundaryDistanceFromCenter = 16.0 * this.constWorldScale;
	
	// Snowman is walking
	this.constSnowmanStateTraveling = 0;
	// Snowman is in the process of throwing a snowball
	this.constSnowmanStateThrowing = 1;
	// Snowman has been hit by a snowball
	this.constSnowmanStateHit = 2;
	// Snowman is undergoing a recovery period after being hit by a snowball
	this.constSnowmanStateStunned = 3;

	
	this.constSnowmanWaddleAngleRad = Math.PI / 20.0;
	// Base snowman waddle period (milliseconds)
	this.constSnowmanWaddleBasePeriodMs = 1200;
		
	// Snowman throwing state duration (milliseconds)
	this.constSnowmanThrowingStateDuration = 200;
	
	// Snowman hit response state duration (milliseconds)
	this.constSnowmanHitStateDuration = 200;
	
	// Snowman stunned state duration (milliseconds)
	this.constSnowmanStunnedStateDuration = 300;
	
	// Time fraction during the throwing state when the
	// projectile is actually launched
	this.constThrowStateProjectileLaunchStartFraction = 0.5;
	
	// Snowing throwing pose parameters - indicates the amount
	// the snowman will ultimately lean during the throwing pose
	// (radians, X and Z axis)
	this.constSnowmanThrowLeanAngleRadAxisX = Math.PI / 8.0;	
	this.constSnowmanThrowLeanAngleRadAxisZ = Math.PI / 15.0;
		
	// Snowman hit pose parameters - indicates the maximum amount
	// that the snowman will jump and lean (radians) after being hit
	// by a snowball
	this.constSnowmanHitLeanAngleRad = Math.PI / 7.0;
	this.constSnowmanHitLeapDistance = 1.50 * this.constWorldScale;
	
	// Snowman stunned pose parameters - indicates the maximum degrees
	// that the snowman will lean after being stunned, in addition to the
	// number of rotations that will occur around the Y axis
	this.constSnowmanStunnedLeanAngleRad = Math.PI / 3.0;
	this.constSnowmanStunnedOscillationsXz = 3.0;
	this.constSnowmanStunnedLeanOscillationsY = 3.0;
	
	// Minimum/maximum movement rates, units / millisecond
	// (randomly assigned to snowman instances
	// upon creation)
	this.constSnowmanMinMovementMagnitude = this.constWorldBoundaryDistanceFromCenter / 7500.0;
	this.constSnowmanMaxMovementMagnitude = this.constWorldBoundaryDistanceFromCenter / 3000.0;
	
	// Minimum/maximum interval between snowball throws
	// (randomly assigned to snowman instances
	// upon creation)	
	this.constSnowmanMinThrowIntervalMs = 800.0;
	this.constSnowmanMaxThrowIntervalMs = 4000.0;
	
	// Min/maximum snowball planar velocity (with
	// respect to X-Y plane - does not include vertical
	// velocity component - units/millisecond; 
	// randomly assigned to snowman instances
	// upon creation)
	this.constMinSnowballVelocity = 35.0 * this.constWorldScale / Constants.millisecondsPerSecond;
	this.constMaxSnowballVelocity = 75.0 * this.constWorldScale / Constants.millisecondsPerSecond;
	
	// Range for target acquisition field of views
	// (randomly assigned to snowman instances
	// upon creation)
	this.constMinSnowmanTargetAcquisitionFov = Math.PI / 9.0;
	this.constMaxSnowmanTargetAcquisitionFov = Math.PI / 3.0;
	
	// Variance about the mean throwing velocity for an
	// individual snowman
	this.constSnowmanThrowVelocityVariance = 0.15;
	
	// Maximum random angle to be added to/subtracted
	// from a reversed direction vector.
	this.constReversedVectorRandomAdjustmentMaxDegRad = Math.PI / 4.0;
	
	this.constSnowballRadius = 0.350 * this.constWorldScale;
		
	// Instance data (position, state, etc.) for all snowman
	// instances
	this.snowmanInstanceDataCollection = [];
	
	// Instance data for all snowballs
	this.snowballInstanceDataCollection = [];
	
	// Ground plane geometry/data
	this.sceneGroundPlaneData = null;
	
	// Scroller geometry
	this.sceneScrollerGeometry = null;
	
	// Backdrop geometry
	this.sceneBackdropGeometry = null;
	
	// Camera orbit radius
	this.constOrbitCameraPathRadius = 4.0 * this.constWorldScale;
	// Camera orbit angular velocity (radians/millisecond)
	this.constCameraOrbitDegreesRadPerMs = Math.PI * 1.0 / 20000.0;
	// Camera elevation
	this.constOrbitCameraPathElevation = 1.5 * this.constWorldScale;
	
	// Immediate position of the camera
	this.cameraPosition = new Point3d(0.0, 0.0, 0.0);
	// Point where the camera is facing
	this.cameraLookAtPoint = new Point3d(0.0, 0.0, 0.0);
	// Axial rotation of the camera (presently unused)
	this.cameraAxialRotationAngleRad = 0.0;
	
	// Ambient light data/direction
	this.sceneAmbientLight = null;
	
	// Message scroller logic
	this.messageScroller = new TextScroller(Constants.scrollerFontSizePx, Constants.scrollerFont,
		Constants.scrollerFontStyle);
	this.messageScroller.setSourceString(Constants.messageText);
	
	// Background color for the scroller section.
	this.scrollerBackgroundColor = new RgbColor(
		Constants.scrollerBackgroundUnitIntensity,
		Constants.scrollerBackgroundUnitIntensity,
		Constants.scrollerBackgroundUnitIntensity,		
		Constants.scrollerBackgroundUnitAlpha);
		
	// Position at which the scroller should be displayed.;
	this.scrollerCoordX = 0;
	this.scrollerCoordY = 0;
	
	// Scroller states - lead-in in is the delay before any of the scroller is displayed,
	// fade in is the period where the background fades-in in, and the text display
	// phase indicates the phase where the scroller is actually operating.
	this.constScrollerStateLeadIn = 0;
	this.constScrollerStateFadeIn = 1;
	this.constScrollerStateDisplayText = 2;
	
	// Stores the current scroller state
	this.currentScrollerState = this.constScrollerStateLeadIn;
	
	// Tracks the time in the present scroller state.
	this.currentScrollerStateTime = 0;
	
	// Scroller lead-in time (milliseconds)
	this.constScrollerStateLeadInTime = 4000;
	
	// Scroller fade-in time (milliseconds)
	this.constScrollerStateFadeInTime = 3000;
	
	// Display update interval at which the scroller will be
	// updated
	this.constTextScrollerUpdateInterval = 2;
	
	// Current scroller update interval count (updating the scroller on each frame
	// can degrade performance).
	this.textScrollerIntervalCount = 0;
	
	// Minimum high hit count required for any visual
	// high-score indication to be applied
	this.constMinHighHitCountForIndication = 500;
	
	// Immediate high "score" for snowman hit count;
	this.currentSnowmanHighHitCount = 0;
	
	// Initialize the scene objects.
	var webGlCanvasContext = globalResources.getMainCanvasContext();
	webGlCanvasContext.clearColor(0.0, 0.0, 0.0, 1.0);
	// Enable alpha blending (used primarily by the scroller).
	webGlCanvasContext.enable(webGlCanvasContext.BLEND);
	webGlCanvasContext.blendFunc(webGlCanvasContext.SRC_ALPHA, webGlCanvasContext.ONE_MINUS_SRC_ALPHA);
	
	// Create the scene objects.
	this.createSceneAmbientLight(webGlCanvasContext);
	this.createGroundPlane(webGlCanvasContext);
	this.createSnowmanInstanceDataCollection(webGlCanvasContext);
	this.createScrollerOverlayGeometry(webGlCanvasContext);
	this.createBackdropGeometry(webGlCanvasContext);
}

/**
 *  Generates a random value within a specified range (inclusive
 *   of the minimum value in the range, but not the maximum
 *   value)
 *  
 *  @param minRangeValue {number} The minimum possible value of the random value range
 *                                (inclusive)
 *  @param maxRangeValue {number} The maximum possible value of the random value range
 *                                (non-inclusive)
 *  @return {number} A random value within the specified range upon success, zero otherwise
 */
MainSnowmanSnowballFightScene.prototype.getRandomValueInRange = function(minRangeValue, maxRangeValue) {
	var randomValue = 0.0;
	
	if ((typeof(minRangeValue) === "number") && (typeof(maxRangeValue) === "number")) {
		
		var trueMinValue = Math.min(minRangeValue, maxRangeValue);
		var trueMaxValue = Math.max(minRangeValue, maxRangeValue);
		
		randomValue = ((trueMaxValue - trueMinValue) * Math.random()) + trueMinValue;
	}
	
	return randomValue;
}

/**
 *  To be used during initialization - determines the number of snowmen to be
 *   displayed - this method will randomly return a large number of snowmen, but
 *   will otherwise return a consistent value
 *  
 *  @return {number} The number of snowmen to be displayed
 */
MainSnowmanSnowballFightScene.prototype.determineSnowmanCount = function() {
	// Rough probability of displaying a large number of snowmen - 1 / 1000
	var constMaxProbability = 999.0;
	var constNormalCountProbability = 998.00;
	
	var snowmanCount = 0.0;
	
	if (this.getRandomValueInRange(0.0, constMaxProbability) > constNormalCountProbability) {
		snowmanCount = this.constSpecialSnowmanCount;
	}
	else {
		snowmanCount = this.constSnowmanCount;
	}
	
	return snowmanCount;
}

/**
 *  Generates a translation matrix, the components specified within
 *   a point as the translation offset
 *  
 *  @param point3d {Point3d} Point that contains components that will be used
 *                           as a translation offset
 *  @return {MathExt.Matrix} A matrix object representing the specified
 *                           translation
 */
MainSnowmanSnowballFightScene.prototype.generateTranslationMatrixFromPoint = function(point3d) {
	var translationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	translationMatrix.setToIdentity();	
	
	if (validateVarAgainstType(point3d, Point3d)) {
		translationMatrix = MathUtility.generateTranslationMatrix3d(point3d.getX(),
			point3d.getY(), point3d.getZ());	
	}
	
	return translationMatrix;
}

/**
 *  Allocates a WebGL buffer, and stores the specified coordinate data
 *   within the buffer
 *  
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 *  @param sourceData {Float32Array} Array of coordinate data to be buffered for use by
 *                                   WebGL
 *  @return {WebGLBuffer} A WebGL buffer containing the provided data
 */
MainSnowmanSnowballFightScene.prototype.createWebGlBufferFromData = function(webGlCanvasContext, sourceData) {
	var targetBuffer = webGlCanvasContext.createBuffer();
	
	webGlCanvasContext.bindBuffer(webGlCanvasContext.ARRAY_BUFFER, targetBuffer);
	webGlCanvasContext.bufferData(webGlCanvasContext.ARRAY_BUFFER, sourceData, webGlCanvasContext.STATIC_DRAW);
	
	return targetBuffer
}

/**
 *  Creates the ambient light object
 *  
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.createSceneAmbientLight = function(webGlCanvasContext) {
	this.sceneAmbientLight = new SceneAmbientLight();
}

/**
 *  Creates the scene ground plane
 *  
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.createGroundPlane = function(webGlCanvasContext) {
	this.sceneGroundPlaneData = new SceneGroundPlaneData();
	
	this.sceneGroundPlaneData.sceneGroundPlaneWebGlVertexBuffer = this.createWebGlBufferFromData(webGlCanvasContext,
		this.sceneGroundPlaneData.sceneGroundPlaneVertexList);
	
	this.sceneGroundPlaneData.sceneGroundPlaneWebGlColorBuffer = this.createWebGlBufferFromData(webGlCanvasContext,
		this.sceneGroundPlaneData.sceneGroundPlaneVertexColors);
	
	this.sceneGroundPlaneData.sceneGroundPlaneWebGlNormalBuffer = this.createWebGlBufferFromData(webGlCanvasContext,
		this.sceneGroundPlaneData.sceneGroundPlaneVertexNormals);
}

/**
 *  Generates the triangle data that will be used to render
 *   the body of a snowman
 *  
 *  @return {AggregateWebGlVertexData} Object which contains a collection
 *          of vertex data that can be directly buffered by WebGl
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanBodyGeometry = function() {
	var snowmanTriangleArray = [];
	
	// Create the body geometry for a snowman, consisting of a number of
	// sphere oriented in a columnar fashion, with overlap along the vertical
	// axis.
	var currentOffset = this.constBaseSnowmanSphereRadius;
	for (var currentSegment = 0; currentSegment < this.constSnowmanSegments; currentSegment++) {
		// Ascending the Y-axis, each successive sphere will be smaller than
		// the previous sphere,
		var currentSphereSizeReductionFactor = (Math.pow(this.constSnowmanUpperSphereReductionFactor, currentSegment));
		var currentSnowmanSphereRadius = (this.constBaseSnowmanSphereRadius * currentSphereSizeReductionFactor);
		var nextSegmentOverlap = (this.constSnowmanSphereOverlap * currentSnowmanSphereRadius)
		
		// Aggregate the snowman body geometry.
		snowmanTriangleArray.push.apply(snowmanTriangleArray, this.generateSnowmanSegmentGeometry(currentSnowmanSphereRadius, currentOffset));
		
		currentOffset += (currentSnowmanSphereRadius * (1 + this.constSnowmanUpperSphereReductionFactor) -
			nextSegmentOverlap);
	}
	
	// Convert the geometric representation to verticex data that is usable
	// by WebGL.
	var aggregateVertexData = generateAggregateVertexDataFromTriangleList(snowmanTriangleArray);

	return aggregateVertexData;
}

/**
 *  Generates vertex data that will be used to render a single
 *   snowman arm
 *  
 *  @param centerPoint {Point3d} Specifies the arm centerpoint in three-dimensional
 *                               space
 *  @return {Array} Array of Triangle objects
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanSingleArmGeometry = function(centerPoint) {
	cylinderGeometryGenerator = new TessellatedCylinderGenerator(this.constBaseSnowmanArmLength,
		this.constBaseSnowmanArmRadius, centerPoint);
	
	cylinderGeometryGenerator.setSegmentCount(this.constSnowmanArmSegmentCount);
	cylinderGeometryGenerator.setColor(this.constSnowmanArmBaseColor);
	
	cylinderGeometryGenerator.generateGeometry();
	
	return cylinderGeometryGenerator.getTriangleList();
}

/**
 *  Generates a transformation matrix required to properly position the snowman
 *   arm
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param radialDisplacement {number} Displacement which matches the radius of the sphere to
 *                                     which the arm will be attached
 *  @param directionMultiplier {number} Positive or negative unit value that determines the
 *                                      arm rotation/displacement direction
 *  @return {MathExt.Matrix} A matrix object which describes that required transformation
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanArmTransformationmatrix = function(snowmanInstanceData,
	radialDisplacement, directionMultiplier) {
	
	// Amount the arms will be displaced, fractionally, relative to the radius of
	// the sphere to which the arm is attached.
	var armOutsetFraction = 0.6;
	
	var snowmanBodyHeight = this.computeSnowmanHeightForSegmentCount(this.constSnowmanSegments - 1);
	// Displace the arm to the left or right of the snowman, in accordance with the
	// specified direction multiplier.
	var armCenterPoint = new Point3d(directionMultiplier * radialDisplacement * armOutsetFraction,
		snowmanBodyHeight - radialDisplacement, 0.0)

	// Rotate the arm, using the direction bias specified by the direction multiplier
	var translationMatrix = this.generateTranslationMatrixFromPoint(armCenterPoint);		
	var rotationMatrix = MathUtility.generateRotationMatrix3dAxisZ(this.constSnowmanArmAngleRad * directionMultiplier);

	var finalTransformationMatrix = translationMatrix.multiply(rotationMatrix);
	
	return finalTransformationMatrix;
}

/**
 *  Generates the WebGL buffer arm geometry for a snowman instance
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance (will contain the generated
 *                                                   arm geometry data)
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanAllArmGeometry = function(snowmanInstanceData, webGlCanvasContext) {
	
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData) && (this.constSnowmanSegments > 1)) {
		var snowmanRightArmTriangleArray = [];	
		var snowmanLeftArmTriangleArray = [];	
				
		var penultimateSegmentRadius = this.computeSnowmanSegmentRadiusForSegmentIndex(this.constSnowmanSegments - 2);

		// Right arm
		var rightArmGeometry = this.generateSnowmanSingleArmGeometry(new Point3d(0.0, 0.0, 0.0));
		snowmanRightArmTriangleArray.push.apply(snowmanRightArmTriangleArray, rightArmGeometry);

		// Left arm
		var leftArmGeometry = this.generateSnowmanSingleArmGeometry(new Point3d(0.0, 0.0, 0.0));
		snowmanLeftArmTriangleArray.push.apply(snowmanLeftArmTriangleArray, leftArmGeometry);
	
		var rightArmVertexData = generateAggregateVertexDataFromTriangleList(rightArmGeometry);
		var leftArmVertexData = generateAggregateVertexDataFromTriangleList(leftArmGeometry);

		// Generate the WebGL vertex, color, and normal buffers to be used
		// by WebGL (right arm)
		snowmanInstanceData.snowmanWebGlRightArmVertexBuffer =
			this.createWebGlBufferFromData(webGlCanvasContext, rightArmVertexData.vertices);
		snowmanInstanceData.snowmanWebGlRightArmColorBuffer =
			this.createWebGlBufferFromData(webGlCanvasContext, rightArmVertexData.vertexColors);
		snowmanInstanceData.snowmanWebGlRightArmNormalBuffer =
			this.createWebGlBufferFromData(webGlCanvasContext, rightArmVertexData.vertexNormals);
		snowmanInstanceData.snowmanRightArmVertexCount = rightArmVertexData.vertices.length / this.constVertexSize;
		snowmanInstanceData.snowmanWebGlRightArmBaseTransformationMatrix = this.generateSnowmanArmTransformationmatrix(
			snowmanInstanceData, penultimateSegmentRadius, -1.0);

		// Generate the WebGL vertex, color, and normal buffers to be used
		// by WebGL	(left arm)
		snowmanInstanceData.snowmanWebGlLeftArmVertexBuffer =
			this.createWebGlBufferFromData(webGlCanvasContext, leftArmVertexData.vertices);
		snowmanInstanceData.snowmanWebGlLeftArmColorBuffer =
			this.createWebGlBufferFromData(webGlCanvasContext, leftArmVertexData.vertexColors);
		snowmanInstanceData.snowmanWebGlLeftArmNormalBuffer =
			this.createWebGlBufferFromData(webGlCanvasContext, leftArmVertexData.vertexNormals);
		snowmanInstanceData.snowmanLeftArmVertexCount = leftArmVertexData.vertices.length / this.constVertexSize;
		snowmanInstanceData.snowmanWebGlLeftArmBaseTransformationMatrix = this.generateSnowmanArmTransformationmatrix(
			snowmanInstanceData, penultimateSegmentRadius, 1.0);
	}
}

/**
 *  Generates a list of triangles that will ultimately be used for a
 *   snowman hat section (brim or top)
 *  
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 *  @param hatSectionHeight {number} Target height for the hat section
 *  @param radius {number} Target radius for the hat section
 *  @param centerY {number} Vertical offset from the origin that indicates the hat centerpoint
 *                          along the Y axis
 *  @return {Array} A list of triangles that will ultimately be used to render
 *                  the hat
 */
MainSnowmanSnowballFightScene.prototype.generateHatSectionGeometry = function(webGlCanvasContext,
	hatSectionHeight, radius, centerY) {
		
	var hatCenterPoint = new Point3d(0.0, centerY, 0.0);
	cylinderGeometryGenerator = new TessellatedCylinderGenerator(hatSectionHeight, radius, hatCenterPoint);
	cylinderGeometryGenerator.setColor(this.constSnowmanHatColor);
	
	cylinderGeometryGenerator.generateGeometry();
	
	return cylinderGeometryGenerator.getTriangleList();
}

/**
 *  Generates the WebGL buffer hat geometry for a single snowman
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance (will contain the generated
 *                                                   hat geometry data)
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanHatGeometry = function(snowmanInstanceData, webGlCanvasContext) {
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData) && (this.constSnowmanSegments > 1)) {
		
		// The width of the hat will be determined by the radius of the snowman head...
		var lastSnowmanSegmentRadius = this.computeSnowmanSegmentRadiusForSegmentIndex(this.constSnowmanSegments - 1);
		var hatBrimRadius = this.constSnowmanHatBrimWidthFactor * lastSnowmanSegmentRadius;
		var hatRadius = this.constSnowmanHatWidthFactor * lastSnowmanSegmentRadius;
		
		// Determine the required Y-offset of the hat, based upon the snowman height
		var snowmanBodyHeight = this.computeSnowmanHeightForSegmentCount(this.constSnowmanSegments);
		var hatCenterY = snowmanBodyHeight + (this.constSnowmanHatHeight / 2.0)-
			(lastSnowmanSegmentRadius * this.constSnowmanHatOverlap);
		var hatBrimCenterY = snowmanBodyHeight + (this.constSnowmanHatBrimHeight / 2.0) -
			(lastSnowmanSegmentRadius * this.constSnowmanHatOverlap);
			
		// Generate the geometry for the brim and the hat top
		var hatBrimGeometry = this.generateHatSectionGeometry(webGlCanvasContext, this.constSnowmanHatBrimHeight,
			hatBrimRadius, hatBrimCenterY);
		var hatGeometry = this.generateHatSectionGeometry(webGlCanvasContext, this.constSnowmanHatHeight,
			hatRadius, hatCenterY);
		
		hatGeometry = hatGeometry.concat(hatBrimGeometry);
		
		// Generate the WebGL vertex, color, and normal buffers for the hat
		var hatVertexData = generateAggregateVertexDataFromTriangleList(hatGeometry);
	
		snowmanInstanceData.snowmanWebGlHatVertexBuffer =
			this.createWebGlBufferFromData(webGlCanvasContext, hatVertexData.vertices);
		snowmanInstanceData.snowmanWebGlHatColorBuffer =
			this.createWebGlBufferFromData(webGlCanvasContext, hatVertexData.vertexColors);
		snowmanInstanceData.snowmanWebGlHatNormalBuffer =
			this.createWebGlBufferFromData(webGlCanvasContext, hatVertexData.vertexNormals);
		snowmanInstanceData.snowmanHatVertexCount = hatVertexData.vertices.length / this.constVertexSize;
	}
}

/**
 *  Generates geometry for a single face button
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param faceButtonCenterPoint {Point3d} Centerpoint for the face button in three-dimensional
 *                                         space
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 *  @return {Array} List of triangles that will ultimately be used to render the
 *                  face button
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanFaceButton = function(snowmanInstanceData,
	faceButtonCenterPoint, webGlCanvasContext) {
		
	var baseSphereGeometryGenerator = new TessellatedSphereGenerator(this.constSnowmanFaceButtonRadius,
		faceButtonCenterPoint);
	
	baseSphereGeometryGenerator.setLongitudinalSegmentCount(this.constSnowmanFaceButtonLongSegmentCount);
	baseSphereGeometryGenerator.setLatitudinalSegmentCount(this.constSnowmanFaceButtonLatSegmentCount);
	baseSphereGeometryGenerator.setColor(this.constSnowmanFaceButtonColor);
	
	baseSphereGeometryGenerator.generateGeometry();
	
	return baseSphereGeometryGenerator.getTriangleList();		
}

/**
 *  Computes the centerpoint for a face button, using a pair latitude/longitude
 *   angular specifications
 *  
 *  @param latitudeDegRad {number} Latitude (radians)
 *  @param longitudeDegRad {number} Longitude (radians)
 *  @return {Point3d} Centerpoint to be used for the face button
 */
MainSnowmanSnowballFightScene.prototype.computeFaceButtonCenterFromLatLongDegRad = function(latitudeDegRad,
	longitudeDegRad) {
	
	var buttonCenterPoint = new Point3d(0.0, 0.0, 0.0);
	
	if ((typeof(latitudeDegRad) == "number") && (typeof(longitudeDegRad) === "number") &&
		(this.constSnowmanSegments > 0)) {	
		
		var snowmanBodyHeight = this.computeSnowmanHeightForSegmentCount(this.constSnowmanSegments);		
		var lastSegmentRadius = this.computeSnowmanSegmentRadiusForSegmentIndex(this.constSnowmanSegments - 1);
		var referenceRadiusPoint = new Point3d(0.0, 0.0, lastSegmentRadius);

		var rotatedPoint = MathUtility.rotatePointAroundAxisX(referenceRadiusPoint, latitudeDegRad);
		buttonCenterPoint = MathUtility.rotatePointAroundAxisY(rotatedPoint, longitudeDegRad);
		buttonCenterPoint.offset(0.0, snowmanBodyHeight - lastSegmentRadius, 0.0);
	}
		
	return buttonCenterPoint;
}

/**
 *  Generates geometry for the snowman eye buttons
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 *  @return {Array} List of Triangle objects that will ultimately be used
 *                  to render the eye buttons
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanEyeButtonGeometry = function(snowmanInstanceData, webGlCanvasContext) {
	var eyeGeometry = null;
	
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData) && validateVar(webGlCanvasContext)) {
		var leftEyeCenterPoint = this.computeFaceButtonCenterFromLatLongDegRad(
			this.constSnowmanFaceButtonEyeElevationDegRad, this.constSnowmanFaceButtonEyeSepDegRad / 2.0);
		var rightEyeCenterPoint = this.computeFaceButtonCenterFromLatLongDegRad(
			this.constSnowmanFaceButtonEyeElevationDegRad,
			-this.constSnowmanFaceButtonEyeSepDegRad / 2.0);
	
		var eyeGeometry = this.generateSnowmanFaceButton(snowmanInstanceData, leftEyeCenterPoint, webGlCanvasContext);
		
		eyeGeometry = eyeGeometry.concat(this.generateSnowmanFaceButton(snowmanInstanceData, rightEyeCenterPoint,
			webGlCanvasContext));
	}
	
	return eyeGeometry;
}

/**
 *  Generates geometry for the snowman mouth buttons
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 *  @return {Array} List of Triangle objects that will ultimately be used
 *                  to render the mouth buttons
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanMouthButtonGeometry = function(snowmanInstanceData, webGlCanvasContext) {
	var mouthGeometry = null;
	
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData) && validateVar(webGlCanvasContext)) {
		mouthGeometry = new Array();
		
		for (var currentButton = 0; currentButton < this.constSnowmanFaceButtonMouthSegments; currentButton++) {
			// Use a sinusoidal declination in order to emulate a smile
			// pattern.
			var mouthCompletionFraction = currentButton / (this.constSnowmanFaceButtonMouthSegments - 1);
			var currentButtonDeclSineAngle = mouthCompletionFraction * Math.PI;
			this.constSnowmanFaceButtonMouthHorizSpanDegRad
			var currentLongitude = (mouthCompletionFraction - 0.5) * this.constSnowmanFaceButtonMouthHorizSpanDegRad;
			var currentLatitude = -this.constSnowmanFaceButtonStartDeclRad -
				(this.constSnowmanFaceButtonMouthVertSpanDegRad * Math.sin(currentButtonDeclSineAngle));
				
			var centerPoint = this.computeFaceButtonCenterFromLatLongDegRad(currentLatitude, currentLongitude);
			mouthGeometry = mouthGeometry.concat(this.generateSnowmanFaceButton(snowmanInstanceData, centerPoint,
				webGlCanvasContext));
		}
	}
	
	return mouthGeometry;
}

/**
 *  Generates the WebGL buffer face button geometry for a single snowman
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance (will contain the generated
 *                                                   face button geometry data)
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanFaceButtonGeometry = function(snowmanInstanceData, webGlCanvasContext) {
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData) && validateVar(webGlCanvasContext)) {
		var snowmanFaceButtonGeometry = this.generateSnowmanEyeButtonGeometry(snowmanInstanceData, webGlCanvasContext);
		snowmanFaceButtonGeometry = snowmanFaceButtonGeometry.concat(
			this.generateSnowmanMouthButtonGeometry(snowmanInstanceData, webGlCanvasContext));
		var faceGeometryVertexData = generateAggregateVertexDataFromTriangleList(snowmanFaceButtonGeometry);
		
		// Generate the WebGL vertex, color, and normal buffers for the face buttons
		snowmanInstanceData.snowmanWebGlFaceButtonVertexBuffer = this.createWebGlBufferFromData(webGlCanvasContext,
			faceGeometryVertexData.vertices);
		snowmanInstanceData.snowmanWebGlFaceButtonColorBuffer = this.createWebGlBufferFromData(webGlCanvasContext,
			faceGeometryVertexData.vertexColors);
		snowmanInstanceData.snowmanWebGlFaceButtonNormalBuffer = this.createWebGlBufferFromData(webGlCanvasContext,
			faceGeometryVertexData.vertexNormals);
		snowmanInstanceData.snowmanFaceButtonVertexCount = faceGeometryVertexData.vertices.length /
			this.constVertexSize;
	}	
}

/**
 *  Generates a transformation matrix required to properly position the snowman
 *   nose
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param radialDisplacement {number} Displacement which matches the radius of the sphere to
 *                                     which the nose will be attached
 *  @param directionMultiplier {number} Positive or negative unit value that determines the
 *                                      arm rotation/displacement direction
 *  @return {MathExt.Matrix} A matrix object which describes that required transformation
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanNoseTransformationmatrix = function(snowmanInstanceData,
	radialDisplacement) {
	
	var snowmanBodyHeight = this.computeSnowmanHeightForSegmentCount(this.constSnowmanSegments);
	
	var noseBasePoint = new Point3d(0.0, snowmanBodyHeight - radialDisplacement, radialDisplacement);

	var translationMatrix = this.generateTranslationMatrixFromPoint(noseBasePoint);		
	var rotationMatrix = MathUtility.generateRotationMatrix3dAxisX(this.constSnowmanNoseAngleRad);

	var finalTransformationMatrix = translationMatrix.multiply(rotationMatrix);
	
	return finalTransformationMatrix;
}

/**
 *  Generates the WebGL buffer nose geometry for a single snowman
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance (will contain the generated
 *                                                   nose geometry data)
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanNoseGeometry = function(snowmanInstanceData, webGlCanvasContext) {
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData) && validateVar(webGlCanvasContext)) {

		var lastSnowmanSegmentRadius = this.computeSnowmanSegmentRadiusForSegmentIndex(this.constSnowmanSegments - 1);
		
		var coneBasePoint = new Point3d(0.0, 0.0, 0.0);
	
		var coneGeometryGenerator = new TessellatedConeGenerator(this.constSnowmanNoseLength,
			this.constSnowmanNoseRadius, coneBasePoint);
	
		coneGeometryGenerator.setSegmentCount(this.constSnowmanNoseSegmentCount);
		coneGeometryGenerator.setColor(this.constSnowmanNoseColor);
	
		coneGeometryGenerator.generateGeometry();
		var snowmanNoseGeometry = coneGeometryGenerator.getTriangleList();
		var snowmanNoseVertexData = generateAggregateVertexDataFromTriangleList(snowmanNoseGeometry);
		
		// Generate the WebGL vertex, color, and normal buffers for the snowman nose
		snowmanInstanceData.snowmanWebGlNoseVertexBuffer = this.createWebGlBufferFromData(webGlCanvasContext,
			snowmanNoseVertexData.vertices);
		snowmanInstanceData.snowmanWebGlNoseColorBuffer = this.createWebGlBufferFromData(webGlCanvasContext,
			snowmanNoseVertexData.vertexColors);
		snowmanInstanceData.snowmanWebGlNoseNormalBuffer =  this.createWebGlBufferFromData(webGlCanvasContext,
			snowmanNoseVertexData.vertexNormals);
		snowmanInstanceData.snowmanWebGlNoseBaseTransformationMatrix = this.generateSnowmanNoseTransformationmatrix(snowmanInstanceData,
			lastSnowmanSegmentRadius);
		snowmanInstanceData.snowmanNoseVertexCount = snowmanNoseVertexData.vertices.length /
			this.constVertexSize;
	}		
}

/**
 *  Generates the geometry for the scroller overlay
 *  
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.createScrollerOverlayGeometry = function(webGlCanvasContext) {
	this.sceneScrollerGeometry = new SceneScrollerGeometry();
			
	this.sceneScrollerGeometry.sceneScrollerWebGlVertexBuffer = this.createWebGlBufferFromData(webGlCanvasContext,
		this.sceneScrollerGeometry.scrollerOverlayVertices);
		
	this.sceneScrollerGeometry.sceneScrollerWebGlTexCoordBuffer = this.createWebGlBufferFromData(webGlCanvasContext,
		this.sceneScrollerGeometry.scrollerTextureCoords);
		
	this.sceneScrollerGeometry.sceneScrollerWebGlVertexCount = this.sceneScrollerGeometry.scrollerOverlayVertices.length /
		this.constVertexSize;
}

/**
 *  Generates the geometry for the scene backdrop
 *  
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.createBackdropGeometry = function(webGlCanvasContext) {
	this.sceneBackdropGeometry = new SceneBackdropGeometry();
	
	this.sceneBackdropGeometry.sceneBackdropWebGlVertexBuffer = this.createWebGlBufferFromData(webGlCanvasContext,
		this.sceneBackdropGeometry.backdropVertices);
	this.sceneBackdropGeometry.sceneBackdropWebGlTexCoordBuffer = this.createWebGlBufferFromData(webGlCanvasContext,
		this.sceneBackdropGeometry.backdropTextureCoords);
	this.sceneBackdropGeometry.sceneBackdropWebGlVertexCount = this.sceneBackdropGeometry.backdropVertices.length /
		this.constVertexSize;
}

/**
 *  Generates geometry for all snowman contained within the scene
 *  
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.createSnowmanInstanceDataCollection = function(webGlCanvasContext) {
	this.snowmanInstanceDataCollection = new Array();
	
	// Generate the geometry that will be used for all snowmen (all snowmen
	// will use the same geometry).
	var snowmanAggregateVertexData = this.generateSnowmanBodyGeometry();
	if (validateVar(snowmanAggregateVertexData) && validateVar(webGlCanvasContext)) {
		var sessionSnowmanCount = this.determineSnowmanCount();
		for (var instanceDataLoop = 0; instanceDataLoop < sessionSnowmanCount; instanceDataLoop++) {
			var snowmanInstanceData = new SnowmanInstanceData();
			
			this.initializeSnowmanState(snowmanInstanceData);
			
			// Copy the vertex data to the snowman instance object.
			var snowmanWebGlVertexList = snowmanAggregateVertexData.vertices.slice();
			var snowmanWebGlVertexColors = snowmanAggregateVertexData.vertexColors.slice();
			var snowmanWebGlVertexTexCoords = snowmanAggregateVertexData.vertexTextureCoords.slice();
			var snowmanWebGlVertexNormals = snowmanAggregateVertexData.vertexNormals.slice();		
			
			snowmanInstanceData.snowmanVertexCount = (snowmanWebGlVertexList.length > 0) ?
				(snowmanWebGlVertexList.length / this.constVertexSize) : 0;
				
			// Create the vertex buffer for the snowman.
			snowmanInstanceData.snowmanWebGlVertexBuffer =
				this.createWebGlBufferFromData(webGlCanvasContext, snowmanWebGlVertexList);
			
			// Create the color buffer...
			snowmanInstanceData.snowmanWebGlColorBuffer =
				this.createWebGlBufferFromData(webGlCanvasContext, snowmanWebGlVertexColors);
				
			// Create the texture coordinate buffer...
			snowmanInstanceData.snowmanWebGlTexCoordBuffer =
				this.createWebGlBufferFromData(webGlCanvasContext, snowmanWebGlVertexTexCoords);
				
			// Create the normal buffer.
			snowmanInstanceData.snowmanWebGlNormalBuffer = 
				this.createWebGlBufferFromData(webGlCanvasContext, snowmanWebGlVertexNormals);

			snowmanInstanceData.snowmanTransformationMatrixRep = new MathExt.Matrix(this.constTransformationMatrixRowCount,
				this.constTransformationMatrixColumnCount);
			snowmanInstanceData.snowmanTransformationMatrixRep.setToIdentity();
			
			this.generateSnowmanAllArmGeometry(snowmanInstanceData, webGlCanvasContext);
			this.generateSnowmanHatGeometry(snowmanInstanceData, webGlCanvasContext);
			this.generateSnowmanFaceButtonGeometry(snowmanInstanceData, webGlCanvasContext);
			this.generateSnowmanNoseGeometry(snowmanInstanceData, webGlCanvasContext);
			
			this.snowmanInstanceDataCollection.push(snowmanInstanceData);
		}
	}
}

/**
 *  Initializes the data associated with a single snowman
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 */
MainSnowmanSnowballFightScene.prototype.initializeSnowmanState = function(snowmanInstanceData) {
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData)) {
		snowmanInstanceData.currentStateInitiationTimeMs = this.totalElapsedSceneTimeMs;
		snowmanInstanceData.snowmanState = this.constSnowmanStateTraveling;
		snowmanInstanceData.snowmanPosition = this.generateRandomPosition();
		snowmanInstanceData.snowmanDirectionNormalVector = this.generateRandomDirectionVector();
		snowmanInstanceData.snowmanMovementMagnitude = this.getRandomValueInRange(this.constSnowmanMinMovementMagnitude,
			this.constSnowmanMaxMovementMagnitude);
		snowmanInstanceData.snowmanMinSnowballThrowIntervalMs = this.getRandomValueInRange(
			this.constSnowmanMinThrowIntervalMs, this.constSnowmanMaxThrowIntervalMs);
		snowmanInstanceData.snowmanMeanSnowballThrowVelocity = this.getRandomValueInRange(
			this.constMinSnowballVelocity, this.constMaxSnowballVelocity);			
		snowmanInstanceData.snowmanTargetAcquisitionFovDegRad = this.getRandomValueInRange(
			this.constMinSnowmanTargetAcquisitionFov, this.constMaxSnowmanTargetAcquisitionFov);
	}			
}

/**
 *  Initializes the data associated with a single snowball
 *  
 *  @param snowballInstanceData {SnowballInstanceData} Data associated with a single snowball instance
 *  @param sourceSnowmanInstanceData {SnowmanInstanceData} Snowman state object associated with the
 *                                                         snowman from which the snowball originated
 *  @param targetSnowmanInstanceData {SnowmanInstanceData} Snowman state object associated with the
 *                                                         snowman that is the target of the snowball
 */
MainSnowmanSnowballFightScene.prototype.initializeSnowballState = function(snowballInstanceData,
	sourceSnowmanInstanceData, targetSnowmanInstanceData) {
	
	if (validateVarAgainstType(snowballInstanceData, SnowballInstanceData) &&
		validateVarAgainstType(sourceSnowmanInstanceData, SnowmanInstanceData)) {
		// Compute a velocity using the mean velocity assigned to the snowman,
		// adding a random velocity variation (velocity must still be within
		// the range of minimum/maximum velocities).
		var minSnowballVelocity = Math.max(
			(1.0 - this.constSnowmanThrowVelocityVariance) * sourceSnowmanInstanceData.snowmanMeanSnowballThrowVelocity,
			this.constMinSnowballVelocity);
		var maxSnowballVelocity = Math.min(
			(1.0 + this.constSnowmanThrowVelocityVariance) * sourceSnowmanInstanceData.snowmanMeanSnowballThrowVelocity,
			this.constMaxSnowballVelocity);
		var snowballVelocityXyPlane = this.getRandomValueInRange(minSnowballVelocity, maxSnowballVelocity);
		
		snowballInstanceData.snowballPosition = new Point3d(sourceSnowmanInstanceData.snowmanPosition.getX(),
			this.computeSnowballInitialPositionHeight(), sourceSnowmanInstanceData.snowmanPosition.getZ());
		
		var targetPosition = new Point3d(targetSnowmanInstanceData.snowmanPosition.getX(),
			this.computeSnowballInitialPositionHeight(), targetSnowmanInstanceData.snowmanPosition.getZ());
		var velocityVector = PrimitivesUtil.GenerateVector3dFromPoint3d(targetPosition); 
		velocityVector = velocityVector.subtractVector(
			PrimitivesUtil.GenerateVector3dFromPoint3d(snowballInstanceData.snowballPosition));
		velocityVector.normalize();
		velocityVector = velocityVector.multiplyByScalar(snowballVelocityXyPlane);
		
		var snowballTravelTime = targetSnowmanInstanceData.snowmanPosition.distanceFrom(snowballInstanceData.snowballPosition) /
			snowballVelocityXyPlane;
			
		// Velocity = acceleration x time - the snowball will reach its
		// apex halfway through the flight, at which point its velocity
		// will be zero.
		var snowballVerticalVelocity = (snowballTravelTime / 2.0) * this.gravitationalAccelerationFtPerMsSq;
		
		snowballInstanceData.snowballVelocityVector = velocityVector.addVector(new Vector3d(0.0, snowballVerticalVelocity, 0.0));
		
		snowballInstanceData.invalidatedByCollision = false;
		snowballInstanceData.sourceSnowmanInstance = sourceSnowmanInstanceData;
	}
}

/**
 *  Computes the radius of a snowman segment with the specified index
 *  
 *  @param segmentIndex {number} Zero-based segment index
 *  @return {number} Radius of the snowman segment
 */
MainSnowmanSnowballFightScene.prototype.computeSnowmanSegmentRadiusForSegmentIndex = function(segmentIndex) {
	var segmentRadius = 0.0;
	
	if (typeof(segmentIndex) === "number") {
		segmentRadius = this.constBaseSnowmanSphereRadius * Math.pow(this.constSnowmanUpperSphereReductionFactor,
			segmentIndex);
	}
	
	return segmentRadius;
}

/**
 *  Computes the height of a snowman with the specified segment count,
 *   using the pre-defined snowman geometric parameters
 *  
 *  @param segmentCount {number} Number of segments used to represent a snowman
 *  @return {number} Height of the snowman
 */
MainSnowmanSnowballFightScene.prototype.computeSnowmanHeightForSegmentCount = function (segmentCount) {
	var totalSphereHeightWithoutOverlap = MathUtility.computeGeometricSeriesSum(segmentCount,
		(2.0 * this.constBaseSnowmanSphereRadius), this.constSnowmanUpperSphereReductionFactor);
	var totalOverlapReduction = MathUtility.computeGeometricSeriesSum(segmentCount,
		this.constSnowmanSphereOverlap * this.constBaseSnowmanSphereRadius,
		this.constSnowmanSphereOverlap * this.constSnowmanUpperSphereReductionFactor);
		
	return totalSphereHeightWithoutOverlap - totalOverlapReduction;
}

/**
 *  Computes the height of a snowman with the specified segment count,
 *   using the pre-defined snowman geometric parameters
 *  
 *  @param segmentCount {number} Number of segments used to represent a snowman
 *  @return {number} Height of the snowman
 */
MainSnowmanSnowballFightScene.prototype.computeTotalSnowmanHeightForSegmentCount = function(segmentCount) {
	var snowmanHeight = this.computeSnowmanHeightForSegmentCount(segmentCount);
	
	return snowmanHeight;
}

/**
 *  Computes the initial altitude of a newly-thrown snowball, based upon
 *   the snowman height
 *  
 *  @return {number} The altitude of the newly-thrown snowball
 */
MainSnowmanSnowballFightScene.prototype.computeSnowballInitialPositionHeight = function() {
	var snowballHeight = (this.constSnowmanSegments > 0) ?
		this.computeSnowmanHeightForSegmentCount(this.constSnowmanSegments - 1) : 0.0;
		
	return snowballHeight;
}

/**
 *  Generates a random worldspace position that is contained within a
 *   pre-defined distance from the world center
 *  
 *  @return {Point3d} Randomly-generated position in three-dimensional
 *                    space
 *  @see MainSnowmanSnowballFightScene.constWorldBoundaryDistanceFromCenter
 */
MainSnowmanSnowballFightScene.prototype.generateRandomPosition = function() {
	var distanceFromWorldCenter = Math.random() * this.constWorldBoundaryDistanceFromCenter;
	var angularPlacementAlongDistanceCircle = Math.random() * 2.0 * Math.PI;
	
	var randomPosition = new Point3d(0.0, 0.0, distanceFromWorldCenter);
	randomPosition = MathUtility.rotatePointAroundAxisY(randomPosition, angularPlacementAlongDistanceCircle);
	
	return randomPosition;
}

/**
 *  Generates a normalized vector which indicates a randomized direction
 *  
 *  @return {Vector3d} A randomized direction vector
 */
MainSnowmanSnowballFightScene.prototype.generateRandomDirectionVector = function() {
	var randomPosition = this.generateRandomPosition();
	var randomDirectionVector = PrimitivesUtil.GenerateVector3dFromPoint3d(randomPosition);
	randomDirectionVector.normalize();
	
	return randomDirectionVector;
}

/**
 *  Rotates a vector by an arbirtary number of degrees in the X-Y plane
 *  
 *  @param targetVector {Vector3d} Vector that is to be rotated
 *  @param rotationDegreesRad {number} Rotation amount in the X-Y plane
 *                                     (radians)
 *  @return {Vector3d} The rotated vector
 */
MainSnowmanSnowballFightScene.prototype.adjustVectorByDegreesRadInXyPlane = function(targetVector, rotationDegreesRad) {
	var resultVector = new Vector3d(0.0, 0.0, 1.0);
	
	if (validateVarAgainstType(targetVector, Vector3d) &&
		(typeof(rotationDegreesRad) === "number")) {
		var vectorAsPoint = PrimitivesUtil.GeneratePoint3dFromVector3d(targetVector);
		var rotatedPoint = MathUtility.rotatePointAroundAxisY(vectorAsPoint, rotationDegreesRad)
		resultVector = PrimitivesUtil.GenerateVector3dFromPoint3d(rotatedPoint);
	}
	
	return resultVector;
}

/**
 *  Generates a single sphere to be used as a segement of a snowman,
 *   the center of which will intersect the Y axis, with the specified
 *   offset along the Y-axis
 *  
 *  @param radius {number} Radius of the sphere to be created
 *  @param offsetY {number} Offset along the Y-axis for the sphere to be created
 *  @return {Array} A list of triangles that represent the collection
 *          (Triangle objects)
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanSegmentGeometry = function(radius, offsetY) {
	// Generate a sphere, representing a segment of a snowman, using
	// the specified location and offset along the Y-axis (the sphere will
	// be centered at the intersection of the X and Z axes, offset by
	// the specified Y axis offset).
	var snomanBaseCenterPoint = new Point3d(0.0, (0.0 + offsetY), 0.0);
	var baseSphereGeometryGenerator = new TessellatedSphereGenerator(radius, snomanBaseCenterPoint);
	
	baseSphereGeometryGenerator.setLongitudinalSegmentCount(this.constSnowmanSphereLongSegmentCount);
	baseSphereGeometryGenerator.setLatitudinalSegmentCount(this.constSnowmanSphereLatSegmentCount);
	baseSphereGeometryGenerator.setColor(this.constSnowmanBaseColor);
	
	baseSphereGeometryGenerator.generateGeometry();
	
	return baseSphereGeometryGenerator.getTriangleList();	
}

/**
 *  Generates a translation matrix that represents the position of a snowman
 *   in three-dimensional space
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @return {MathExt.Matrix} A translation matrix that represents the position of the
 *                           snowman
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanTranslationMatrix = function(snowmanInstanceData) {
	var translationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	translationMatrix.setToIdentity();

	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData)) {
		translationMatrix = this.generateTranslationMatrixFromPoint(snowmanInstanceData.snowmanPosition);
	}

	return translationMatrix;
}

/**
 *  Generates the geometry that will ultimately be used to render a
 *   single snowball
 *  
 *  @param radius {number} Radius of the snowball
 *  @return {AggregateWebGlVertexData} Object which contains a collection
 *                                     of vertex data that can be directly
 *                                     buffered by WebGl
 */
MainSnowmanSnowballFightScene.prototype.generateSnowballGeometry = function(radius) {
	// Generate a sphere, representing a snowball, using
	// the specified location and offset along the Y-axis (the sphere will
	// be centered at the intersection of the X and Z axes.).
	var snowballCenterPoint = new Point3d(0.0, 0.0, 0.0);
	var baseSphereGeometryGenerator = new TessellatedSphereGenerator(radius, snowballCenterPoint);
	
	baseSphereGeometryGenerator.setLongitudinalSegmentCount(this.constSnowballSphereLongSegmentCount);
	baseSphereGeometryGenerator.setLatitudinalSegmentCount(this.constSnowballSphereLatSegmentCount);
	baseSphereGeometryGenerator.setColor(this.constSnowballBaseColor);
	
	baseSphereGeometryGenerator.generateGeometry();
	
	return generateAggregateVertexDataFromTriangleList(baseSphereGeometryGenerator.getTriangleList());
}

/**
 *  Initializes the data associated with a single snowball, and generates the WebGL
 *   buffers used to render the snowball
 *  
 *  @param sourceSnowmanInstanceData {SnowmanInstanceData} Snowman state object associated with the
 *                                                         snowman from which the snowball originated
 *  @param targetSnowmanInstanceData {SnowmanInstanceData} Snowman state object associated with the
 *                                                         snowman that is the target of the snowball
 *  @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                    to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.generateSnowballInstanceData = function(sourceSnowmanInstanceData,
	targetSnowmanInstanceData, webGlCanvasContext) {
		
	if (validateVarAgainstType(sourceSnowmanInstanceData, SnowmanInstanceData) &&
		validateVarAgainstType(targetSnowmanInstanceData, SnowmanInstanceData) &&
		validateVar(webGlCanvasContext)) {
			
		var snowballInstanceData = new SnowballInstanceData();
		
		this.initializeSnowballState(snowballInstanceData, sourceSnowmanInstanceData, targetSnowmanInstanceData);
		
		var snowballAggregateVertexData = this.generateSnowballGeometry(this.constSnowballRadius);
		// Copy the vertex data to the snowball instance object.
		var snowballWebGlVertexList = snowballAggregateVertexData.vertices.slice();
		var snowballWebGlVertexColors = snowballAggregateVertexData.vertexColors.slice();
		//var snowballWebGlVertexTexCoords = snowballAggregateVertexData.vertexTextureCoords.slice();
		var snowballWebGlVertexNormals = snowballAggregateVertexData.vertexNormals.slice();		
		
		snowballInstanceData.snowballVertexCount = (snowballWebGlVertexList.length > 0) ?
			(snowballWebGlVertexList.length / this.constVertexSize) : 0;

		// Create the vertex buffer for the snowman.
		snowballInstanceData.snowballWebGlVertexBuffer =
			this.createWebGlBufferFromData(webGlCanvasContext, snowballWebGlVertexList);
		
		// Create the color buffer...
		snowballInstanceData.snowballWebGlColorBuffer =
			this.createWebGlBufferFromData(webGlCanvasContext, snowballWebGlVertexColors);
			
		// Create the normal buffer.
		snowballInstanceData.snowballWebGlNormalBuffer = 
			this.createWebGlBufferFromData(webGlCanvasContext, snowballWebGlVertexNormals);
				
		snowballInstanceData.snowballTransformationMatrixRep = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		snowballInstanceData.snowballTransformationMatrixRep.setToIdentity();
		
		this.snowballInstanceDataCollection.push(snowballInstanceData)
	}
}

/**
 *  Generates a translation matrix that represents the position of a snowball
 *   in three-dimensional space
 *  
 *  @param snowballInstanceData {SnowballInstanceData} Object that maintains data pertaining to a
 *                                                     single snowman instance
 *  @return {MathExt.Matrix} A translation matrix that represents the position of the
 *                           snowman
 */
MainSnowmanSnowballFightScene.prototype.generateSnowballTranslationMatrix = function(snowballInstanceData) {
	var translationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
	this.constTransformationMatrixColumnCount);
	translationMatrix.setToIdentity();

	if (validateVarAgainstType(snowballInstanceData, SnowballInstanceData)) {
		translationMatrix = this.generateTranslationMatrixFromPoint(snowballInstanceData.snowballPosition);
	}

	return translationMatrix;
}

/**
 *  Generates a transformation matrix used to rotate the snowman in accordance
 *   with the snowman direction vector
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @return {MathExt.Matrix} A rotation matrix that represents the rotation required to face the
 *                           snowman in the direction of the direction vector stored within
 *                           the snowman instance data object
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanDirectionTransformationMatrix = function(snowmanInstanceData) {
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
	
	var zAxisUnitVector = new Vector3d(0.0, 0.0, 1.0);
	
	var snowmanDirectionVectorInPlaneXz = new Vector3d(snowmanInstanceData.snowmanDirectionNormalVector.xComponent, 0.0,
		snowmanInstanceData.snowmanDirectionNormalVector.zComponent);
		
	snowmanDirectionVectorInPlaneXz.normalize();
	
	// Determine the angle between the Z-axis and the direction vector in order
	// to generate the appropriate rotation matrix for the snowman (the snowman
	// should face in the direction of movement)...
	var yAxisRotationAngle = Math.acos(zAxisUnitVector.dotProduct(snowmanDirectionVectorInPlaneXz));
	
	// The dot product will produce an angle relative to the Z-axis;
	// however, the proper angular direction with respect to the Z-axis
	// must be determined - use the cross product in order to properly
	// the rotation direction.
	var crossProduct = zAxisUnitVector.crossProduct(snowmanDirectionVectorInPlaneXz);
	if (crossProduct.getYComponent() >= 0) {
		yAxisRotationAngle *= -1.0;
	}
	transformationMatrix = MathUtility.generateRotationMatrix3dAxisY(yAxisRotationAngle);
	
	return transformationMatrix;
}

/**
 *  Generates a time-parametrized transformation used to produce a walking animation
 *   for a snowman
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @return {MathExt.Matrix} A transformation matrix used to produce a frame within a
 *                           time-parameterized animation
 */
MainSnowmanSnowballFightScene.prototype.generateTravelingPoseTransformationMatrix = function(snowmanInstanceData) {
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
	
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData)) {
		var currentRotationRadAngleAxisZ = 0.0;
		
		// The waddle period will be shorter for faster snowmen...
		var waddlePeriodDivisor = (snowmanInstanceData.snowmanMovementMagnitude - this.constSnowmanMinMovementMagnitude) /
			(this.constSnowmanMaxMovementMagnitude + this.constSnowmanMinMovementMagnitude) + 1.0;;			
		var waddlePeriod = this.constSnowmanWaddleBasePeriodMs / waddlePeriodDivisor;
		
		var currentStateTime = this.currentSceneRunningTimeMs - snowmanInstanceData.currentStateInitiationTimeMs;
		var waddlePeriodCompletionFraction = currentStateTime / waddlePeriod;
		
		var currentRotationRadAngleZ = this.constSnowmanWaddleAngleRad * Math.cos(
			waddlePeriodCompletionFraction * 2.0 * Math.PI);
		
		transformationMatrix = MathUtility.generateRotationMatrix3dAxisZ(currentRotationRadAngleZ);
	}

	return transformationMatrix;
}

/**
 *  Generates a time-parametrized transformation used to produce a throwing animation
 *   for a snowman
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @return {MathExt.Matrix} A transformation matrix used to produce a frame within a
 *                           time-parameterized animation
 */
MainSnowmanSnowballFightScene.prototype.generateThrowingPoseTransformationMatrix = function(snowmanInstanceData) {
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
	
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData)) {
		// The snowman rotates in both the X and Y axis (leaning over) when pitching
		// the snowball.
		var currentStateTime = this.currentSceneRunningTimeMs - snowmanInstanceData.currentStateInitiationTimeMs;
		var throwCompletionFraction = currentStateTime / this.constSnowmanThrowingStateDuration;
	
		var poseTravelParameterization = Math.sin(throwCompletionFraction * Math.PI);
	
		var currentRotationRadAngleX = this.constSnowmanThrowLeanAngleRadAxisX * poseTravelParameterization;
		var currentRotationRadAngleZ = this.constSnowmanThrowLeanAngleRadAxisZ * poseTravelParameterization;
	
		var rotationMatrixAxisX = MathUtility.generateRotationMatrix3dAxisX(-currentRotationRadAngleX);
		var rotationMatrixAxisZ = MathUtility.generateRotationMatrix3dAxisZ(currentRotationRadAngleZ);
		transformationMatrix = rotationMatrixAxisX.multiply(rotationMatrixAxisZ);
	}

	return transformationMatrix;
}

/**
 *  Generates a time-parametrized transformation used to produce a hit response animation
 *   for a snowman
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @return {MathExt.Matrix} A transformation matrix used to produce a frame within a
 *                           time-parameterized animation
 */
MainSnowmanSnowballFightScene.prototype.generateHitPoseTransformationMatrix = function(snowmanInstanceData) {
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
	
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData)) {
		// When the snowman is hit by a snowball, the snowman leaps into the
		// air, leaning backwards in surprise
		var currentStateTime = this.currentSceneRunningTimeMs - snowmanInstanceData.currentStateInitiationTimeMs;
		var hitResponseCompletionFraction = currentStateTime / this.constSnowmanHitStateDuration;
		
		var hitStateParameterization = Math.sin(Math.PI * hitResponseCompletionFraction);
		var currentLeapHeight =  hitStateParameterization * this.constSnowmanHitLeapDistance
	
		var currentLeanAngle = hitStateParameterization * this.constSnowmanHitLeanAngleRad;
		
		var translationMatrix = MathUtility.generateTranslationMatrix3d(0.0, currentLeapHeight, 0.0);
		var rotationMatrix = MathUtility.generateRotationMatrix3dAxisX(currentLeanAngle);
		
		transformationMatrix = translationMatrix.multiply(rotationMatrix);
	}
	
	return transformationMatrix;
}

/**
 *  Generates a time-parametrized transformation used to produce a "stunned" state animation
 *   for a snowman
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @return {MathExt.Matrix} A transformation matrix used to produce a frame within a
 *                           time-parameterized animation
 */
MainSnowmanSnowballFightScene.prototype.generateStunnedPoseTransformationMatrix = function(snowmanInstanceData) {
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
	
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData)) {		
		var currentStateTime = this.currentSceneRunningTimeMs - snowmanInstanceData.currentStateInitiationTimeMs;
		var stunnedPhaseCompletionFraction = currentStateTime / this.constSnowmanStunnedStateDuration;
				
		var currentAxisRotationY = stunnedPhaseCompletionFraction * 2.0 * Math.PI *
			this.constSnowmanStunnedOscillationsXz;
			
		// Stunned "wobble" decreases as time elapses within the stunned phase.
		var currentAxisRotationZ = this.constSnowmanStunnedLeanAngleRad *
			Math.sin(stunnedPhaseCompletionFraction * 2.0 * Math.PI *
			this.constSnowmanStunnedLeanOscillationsY) * (1.0 - stunnedPhaseCompletionFraction);

		var rotationMatrixAxisY = MathUtility.generateRotationMatrix3dAxisY(currentAxisRotationY);
		var rotationMatrixAxisZ = MathUtility.generateRotationMatrix3dAxisZ(currentAxisRotationZ);
		
		transformationMatrix = rotationMatrixAxisY.multiply(rotationMatrixAxisZ);
	}
	
	return transformationMatrix;
}

/**
 *  Generates a time-parametrized transformation for the snowman, based upon the immediate
 *   snowman state
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @return {MathExt.Matrix} A transformation matrix used to produce a frame within a
 *                           time-parameterized animation
 */
MainSnowmanSnowballFightScene.prototype.generateSnowmanPoseTransformationMatrix = function(snowmanInstanceData) {
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
	
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData)) {
		switch (snowmanInstanceData.snowmanState) {
			case this.constSnowmanStateTraveling:
				transformationMatrix = this.generateTravelingPoseTransformationMatrix(snowmanInstanceData);
				break;
			case this.constSnowmanStateThrowing:
				transformationMatrix = this.generateThrowingPoseTransformationMatrix(snowmanInstanceData);
				break;
			case this.constSnowmanStateHit:
				transformationMatrix = this.generateHitPoseTransformationMatrix(snowmanInstanceData);
				break;
			case this.constSnowmanStateStunned:
				transformationMatrix = this.generateStunnedPoseTransformationMatrix(snowmanInstanceData);
				break;
			default:
				break;
		}
	}
	
	return transformationMatrix;
}

/**
 *  Updates the cached, overall transformation matrix that will be used to properly rotate/position
 *   the snowman for rendering
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 */
MainSnowmanSnowballFightScene.prototype.updateSnowmanModelTransformationMatrix = function(snowmanInstanceData) {
	// Offset from the center of the world.
	var translationMatrix = this.generateSnowmanTranslationMatrix(snowmanInstanceData);
	
	// Rotation about the Y-axis, in order to position the snowman in the
	// apparent direction of travel.
	var directionTransformationMatrix = this.generateSnowmanDirectionTransformationMatrix(snowmanInstanceData);
	
	// Snowman pose, which is dependent upon the immediate snowman state
	var poseTransformationMatrix = this.generateSnowmanPoseTransformationMatrix(snowmanInstanceData);

	var positionedSnowmanMatrix = translationMatrix.multiply(directionTransformationMatrix);
	var finalModelTransformationMatrix = positionedSnowmanMatrix.multiply(poseTransformationMatrix);
	
	snowmanInstanceData.snowmanTransformationMatrixRep = finalModelTransformationMatrix;
}

/**
 *  Updates the immediate [time-parameterized] state of the snowman
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 */
MainSnowmanSnowballFightScene.prototype.updateSnowmanState = function(snowmanInstanceData, timeQuantum) {
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData)) {
		switch (snowmanInstanceData.snowmanState) {
			case this.constSnowmanStateTraveling:
				this.updateSnowmanPosition(snowmanInstanceData, timeQuantum);
				this.conditionallyTransitionToThrowingState(snowmanInstanceData);
				break;
			case this.constSnowmanStateThrowing:
				this.updateSnowmanThrowingState(snowmanInstanceData, timeQuantum);
				break;
			case this.constSnowmanStateHit:
				this.updateHitState(snowmanInstanceData, timeQuantum);
				break;
			case this.constSnowmanStateStunned:
				this.updateStunnedState(snowmanInstanceData, timeQuantum);
				break;
			default:
				break;
		}	
	}
}

/**
 *  Updates the [time-parameterized] state information for all snowmen
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 */
MainSnowmanSnowballFightScene.prototype.updateStateInformationForSnowmanCollection = function(timeQuantum) {
	if (validateVar(this.snowmanInstanceDataCollection)) {
		for (var instanceDataLoop = 0; instanceDataLoop < this.snowmanInstanceDataCollection.length; instanceDataLoop++) {
			this.updateSnowmanState(this.snowmanInstanceDataCollection[instanceDataLoop], timeQuantum);
		}
		
		this.processAllSnowballCollisions();
		this.updateStoredSnowmanHighHitCount();
	}
}

/**
 *  Caches the highest hit count (number of times a particular snowman has hit another
 *   snowman with a snowball) amongst all snowmen
 */
MainSnowmanSnowballFightScene.prototype.updateStoredSnowmanHighHitCount = function() {
	if (validateVar(this.snowmanInstanceDataCollection)) {
		for (var instanceDataLoop = 0; instanceDataLoop < this.snowmanInstanceDataCollection.length; instanceDataLoop++) {
			if (this.snowmanInstanceDataCollection[instanceDataLoop].snowmanTargetStrikeCount > this.currentSnowmanHighHitCount) {				
				this.currentSnowmanHighHitCount = this.snowmanInstanceDataCollection[instanceDataLoop].snowmanTargetStrikeCount;
			}
		}
	}	
}

/**
 *  Resets the snowman activity state information (e.g. traveling, throwing) associated
 *   with a single snowman instance
 *   
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 */
MainSnowmanSnowballFightScene.prototype.resetSnowmanState = function(snowmanInstanceData) {
	snowmanInstanceData.snowmanState = this.constSnowmanStateTraveling;
	snowmanInstanceData.currentStateInitiationTimeMs = this.totalElapsedSceneTimeMs;
	snowmanInstanceData.snowballThrownDuringThrowState = false;
	snowmanInstanceData.currentTargetSnowman = null;
}

/**
 *  Determines if a snowman is in the target field-of-view for another snowman (eligible
 *   to be a target)
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param potentialTargetSnowmanInstanceData {SnowmanInstanceData} Object that maintains data
 *                                                                  pertaining to a snowman that
 *                                                                  is a potential target
 *  @return {boolean} True if the snowman is in the target field of view
 */
MainSnowmanSnowballFightScene.prototype.isSnowmanInTargetAcquisitionFov = function(sourceSnowmanInstanceData,
	potentialTargetSnowmanInstanceData) {
		
	var snowmanIsInFov = false;
	
	if (validateVarAgainstType(sourceSnowmanInstanceData, SnowmanInstanceData) &&
		validateVarAgainstType(potentialTargetSnowmanInstanceData, SnowmanInstanceData)) {

		var targetPositionAsVector = PrimitivesUtil.GenerateVector3dFromPoint3d(
			potentialTargetSnowmanInstanceData.snowmanPosition);;
		
		var sourceToTargetVector = targetPositionAsVector.subtractVector(PrimitivesUtil.GenerateVector3dFromPoint3d(
			sourceSnowmanInstanceData.snowmanPosition));
			
		var sourceToTargetAngleRad = Math.acos(sourceSnowmanInstanceData.snowmanDirectionNormalVector.dotProduct(sourceToTargetVector) /
			(sourceSnowmanInstanceData.snowmanDirectionNormalVector.magnitude() * sourceToTargetVector.magnitude()));

		snowmanIsInFov = Math.abs(sourceToTargetAngleRad) <= sourceSnowmanInstanceData.snowmanTargetAcquisitionFovDegRad;
	}
		
	return snowmanIsInFov;
}

/**
 *  Finds the snowman that is eligible to be a target for a snowball
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @return {SnowmanInstanceData} Snowman instance if a target has been found, null otherwise
 */
MainSnowmanSnowballFightScene.prototype.findPreferredTargetSnowmanForSnowball = function(snowmanInstanceData) {
	var foundTargetInstance = null;
	
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData)) {
		// Find the most appropriate target. This target is the nearest target within the
		// field-of-view of the snowman.
		var currentNearestDistance = 0.0;
		for (var instanceDataLoop = 0; instanceDataLoop < this.snowmanInstanceDataCollection.length; instanceDataLoop++) {
			if (this.isSnowmanInTargetAcquisitionFov(snowmanInstanceData,
				this.snowmanInstanceDataCollection[instanceDataLoop]) &&
				(snowmanInstanceData != this.snowmanInstanceDataCollection[instanceDataLoop])) {
			
				var distanceBetweenSnowmen = snowmanInstanceData.snowmanPosition.distanceFrom(
					this.snowmanInstanceDataCollection[instanceDataLoop].snowmanPosition);
				if ((distanceBetweenSnowmen < currentNearestDistance) || (foundTargetInstance === null)) {
					foundTargetInstance = this.snowmanInstanceDataCollection[instanceDataLoop];
					currentNearestDistance = distanceBetweenSnowmen;
				}
			}
		}
	}
	
	return foundTargetInstance;
}

/**
 *  Transitions a snowman to a throwing state if an eligible target can be located
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 */
MainSnowmanSnowballFightScene.prototype.conditionallyTransitionToThrowingState = function(snowmanInstanceData) {
	// Ensure that snowballs are only thrown at the pre-determined rate
	// for the particular snowman.
	if ((this.totalElapsedSceneTimeMs - snowmanInstanceData.lastSnowballThrowTime) >=
		snowmanInstanceData.snowmanMinSnowballThrowIntervalMs) {
			
		// A snowball is not immediately launched during the throwing state -
		// it is possible that the target snowman might move out of the
		// target evaluation range during the initial stages of the throwing
		// state - store the target snowman once the target has been
		// determined.
		var targetSnowman = this.findPreferredTargetSnowmanForSnowball(snowmanInstanceData);
		if (targetSnowman != null) {				
			this.resetSnowmanState(snowmanInstanceData);
			
			snowmanInstanceData.currentStateInitiationTimeMs = this.totalElapsedSceneTimeMs;
			snowmanInstanceData.currentTargetSnowman = targetSnowman;
			snowmanInstanceData.snowmanState = this.constSnowmanStateThrowing;
			snowmanInstanceData.lastSnowballThrowTime = this.totalElapsedSceneTimeMs;
		}
	}
}

/**
 *  Updates the state of a snowman that is throwing a snowball
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 */
MainSnowmanSnowballFightScene.prototype.updateSnowmanThrowingState = function(snowmanInstanceData, timeQuantum) {
	var snowballThrowStateTimeMs = (this.totalElapsedSceneTimeMs - snowmanInstanceData.lastSnowballThrowTime);
	if (snowballThrowStateTimeMs <= this.constSnowmanThrowingStateDuration) {
		var snowballThrowCompletionFraction = snowballThrowStateTimeMs / this.constSnowmanThrowingStateDuration;
	
		// The snowball is not immediately thrown during the throw state
		// (provides a more logical association with the throwing animation
		// state and the actual launch of the snowball).
		if ((snowballThrowCompletionFraction >= this.constThrowStateProjectileLaunchStartFraction) &&
			!snowmanInstanceData.snowballThrownDuringThrowState) {
				
			this.generateSnowballForSnowman(snowmanInstanceData, timeQuantum);
			snowmanInstanceData.snowballThrownDuringThrowState = true;
		}
	}
	else {
		this.resetSnowmanState(snowmanInstanceData);
	}
}

/**
 *  Updates the state of a snowman that has recently been hit by a snowball
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 */
MainSnowmanSnowballFightScene.prototype.updateHitState = function(snowmanInstanceData, timeQuantum) {
	var hitStateTimeMs = this.totalElapsedSceneTimeMs - snowmanInstanceData.currentStateInitiationTimeMs;
	if (hitStateTimeMs <= this.constSnowmanHitStateDuration) {
		
	}
	else {
		// The snowman will be stunned for a period of time, after being
		// hit by a snowball.
		snowmanInstanceData.snowmanState = this.constSnowmanStateStunned;
		snowmanInstanceData.currentStateInitiationTimeMs = this.totalElapsedSceneTimeMs;
	}
}

/**
 *  Updates the state of a snowman that has recently been stunned by a snowball hit
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 */
MainSnowmanSnowballFightScene.prototype.updateStunnedState = function(snowmanInstanceData, timeQuantum) {
	var stunnedStateTimeMs = this.totalElapsedSceneTimeMs - snowmanInstanceData.currentStateInitiationTimeMs;
	if (stunnedStateTimeMs <= this.constSnowmanStunnedStateDuration) {
		
	}
	else {
		this.resetSnowmanState(snowmanInstanceData);
	}
}

/**
 *  Generates a snowball to be associated with a snowman that has recently entered the throwing
 *   state
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 */
MainSnowmanSnowballFightScene.prototype.generateSnowballForSnowman = function(snowmanInstanceData, timeQuantum) {
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData)) {			
		if ((snowmanInstanceData.currentTargetSnowman != null) &&
			(snowmanInstanceData.currentTargetSnowman != snowmanInstanceData)) {
				
			var webGlCanvasContext = globalResources.getMainCanvasContext();
		
			this.generateSnowballInstanceData(snowmanInstanceData, snowmanInstanceData.currentTargetSnowman, webGlCanvasContext);
		}
	}
}

/**
 *  Updates the stored position/velocity information of a snowman, based upon the
 *   snowman direction of travel, position and velocity
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 */
MainSnowmanSnowballFightScene.prototype.updateSnowmanPosition = function(snowmanInstanceData, timeQuantum) {
	var newSnowmanPosition = this.computeNewSnowmanPosition(snowmanInstanceData, timeQuantum);
	
	while (!this.isPositionValidByConstraints(snowmanInstanceData, newSnowmanPosition)) {		
		var reversedDirectionVector =
			snowmanInstanceData.snowmanDirectionNormalVector.multiplyByScalar(-1.0);
			
		// Add a random angle change to the reversed vector in order to ensure
		// that the snowman does not cycle through the same exact path.
		var rotationDegrees = this.getRandomValueInRange(-this.constReversedVectorRandomAdjustmentMaxDegRad,
			this.constReversedVectorRandomAdjustmentMaxDegRad);
			
		snowmanInstanceData.snowmanDirectionNormalVector =
			this.adjustVectorByDegreesRadInXyPlane(reversedDirectionVector, rotationDegrees);

		// Redundant...		
		reversedDirectionVector.normalize();
		
		newSnowmanPosition = this.computeNewSnowmanPosition(snowmanInstanceData, timeQuantum);
	}

	if (this.isPositionValidByConstraints(snowmanInstanceData, newSnowmanPosition)) {
		snowmanInstanceData.snowmanPosition	= newSnowmanPosition;
	}
}

/**
 *  Generates the position information for a snowman
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 *  @return {Point3d} A new snowman position in three-dimensional space
 */
MainSnowmanSnowballFightScene.prototype.computeNewSnowmanPosition = function(snowmanInstanceData, timeQuantum) {
	var movementVector = snowmanInstanceData.snowmanDirectionNormalVector.multiplyByScalar(
		snowmanInstanceData.snowmanMovementMagnitude * timeQuantum);
	
	var snowmanPositionAsVector = PrimitivesUtil.GenerateVector3dFromPoint3d(snowmanInstanceData.snowmanPosition);
	
	var worldCenterPointAsVector = PrimitivesUtil.GenerateVector3dFromPoint3d(this.constWorldCenterPoint);

	snowmanPositionAsVector = snowmanPositionAsVector.subtractVector(worldCenterPointAsVector);
	snowmanPositionAsVector = snowmanPositionAsVector.addVector(movementVector);

	return PrimitivesUtil.GeneratePoint3dFromVector3d(snowmanPositionAsVector);
}

/**
 *  Determines if a proposed position for the snowman is valid
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param proposedPosition {point3d} Proposed position for the snowman
 *  @return True if the position is valid
 */
MainSnowmanSnowballFightScene.prototype.isPositionValidByConstraints = function(snowmanInstanceData, proposedPosition) {
	var positionIsValid = true;
	
	// Ensure that the snowman remains within the designated world
	// boundaries...
	if (proposedPosition.distanceFrom(this.constWorldCenterPoint) > this.constWorldBoundaryDistanceFromCenter) {
		positionIsValid = false;
	}
	
	return positionIsValid;
}

/**
 *  Determines if a collision has immediately occurred between a snowball and a snowman
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to a
 *                                                   single snowman instance
 *  @param snowballInstanceData {SnowballInstanceData} Object that maintains data pertaining to a
 *                                                     single snowball instance
 *  @return True if a collision has occurred between a snowball and a snowman
 */
MainSnowmanSnowballFightScene.prototype.isSnowballInCollisionStateWithSnowman = function(snowmanInstanceData, snowballInstanceData) {
	var isInCollsionState = false;
	
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData) &&
		validateVarAgainstType(snowballInstanceData, SnowballInstanceData)) {
			
		// First, determine if the snowball is high/low enough to make contact
		// with the snowman in the horizontal plane.
		var snowballHeightIsValidForCollision =
			((snowballInstanceData.snowballPosition.getY() + this.constSnowballRadius) >= snowmanInstanceData.snowmanPosition.getY()) &&
			(snowballInstanceData.snowballPosition.getY() - this.constSnowballRadius) <=
			(snowmanInstanceData.snowmanPosition.getY() + this.computeTotalSnowmanHeightForSegmentCount(this.constSnowmanSegments));
			
		if (snowballHeightIsValidForCollision) {
			// Use the point-line distance formula in order to determine
			// the distance from the center axis of the snowman. Treat the
			// snowman boundary as a cylinder, with a diameter equivalent
			// to the base snowman sphere diameter. The point-to-line
			// distance was source from:
			// Wolfram MathWorld - Point-Line Distance 3-Dimensional
			// (http://mathworld.wolfram.com/Point-LineDistance3-Dimensional.html)
			var snowmanCenterLineVector = new Vector3d(0.0,
				this.computeTotalSnowmanHeightForSegmentCount(this.constSnowmanSegments), 0.0);
			
			var snowmanBottomPointAsVector = PrimitivesUtil.GenerateVector3dFromPoint3d(snowmanInstanceData.snowmanPosition);
			var snowballPositionAsVector = PrimitivesUtil.GenerateVector3dFromPoint3d(snowballInstanceData.snowballPosition);
		
			var bottomToSnowballVector = snowballPositionAsVector.subtractVector(snowmanBottomPointAsVector);
			var topToSnowballVector = snowballPositionAsVector.subtractVector(snowmanBottomPointAsVector.addVector(
				snowmanCenterLineVector));
		
			snowballDistance = bottomToSnowballVector.crossProduct(topToSnowballVector).magnitude() /
				snowmanCenterLineVector.magnitude();
		
			isInCollsionState = snowballDistance <= (this.constSnowballRadius + this.constBaseSnowmanSphereRadius);
		}	
	}
	
	return isInCollsionState;
}

/**
 *  Determines if a least one snowball that has been invalidated by a collision
 *   event exists within the collection of snowballs 
 *
 *  @return True if a snowball exists in the collection of snowballs that has
 *          immediately been invalidated by a collision event
 */
MainSnowmanSnowballFightScene.prototype.areInvalidatedSnowballsPresentInCollection = function() {
	var invalidatedSnowballsExistInCollection = false;
	
	if (validateVar(this.snowballInstanceDataCollection)) {
		var instanceLoop = 0;
		while (!invalidatedSnowballsExistInCollection && (instanceLoop < this.snowballInstanceDataCollection.length)) {
			invalidatedSnowballsExistInCollection = this.snowballInstanceDataCollection[instanceLoop].invalidatedByCollision;
			instanceLoop++;
		}
	}
	
	return invalidatedSnowballsExistInCollection;
}

/**
 *  Removes any snowballs from the snowball collection that have been invalidated by a
 *   collision event
 */
MainSnowmanSnowballFightScene.prototype.removeInvalidatedSnowballsFromCollection = function() {
	if (validateVar(this.snowballInstanceDataCollection)) {
		if (this.areInvalidatedSnowballsPresentInCollection()) {			
			var webGlCanvasContext = globalResources.getMainCanvasContext();
			
			// Move the snowballs that have not been invalidated to a new array,
			// instead of attempting to selectively delete elements within the
			// old array.
			var newSnowballInstanceCollection = new Array();
			
			for (var instanceLoop = 0; instanceLoop < this.snowballInstanceDataCollection.length; instanceLoop++) {
				if (!this.snowballInstanceDataCollection[instanceLoop].invalidatedByCollision) {
					newSnowballInstanceCollection.push(this.snowballInstanceDataCollection[instanceLoop]);
				}
				else {
					webGlCanvasContext.deleteBuffer(this.snowballInstanceDataCollection[instanceLoop].snowballWebGlVertexBuffer);
				}
			}
			
			this.snowballInstanceDataCollection = newSnowballInstanceCollection;
		}
	}	
}

/**
 *  Invoked when a collision has immediately occurred between a snowman and
 *   a snowball - updates any data required to record the event
 *  
 *  @param snowmanInstanceData {SnowmanInstanceData} Object that maintains data pertaining to
 *                                                   the snowman that has been hit
 *  @param snowballInstanceData {SnowballInstanceData} Object that maintains data pertaining to
 *                                                     the striking snowball
 */
MainSnowmanSnowballFightScene.prototype.handleSnowmanSnowballCollision = function(snowmanInstanceData, snowballInstanceData) {
	if (validateVarAgainstType(snowmanInstanceData, SnowmanInstanceData) &&
		validateVarAgainstType(snowballInstanceData, SnowballInstanceData)) {

		if (validateVarAgainstType(snowballInstanceData.sourceSnowmanInstance, SnowmanInstanceData)) {
			snowballInstanceData.sourceSnowmanInstance.snowmanTargetStrikeCount++;
			snowmanInstanceData.snowmanStrikeReceptionCount++;
			
			this.resetSnowmanState(snowmanInstanceData);
			snowmanInstanceData.snowmanState = this.constSnowmanStateHit;
		}
		
		snowballInstanceData.invalidatedByCollision = true;
	}
}

/**
 *  Determines if a collsion has immediately occurred between the specified
 *   snowman and any of the snowballs within the collection of snowballs
 *  
 *  @param snowmanInstanceData {SnowballInstanceData} Data associated with a single snowball instance
 */
MainSnowmanSnowballFightScene.prototype.processSingleSnowballCollision = function(snowmanInstanceData) {
	if (validateVar(this.snowballInstanceDataCollection)) {
		for (var instanceLoop = 0; instanceLoop < this.snowballInstanceDataCollection.length; instanceLoop++) {
			var snowballIsAssociatedWithSnowman = this.snowballInstanceDataCollection[instanceLoop].sourceSnowmanInstance ===
				snowmanInstanceData;
			if (!snowballIsAssociatedWithSnowman &&
				this.isSnowballInCollisionStateWithSnowman(snowmanInstanceData,
				this.snowballInstanceDataCollection[instanceLoop])) {
			
				// The snowball has hit a snowman.
				this.handleSnowmanSnowballCollision(snowmanInstanceData, this.snowballInstanceDataCollection[instanceLoop]);
			}
			else if (this.snowballInstanceDataCollection[instanceLoop].snowballPosition.getY() <= 0) {
				// The snowball has made contact with the ground plane...
				this.snowballInstanceDataCollection[instanceLoop].invalidatedByCollision = true;
			}
		}
	}
}

/**
 *  Computes the immediate collisions between all snowballs and all snowmen
 */
MainSnowmanSnowballFightScene.prototype.processAllSnowballCollisions = function() {
	if (validateVar(this.snowmanInstanceDataCollection)) {
		for (var instanceDataLoop = 0; instanceDataLoop < this.snowmanInstanceDataCollection.length; instanceDataLoop++) {
			if (!this.snowmanInstanceDataCollection[instanceDataLoop].invalidatedByCollision) {
				this.processSingleSnowballCollision(this.snowmanInstanceDataCollection[instanceDataLoop]);
			}
		}
	}
	
	this.removeInvalidatedSnowballsFromCollection();
}

/**
 *  Updates the snowball transformation matrix cached by the snowball data object
 *  
 *  @param snowballInstanceData {SnowballInstanceData} Data associated with a single snowball instance
 */
MainSnowmanSnowballFightScene.prototype.updateSnowballModelTransformationMatrix = function(snowballInstanceData) {
	if (validateVarAgainstType(snowballInstanceData, SnowballInstanceData)) {
		// Offset from the center of the world.
		var translationMatrix = this.generateSnowballTranslationMatrix(snowballInstanceData);
		
		snowballInstanceData.snowballTransformationMatrixRep = translationMatrix;
	}
}

/**
 *  Updates the immediate state of the snowball (position, etc.)
 *  
 *  @param snowballInstanceData {SnowballInstanceData} Data associated with a single snowball instance
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 */
MainSnowmanSnowballFightScene.prototype.updateSnowballState = function(snowballInstanceData, timeQuantum) {
	if (validateVarAgainstType(snowballInstanceData, SnowballInstanceData)) {
		
		var snowballPositionAsVector = PrimitivesUtil.GenerateVector3dFromPoint3d(snowballInstanceData.snowballPosition);
		snowballPositionAsVector = snowballPositionAsVector.addVector(snowballInstanceData.snowballVelocityVector.multiplyByScalar(timeQuantum));
		snowballInstanceData.snowballPosition = PrimitivesUtil.GeneratePoint3dFromVector3d(snowballPositionAsVector);
		
		// Apply the effect of gravity to the velocity vector.
		var gravityVector = new Vector3d(0.0, -this.gravitationalAccelerationFtPerMsSq, 0.0);
		gravityVector = gravityVector.multiplyByScalar(timeQuantum);
		
		snowballInstanceData.snowballVelocityVector = snowballInstanceData.snowballVelocityVector.addVector(
			gravityVector);
	}
}

/**
 *  Updates the state information associated with all snowballs
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 */
MainSnowmanSnowballFightScene.prototype.updateStateInformationForSnowballCollection = function(timeQuantum) {
	if (validateVar(this.snowballInstanceDataCollection)) {
		for (var instanceDataLoop = 0; instanceDataLoop < this.snowballInstanceDataCollection.length; instanceDataLoop++) {
			this.updateSnowballState(this.snowballInstanceDataCollection[instanceDataLoop], timeQuantum);
		}		
	}
}

/**
 *  Returns a normalized vector that indicates the focus direction of the camera
 *  
 *  @return {Vector3d} A vector normalized that indicates the focus direction of the camera
 */
MainSnowmanSnowballFightScene.prototype.getNormalizedCameraLookAtVector = function() {
	var cameraLookAtVector = PrimitivesUtil.GenerateVector3dFromPoint3d(this.cameraLookAtPoint);
	cameraLookAtVector = cameraLookAtVector.subtractVector(
		PrimitivesUtil.GenerateVector3dFromPoint3d(this.cameraPosition));
	cameraLookAtVector.normalize();
	
	return cameraLookAtVector;
}

/**
 *  Returns the camera rotataion in the X-Z plane
 *  
 *  @return {number} The camera rotation in the X-Z plane (radians)
 */
MainSnowmanSnowballFightScene.prototype.getCameraRotationInXzPlane = function() {
	var cameraLookAtVector = this.getNormalizedCameraLookAtVector();
	var cameraLookAtVectorXz2d = new Vector(cameraLookAtVector.getXComponent(), cameraLookAtVector.getZComponent());	
	var cameraRotationXz = cameraLookAtVectorXz2d.dotProduct(new Vector(0.0, -1.0)) / cameraLookAtVectorXz2d.magnitude();
		
	return cameraRotationXz;
}

/**
 *  Returns the camera rotataion in the X-Y plane
 *  
 *  @return {number} The camera rotation in the X-Y plane (radians)
 */
MainSnowmanSnowballFightScene.prototype.getCameraRotationInXyPlane = function() {
	var cameraLookAtVector = this.getNormalizedCameraLookAtVector();
	var cameraLookAtVectorYz2d = new Vector(cameraLookAtVector.getYComponent(), cameraLookAtVector.getZComponent());
	var cameraRotationYz = cameraLookAtVectorYz2d.dotProduct(new Vector(1.0, 0.0)) / cameraLookAtVectorYz2d.magnitude();
	
	return cameraRotationYz;
}

/**
 *  Generates view matrix required to position geometry situated in three-dimensional space,
 *   based on the position of the camera
 *  
 *  @return {MathExt.Matrix} A view matrix used to position objects for rendering
 */
MainSnowmanSnowballFightScene.prototype.generateCameraViewMatrix = function () {
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
	
	var yAxisUnitVector = new Vector3d(0.0, 1.0, 0.0);
	
	var cameraLookAtVector = this.getNormalizedCameraLookAtVector();
	var cameraRightVector = cameraLookAtVector.crossProduct(yAxisUnitVector);
	var cameraUpVector = cameraRightVector.crossProduct(cameraLookAtVector);
	
	if (validateVarAgainstType(this.cameraLookAtVector, Vector3d), validateVarAgainstType(this.cameraPosition, Point3d)) {
		transformationMatrix.setElementValues(
			[
				new Float32Array([cameraRightVector.getXComponent(), 	cameraRightVector.getYComponent(), 	cameraRightVector.getZComponent(),		0.0]),
				new Float32Array([cameraUpVector.getXComponent(),		cameraUpVector.getYComponent(), 	cameraUpVector.getZComponent(),			0.0]),
				new Float32Array([cameraLookAtVector.getXComponent(),	cameraLookAtVector.getYComponent(), cameraLookAtVector.getZComponent(),		0.0]),
				new Float32Array([-this.cameraPosition.getX(), 			-this.cameraPosition.getY(), 		-this.cameraPosition.getZ(),			1.0])
			]
		);
	}
	
	return transformationMatrix;
}

/**
 *  Updates the position of the camera, based upon the camera traveling pattern
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 */
MainSnowmanSnowballFightScene.prototype.updateCameraPosition = function(timeQuantum) {
	this.cameraLookAtPoint = new Point3d(0.0, 0.0, 0.0);
	var cameraAngularPositionAlongPath = this.constCameraOrbitDegreesRadPerMs * this.currentSceneRunningTimeMs;
	var referenceLocation = new Point3d(0, this.constOrbitCameraPathElevation, this.constOrbitCameraPathRadius);
	this.cameraPosition = MathUtility.rotatePointAroundAxisY(referenceLocation, cameraAngularPositionAlongPath);
}

/**
 *  Renders geometry using WebGL
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 *  @param targetCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                     to a WebGL display buffer
 *  @param transformationMatrix {MathExt.Matrix} Transformation matrix to be applied during rendering
 *  @param objectRenderWebGlData {ObjectRenderWebGlData} Object that encapsulates data to be
 *                                                       rendered
 */
MainSnowmanSnowballFightScene.prototype.renderGeometry = function(timeQuantum, targetCanvasContext,
	transformationMatrix, objectRenderWebGlData) {
	
	if (validateVarAgainstType(objectRenderWebGlData, ObjectRenderWebGlData)) {
		targetCanvasContext.useProgram(objectRenderWebGlData.webGlShaderProgram);
		// Bind the vertex buffer...
		targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, objectRenderWebGlData.webGlVertexBuffer);
		var vertexPositionAttribute = targetCanvasContext.getAttribLocation(objectRenderWebGlData.webGlShaderProgram,
			"aVertexPosition");
		targetCanvasContext.vertexAttribPointer(vertexPositionAttribute, this.constVertexSize,
			targetCanvasContext.FLOAT, false, 0, 0);
		targetCanvasContext.enableVertexAttribArray(vertexPositionAttribute);
		
		// Bind the vertex color buffer...
		targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, objectRenderWebGlData.webGlVertexColorBuffer);
		var vertexColorAttribute = targetCanvasContext.getAttribLocation(objectRenderWebGlData.webGlShaderProgram, "aVertexColor");
		targetCanvasContext.vertexAttribPointer(vertexColorAttribute, this.constVertexColorSize,
			targetCanvasContext.FLOAT, false, 0, 0);
		targetCanvasContext.enableVertexAttribArray(vertexColorAttribute);
		
		// Bind the vertex normal buffer...
		targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, objectRenderWebGlData.webGlVertexNormalBuffer);
		var vertexNormalAttribute = targetCanvasContext.getAttribLocation(objectRenderWebGlData.webGlShaderProgram, "aVertexNormal");
		targetCanvasContext.vertexAttribPointer(vertexNormalAttribute, this.constVectorSize,
			targetCanvasContext.FLOAT, false, 0, 0);
		targetCanvasContext.enableVertexAttribArray(vertexNormalAttribute);

		// Set the active texture coordinate buffer, if applicable...
		if (objectRenderWebGlData.webGlTexCoordBuffer !== null) {
			targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER,
				objectRenderWebGlData.webGlTexCoordBuffer);
			var textureCoordinateAttribute = targetCanvasContext.getAttribLocation(
				objectRenderWebGlData.webGlShaderProgram, "aTextureCoord");
			targetCanvasContext.vertexAttribPointer(textureCoordinateAttribute, this.constTextureCoordinateSize,
				targetCanvasContext.FLOAT, false, 0, 0);
			targetCanvasContext.enableVertexAttribArray(textureCoordinateAttribute);
		}
		
		// Ensure that ambient lighting data is accessible by the shader
		// program (affects all rendered objects).
		var ambientLightUniform = targetCanvasContext.getUniformLocation(objectRenderWebGlData.webGlShaderProgram, "uniform_ambientLightVector");
		targetCanvasContext.uniform3fv(ambientLightUniform, this.sceneAmbientLight.constAmbientLightVector);
		
		var lookAtVector = this.getNormalizedCameraLookAtVector();
		var viewVectorUniform = targetCanvasContext.getUniformLocation(objectRenderWebGlData.webGlShaderProgram, "uniform_viewingVector");
		targetCanvasContext.uniform3fv(viewVectorUniform,
			new Float32Array([lookAtVector.getXComponent(), lookAtVector.getYComponent(), lookAtVector.getZComponent()]));
		
		var cameraMatrix = this.generateCameraViewMatrix();
		var finalTransformationMatrix = cameraMatrix.multiply(transformationMatrix);
		var transformationMatrixAsLinearArray = convertMatrixToMatrixLinearArrayRep(finalTransformationMatrix);
		
		targetCanvasContext.uniformMatrix4fv(targetCanvasContext.getUniformLocation(objectRenderWebGlData.webGlShaderProgram,
			"uniform_transformationMatrix"), false, transformationMatrixAsLinearArray);

		// ...Render the quad containing the scene texture.
		targetCanvasContext.drawArrays(targetCanvasContext.TRIANGLES, 0, objectRenderWebGlData.vertexCount);
	}
}

/**
 *  Renders the ground plane geometry
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 *  @param targetCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                     to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.renderGroundPlane = function(timeQuantum, targetCanvasContext) {
	var groundPlaneShader = globalResources.getStandardShaderGouraud();
	if (groundPlaneShader !== null) {
		// The ground plane does not undergo any transformations...
		var identityMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		identityMatrix.setToIdentity();
		
		var objectRenderWebGlData = new ObjectRenderWebGlData(groundPlaneShader,
			this.sceneGroundPlaneData.sceneGroundPlaneWebGlVertexBuffer,
			this.sceneGroundPlaneData.sceneGroundPlaneWebGlColorBuffer, null,
			this.sceneGroundPlaneData.sceneGroundPlaneWebGlNormalBuffer,
			this.sceneGroundPlaneData.sceneGroundPlaneVertexList.length / this.constVertexSize) 
		this.renderGeometry(timeQuantum, targetCanvasContext, identityMatrix, objectRenderWebGlData);
	}
}

/**
 *  Renders body geometry for a single snowman
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 *  @param targetCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                     to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.renderSnowmanBody = function(timeQuantum, targetCanvasContext,
	snowmanInstanceData) {

	var shaderSnowRough = globalResources.getShaderSnowRough();
	if (shaderSnowRough !== null) {	
		var snowmanBodyRenderWebGlData = new ObjectRenderWebGlData(shaderSnowRough,
			snowmanInstanceData.snowmanWebGlVertexBuffer, snowmanInstanceData.snowmanWebGlColorBuffer,
			snowmanInstanceData.snowmanWebGlTexCoordBuffer, snowmanInstanceData.snowmanWebGlNormalBuffer,
			snowmanInstanceData.snowmanVertexCount);
		this.renderGeometry(timeQuantum, targetCanvasContext, snowmanInstanceData.snowmanTransformationMatrixRep,
			snowmanBodyRenderWebGlData);
	}
}

/**
 *  Renders arm geometry for a single snowman
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 *  @param targetCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                     to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.renderSnowmanArms = function(timeQuantum, targetCanvasContext,
	snowmanInstanceData) {

	var armShader = globalResources.getStandardShaderGouraud();
	if (armShader !== null) {
				
		var rightArmTransformationMatrix = snowmanInstanceData.snowmanTransformationMatrixRep.multiply(
			snowmanInstanceData.snowmanWebGlRightArmBaseTransformationMatrix);
		var snowmanRightArmRenderWebGlData = new ObjectRenderWebGlData(armShader,
			snowmanInstanceData.snowmanWebGlRightArmVertexBuffer, snowmanInstanceData.snowmanWebGlRightArmColorBuffer,
			null, snowmanInstanceData.snowmanWebGlRightArmNormalBuffer, snowmanInstanceData.snowmanRightArmVertexCount);
		this.renderGeometry(timeQuantum, targetCanvasContext, rightArmTransformationMatrix,
			snowmanRightArmRenderWebGlData);
			
		var leftArmTransformationMatrix = snowmanInstanceData.snowmanTransformationMatrixRep.multiply(
			snowmanInstanceData.snowmanWebGlLeftArmBaseTransformationMatrix);			
		var snowmanLeftArmRenderWebGlData = new ObjectRenderWebGlData(armShader,
			snowmanInstanceData.snowmanWebGlLeftArmVertexBuffer, snowmanInstanceData.snowmanWebGlLeftArmColorBuffer,
			null, snowmanInstanceData.snowmanWebGlLeftArmNormalBuffer, snowmanInstanceData.snowmanLeftArmVertexCount);
		this.renderGeometry(timeQuantum, targetCanvasContext, leftArmTransformationMatrix,
			snowmanLeftArmRenderWebGlData);
	}
}

/**
 *  Renders face button geometry for a single snowman
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 *  @param targetCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                     to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.renderSnowmanFaceButtons = function(timeQuantum, targetCanvasContext,
	snowmanInstanceData) {
		
	var buttonShader = globalResources.getStandardShaderPhong();
	if (buttonShader !== null) {						
		var snowmanFaceButtonRenderWebGlData = new ObjectRenderWebGlData(buttonShader,
			snowmanInstanceData.snowmanWebGlFaceButtonVertexBuffer, snowmanInstanceData.snowmanWebGlFaceButtonColorBuffer,
			null, snowmanInstanceData.snowmanWebGlFaceButtonNormalBuffer, snowmanInstanceData.snowmanFaceButtonVertexCount);
		this.renderGeometry(timeQuantum, targetCanvasContext, snowmanInstanceData.snowmanTransformationMatrixRep,
			snowmanFaceButtonRenderWebGlData);	
	}		
}

/**
 *  Renders nose geometry for a single snowman
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 *  @param targetCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                     to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.renderSnowmanNose = function(timeQuantum, targetCanvasContext,
	snowmanInstanceData) {
		
	var noseShader = globalResources.getStandardShaderGouraud();
	if (noseShader !== null) {		
		var noseTransformationMatrix = snowmanInstanceData.snowmanTransformationMatrixRep.multiply(
			snowmanInstanceData.snowmanWebGlNoseBaseTransformationMatrix);
		var snowmanNoseRenderWebGlData = new ObjectRenderWebGlData(noseShader,
			snowmanInstanceData.snowmanWebGlNoseVertexBuffer, snowmanInstanceData.snowmanWebGlNoseColorBuffer,
			null, snowmanInstanceData.snowmanWebGlNoseNormalBuffer, snowmanInstanceData.snowmanNoseVertexCount);
		this.renderGeometry(timeQuantum, targetCanvasContext, noseTransformationMatrix,
			snowmanNoseRenderWebGlData);				
	}
}

/**
 *  Renders hat geometry for a single snowman
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 *  @param targetCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                     to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.renderSnowmanHat = function(timeQuantum, targetCanvasContext,
	snowmanInstanceData) {
	
	var hatShader = null;
	
	if ((snowmanInstanceData.snowmanTargetStrikeCount < this.currentSnowmanHighHitCount) ||
		(this.currentSnowmanHighHitCount < this.constMinHighHitCountForIndication)) {
		hatShader = globalResources.getStandardShaderPhong();
	}
	else {
		// The "winning" snowman will ultimately be adorned with a red hat
		hatShader = globalResources.getShaderPhongRedTint();
	}

	if (hatShader !== null) {	
		var snowmanHatRenderWebGlData = new ObjectRenderWebGlData(hatShader,
			snowmanInstanceData.snowmanWebGlHatVertexBuffer, snowmanInstanceData.snowmanWebGlHatColorBuffer,
			null, snowmanInstanceData.snowmanWebGlHatNormalBuffer, snowmanInstanceData.snowmanHatVertexCount);
		this.renderGeometry(timeQuantum, targetCanvasContext, snowmanInstanceData.snowmanTransformationMatrixRep,
			snowmanHatRenderWebGlData);
	}
}

/**
 *  Renders all snowman within the scene
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 *  @param targetCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                     to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.renderSnowmen = function(timeQuantum, targetCanvasContext) {
	for (var currentSnowmanIndex = 0; currentSnowmanIndex < this.snowmanInstanceDataCollection.length;
		currentSnowmanIndex++) {
			
		this.updateSnowmanModelTransformationMatrix(this.snowmanInstanceDataCollection[currentSnowmanIndex]);			
		this.renderSnowmanBody(timeQuantum, targetCanvasContext, this.snowmanInstanceDataCollection[currentSnowmanIndex]);
		this.renderSnowmanArms(timeQuantum, targetCanvasContext, this.snowmanInstanceDataCollection[currentSnowmanIndex]);
		this.renderSnowmanFaceButtons(timeQuantum, targetCanvasContext,
			this.snowmanInstanceDataCollection[currentSnowmanIndex]);
		this.renderSnowmanNose(timeQuantum, targetCanvasContext, this.snowmanInstanceDataCollection[currentSnowmanIndex]);
		this.renderSnowmanHat(timeQuantum, targetCanvasContext, this.snowmanInstanceDataCollection[currentSnowmanIndex]);
	}
}

/**
 *  Renders all snowballs within the scene
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 *  @param targetCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                     to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.renderSnowballs = function(timeQuantum, targetCanvasContext) {
	for (var currentSnowballIndex = 0; currentSnowballIndex < this.snowballInstanceDataCollection.length;
		currentSnowballIndex++) {
			
		if (!this.snowballInstanceDataCollection[currentSnowballIndex].invalidatedByCollision) {
			var shaderSnowRough = globalResources.getShaderSnowRough();
			if (shaderSnowRough !== null) {
				this.updateSnowballModelTransformationMatrix(this.snowballInstanceDataCollection[currentSnowballIndex]);
				
				var objectRenderWebGlData = new ObjectRenderWebGlData(shaderSnowRough,
					this.snowballInstanceDataCollection[currentSnowballIndex].snowballWebGlVertexBuffer,
					this.snowballInstanceDataCollection[currentSnowballIndex].snowballWebGlColorBuffer,
					null,
					this.snowballInstanceDataCollection[currentSnowballIndex].snowballWebGlNormalBuffer,					
					this.snowballInstanceDataCollection[currentSnowballIndex].snowballVertexCount);
				
				this.renderGeometry(timeQuantum, targetCanvasContext,
					this.snowballInstanceDataCollection[currentSnowballIndex].snowballTransformationMatrixRep,
					objectRenderWebGlData);
			}
		}
	}
}


/**
 * Updates the display state of the scroller, depending upon the
 *  amount of total time that has elapsed in the scene execution
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
MainSnowmanSnowballFightScene.prototype.updateScrollerState = function(timeQuantum) {
	this.currentScrollerStateTime += timeQuantum;

	if ((this.currentScrollerState === this.constScrollerStateLeadIn) &&
		(this.currentScrollerStateTime >= this.constScrollerStateLeadInTime)) {
		
		// Lead-in time has been completed - advance the scroller to the
		// fade-in phase.
		this.currentScrollerState = this.constScrollerStateFadeIn;
		this.currentScrollerStateTime = 0;
	}
	else if ((this.currentScrollerState === this.constScrollerStateFadeIn) &&
		(this.currentScrollerStateTime >= this.constScrollerStateFadeInTime)) {
	
		// The scroller fade-in phase has been completed - display the scroller
		// text.
		this.currentScrollerState = this.constScrollerStateDisplayText;
		this.currentScrollerStateTime = 0;	
	}
	
	this.textScrollerIntervalCount++;
	if (this.textScrollerIntervalCount > this.constTextScrollerUpdateInterval) {
		this.textScrollerIntervalCount = 0;
	}	
}

/**
 * Renders the text scroller output to a specified canvas context
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {CanvasRenderingContext2D} The output canvas context
 *                                                       to which the text scroller
 *                                                       will be rendered
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context used for
 *                                                     writing the final output into a texture
 */
MainSnowmanSnowballFightScene.prototype.renderScrollerToTexture = function(timeQuantum, targetCanvasContext,
																		webGlCanvasContext) {
				
	// Determine whether not to draw/update the scroller, based upon the current update interval
	// count.
	var drawScroller = (this.textScrollerIntervalCount >= this.constTextScrollerUpdateInterval);
	if (validateVar(targetCanvasContext) && (this.currentScrollerState !== this.constScrollerStateLeadIn) &&
		drawScroller) {
			
		// Erase any existing scroller text...
		targetCanvasContext.clearRect(this.scrollerCoordX, this.scrollerCoordY,
			targetCanvasContext.canvas.width, /*this.messageScroller.getTextAreaHeight()*/ targetCanvasContext.canvas.height);
	
		// Draw a background strip in order to enhance scroller readability.
		targetCanvasContext.save();
		targetCanvasContext.fillStyle = this.scrollerBackgroundColor.getRgbaIntValueAsStandardString();
		
		// Set the alpha for the scroller background (the alpha is variable as the scroller background
		// fades-in).
		targetCanvasContext.globalAlpha = (this.currentScrollerState === this.constScrollerStateFadeIn) ?
			Constants.scrollerBackgroundUnitAlpha * (this.currentScrollerStateTime / this.constScrollerStateFadeInTime) :
			Constants.scrollerBackgroundUnitAlpha;
		targetCanvasContext.fillRect(this.scrollerCoordX, this.scrollerCoordY,
			targetCanvasContext.canvas.width, this.messageScroller.getTextAreaHeight());
			
		targetCanvasContext.restore();
		
		// Display the scroller text.
		if (this.currentScrollerState === this.constScrollerStateDisplayText) {
			this.messageScroller.renderScroller(targetCanvasContext, this.scrollerCoordX, this.scrollerCoordY);
			this.messageScroller.advanceScroller();
		}
	}
	
	// Write the canvas data into a texture.
	var overlayTexture = globalResources.getOverlayTexture();
	if ((overlayTexture != null) && drawScroller){
		updateDynamicTextureWithCanvas(webGlCanvasContext, overlayTexture, targetCanvasContext.canvas);
	}
	
	this.updateScrollerState(timeQuantum);
}

/**
 *  Renders the scroller overlay
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 *  @param targetCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                     to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.renderScroller = function(timeQuantum, targetCanvasContext) {
	var overlayShader = globalResources.getOverlayShader();
	var overlayCanvasContext = globalResources.getOverlayCanvasContext();
	if ((overlayShader !== null) && validateVar(overlayCanvasContext)) {
		// Update the contents of the texture that contains the scroller.
		this.renderScrollerToTexture(timeQuantum, overlayCanvasContext, targetCanvasContext);
		
		targetCanvasContext.useProgram(overlayShader);
		// Bind the vertex buffer...
		targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER,
			this.sceneScrollerGeometry.sceneScrollerWebGlVertexBuffer);
		var vertexPositionAttribute = targetCanvasContext.getAttribLocation(overlayShader, "aVertexPosition");
		targetCanvasContext.vertexAttribPointer(vertexPositionAttribute, this.constVertexSize,
			targetCanvasContext.FLOAT, false, 0, 0);
		targetCanvasContext.enableVertexAttribArray(vertexPositionAttribute);
					
		// Set the active texture coordinate buffer...
		targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER,
			this.sceneScrollerGeometry.sceneScrollerWebGlTexCoordBuffer);
		var textureCoordinateAttribute = targetCanvasContext.getAttribLocation(overlayShader, "aTextureCoord");
		targetCanvasContext.vertexAttribPointer(textureCoordinateAttribute, this.constTextureCoordinateSize,
			targetCanvasContext.FLOAT, false, 0, 0);
		targetCanvasContext.enableVertexAttribArray(textureCoordinateAttribute);
			
		var samplerAttribute = targetCanvasContext.getUniformLocation(overlayShader, "uSampler");
			
		// Bind the scroller texture
		var overlayTexture = globalResources.getOverlayTexture();
		targetCanvasContext.activeTexture(targetCanvasContext.TEXTURE0);
		targetCanvasContext.bindTexture(targetCanvasContext.TEXTURE_2D, overlayTexture);
		targetCanvasContext.uniform1i(samplerAttribute, 0);

		// ...Render the quad containing the scroller texture.
		targetCanvasContext.drawArrays(targetCanvasContext.TRIANGLES, 0,
			this.sceneScrollerGeometry.sceneScrollerWebGlVertexCount);
	}
}

/**
 *  Renders the scene backdrop
 *  
 *  @param timeQuantum {number} Time delta with respect to the previously-executed
 *                              animation step (milliseconds)
 *  @param targetCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                     to a WebGL display buffer
 */
MainSnowmanSnowballFightScene.prototype.renderBackdrop = function(timeQuantum, targetCanvasContext) {
	var backdropShader = globalResources.getBackdropShader();
	if (backdropShader !== null) {		
		targetCanvasContext.useProgram(backdropShader);
		// Bind the vertex buffer...
		targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER,
			this.sceneBackdropGeometry.sceneBackdropWebGlVertexBuffer);
		var vertexPositionAttribute = targetCanvasContext.getAttribLocation(backdropShader, "aVertexPosition");
		targetCanvasContext.vertexAttribPointer(vertexPositionAttribute, this.constVertexSize,
			targetCanvasContext.FLOAT, false, 0, 0);
		targetCanvasContext.enableVertexAttribArray(vertexPositionAttribute);
					
		// Set the active texture coordinate buffer...
		targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER,
			this.sceneBackdropGeometry.sceneBackdropWebGlTexCoordBuffer);
		var textureCoordinateAttribute = targetCanvasContext.getAttribLocation(backdropShader, "aTextureCoord");
		targetCanvasContext.vertexAttribPointer(textureCoordinateAttribute, this.constTextureCoordinateSize,
			targetCanvasContext.FLOAT, false, 0, 0);
		targetCanvasContext.enableVertexAttribArray(textureCoordinateAttribute);
		
		// ...Render the quad containing the backdrop.
		targetCanvasContext.drawArrays(targetCanvasContext.TRIANGLES, 0,
			this.sceneBackdropGeometry.sceneBackdropWebGlVertexCount);
	}	
}

/**
 * Renders the primary, texture-based portion of the scene
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be drawn
 */
MainSnowmanSnowballFightScene.prototype.renderScene = function(timeQuantum, targetCanvasContext) {
	targetCanvasContext.clear(targetCanvasContext.COLOR_BUFFER_BIT);

	this.renderBackdrop(timeQuantum, targetCanvasContext);	
	this.renderGroundPlane(timeQuantum, targetCanvasContext);
	this.renderSnowmen(timeQuantum, targetCanvasContext);
	this.renderSnowballs(timeQuantum, targetCanvasContext);
	this.renderScroller(timeQuantum, targetCanvasContext);
}

/**
 * Executes a time-parameterized single scene animation step
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 * @param targetCanvasContext {CanvasRenderingContext2D} Context onto which
 *                            the scene data will be drawn
 * @param overlayCanvasContext {CanvasRenderingContext2D} Context onto which
 *                             data to be superimposed on the scene will be
 *                             drawn
 */
MainSnowmanSnowballFightScene.prototype.executeStep = function(timeQuantum, targetCanvasContext, overlayCanvasContext) {
	this.updateStateInformationForSnowmanCollection(timeQuantum);
	this.updateStateInformationForSnowballCollection(timeQuantum);
	this.updateCameraPosition(timeQuantum);
	this.renderScene(timeQuantum, targetCanvasContext);
	
	
	this.firstIterationExecuted = true;
	
	this.totalElapsedSceneTimeMs += timeQuantum;
	this.currentSceneRunningTimeMs += timeQuantum;
}