// GlobalResources.js - Contains resources that are accessible
//                      from all areas of the demo
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -WebGlUtility.js

function globalResources() {
	//this.progressFunction = null;
	
	this.mainCanvasContext = null;
	this.overlayCanvasContext = null;
	this.overlayTexture = null;
	this.vertexShaderStandardPosition = null;
	this.fragmentShaderShowRough = null;
}

/**
 * Vertex / fragment shaders
 */
 
// Standard vertex shader used for all transformed scene geometry
globalResources.vertexShaderStandardPositionName = "shaders/VertexShaderStandardPosition.shader";
// Fragment shader that depicts a rough pattern (to be used for rough snow rendering)
globalResources.fragmentShaderSnowShaderRoughName = "shaders/FragmentShaderSnowRough.shader";
// Vertex shader used to display geometry that will not have transformations applied (e.g. backdrop)
globalResources.vertexShaderNoTransformationName = "shaders/VertexShaderNoTransformation.shader";
// Generic texture mapping fragment shader
globalResources.fragmentShaderStandardTextureName = "shaders/FragmentShaderStandardTexture.shader";
// Fragment shader used for gouraud shaded lighting
globalResources.fragmentShaderGouraudName = "shaders/FragmentShaderGouraud.shader";
// Fragment shader used for Phong lighting
globalResources.fragmentShaderPhongName = "shaders/FragmentShaderPhong.shader";
// Fragment shader that is used for Phong lighting, with a red tint applied to all rendered geometry
globalResources.fragmentShaderPhongRedTintName = "shaders/FragmentShaderPhongRedTint.shader"
// Fragment shader used to generate the backdrop pattern
globalResources.fragmentShaderBackdropName = "shaders/FragmentShaderBackdrop.shader";

/**
 *  Images
 */
 
// "Play" button (used to elicit a click response required to play audio)
globalResources.userInitiationInterfaceImageName = "images/PlayButton.png";
// Spinner used during loading
globalResources.preloadSpinnerImageName = "images/PreloadSpinner.gif"

/**
 *  Audio
 */
 
// Name of source audio file
globalResources.backgroundAudioContainerName = "audio/Feisty Frosty.mp3";


globalResources.audioContext = null;

/**
 *  Compiled shader programs
 */
 
globalResources.snowShaderRough = null;
globalResources.standardShaderGouraud = null;
globalResources.standardShaderPhong = null;
globalResources.shaderPhongRedTint = null;
globalResources.overlayShader = null;
globalResources.backdropShader = null;

globalResources.backgroundAudioData = null;


/**
 *  Loads and compiles all shader resources used within the demo
 */
globalResources.loadShaders = function() {
	var canvasContext = this.getMainCanvasContext();
	
	if (canvasContext !== null) {
		// Only one vertex shader will be used for transformed geometry...
		var vertexShaderStandardSource = this.loadResourceFile(this.vertexShaderStandardPositionName);
		// Vertex shader will be used for geometry not subject to transformations...
		var vertexShaderNoTransformationSource = this.loadResourceFile(this.vertexShaderNoTransformationName);
		
		// Load all fragment shaders...
		var fragmentShaderSnowRoughSource = this.loadResourceFile(this.fragmentShaderSnowShaderRoughName);
		var fragmentShaderStandardTextureSource = this.loadResourceFile(this.fragmentShaderStandardTextureName);
		var fragmentShaderGouraudSource = this.loadResourceFile(this.fragmentShaderGouraudName);
		var fragmentShaderPhongSource = this.loadResourceFile(this.fragmentShaderPhongName);
		var fragmentShaderPhongRedTintSource = this.loadResourceFile(this.fragmentShaderPhongRedTintName);
		var backdropShaderSource = this.loadResourceFile(this.fragmentShaderBackdropName);
		
		// Compile all required shader programs.
		var snowShaderProgram = createShaderProgram(canvasContext, vertexShaderStandardSource, fragmentShaderSnowRoughSource);
		if (snowShaderProgram !== null) {
			globalResources.snowShaderRough = snowShaderProgram;	
		}
		
		var gouraudShaderProgram = createShaderProgram(canvasContext, vertexShaderStandardSource,
			fragmentShaderGouraudSource);
		if (gouraudShaderProgram !== null) {
			globalResources.standardShaderGouraud = gouraudShaderProgram;
		}
			
		var phongShaderProgram = createShaderProgram(canvasContext, vertexShaderStandardSource,
			fragmentShaderPhongSource);
		if (phongShaderProgram !== null) {
			globalResources.standardShaderPhong = phongShaderProgram;
		}

		var phongShaderRedTintProgram = createShaderProgram(canvasContext, vertexShaderStandardSource,
			fragmentShaderPhongRedTintSource);
		if (phongShaderRedTintProgram !== null) {
			globalResources.shaderPhongRedTint = phongShaderRedTintProgram;
		}
			
		var overlayShaderProgram = createShaderProgram(canvasContext, vertexShaderNoTransformationSource,
			fragmentShaderStandardTextureSource);
		if (overlayShaderProgram !== null) {
			globalResources.overlayShader = overlayShaderProgram;
		}
		
		var backdropShaderProgram = createShaderProgram(canvasContext, vertexShaderNoTransformationSource,
			backdropShaderSource);
		if (backdropShaderProgram != null) {
			globalResources.backdropShader = backdropShaderProgram;
		}
	}
}

/**
 *  Loads the background audio file data, decoding the data after it has
 *   been successfully received
 *  
 *  @param completionFunction {Function} A function to be invoked after the
 *                                       loading of the audio data has been
 *                                       completed
 */
globalResources.loadBackgroundAudio = function(completionFunction) {
	// Asynchronously load the audio file...
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("GET", this.backgroundAudioContainerName, true);
	httpRequest.responseType = "arraybuffer";

	httpRequest.onload = function () {
		globalResources.onBackgroundAudioLoadHandler(this.response, completionFunction)
	}

	httpRequest.send();
}

/**
 *  Creates an AudioContext object that will be required
 *   to play the background audio
 *  
 *  @return {AudioContext} AudioContext object required to play
 *                         the background audio
 */
globalResources.createAudioContext = function() {
	var audioContext = null;
	if (typeof(window.AudioContext) !== "undefined") {
		audioContext = new window.AudioContext();
	}
	else {
		// Used by Safari (validated against version 12.x)
		audioContext = new window.webkitAudioContext();
	}
	
	return audioContext;
}

/**
 *  Event handler - invoked upon reception of requested audio data; decodes
 *   received audio data
 *  
 *  @param encodedAudioData {ArrayBuffer} Buffer of audio data to be decoded
 *  @param completionFunction {Function} Function to be invoked after the audio
 *                                       data has been decoded
 *   
 *  @see globalResources.loadBackgroundAudio
 */
globalResources.onBackgroundAudioLoadHandler = function(encodedAudioData, completionFunction) {
	// Create an audio context object solely for decoding of audio data
	// (the audio context using primarily for decoding audio must be
	// created as the result of a click event in order to operate in
	// all supported browsers).
	var audioContext = globalResources.createAudioContext();
	if (audioContext !== null) {	
		
		function decodeSuccessCallback(audioBuffer) {
			// Audio has been decoded successfully - store the buffer, and
			// invoke the provided completion function
			globalResources.backgroundAudioData = audioBuffer;
			if (validateVar(completionFunction)) {
				completionFunction();
			}
		}
		
		function decodeErrorCallBack(audioBuffer) {
			
		}
		
		// Decode the audio data...
		audioContext.decodeAudioData(encodedAudioData, decodeSuccessCallback, decodeErrorCallBack);
	}
}

/**
 *  Initiates playback of the background audio - this method must
 *   be invoked from within a click event handler in order for
 *   the audio to be played on all supported browsers (it should not
 *   be invoked an any other handler, even if the request being
 *   handled was invoked from within the click handler)
 */
globalResources.playBackgroundAudio = function() {
	if (globalResources.backgroundAudioData !== null) {		
		globalResources.audioContext = globalResources.createAudioContext();
		if (globalResources.audioContext !== null) {	
			var audioSource = globalResources.audioContext.createBufferSource();
			audioSource.buffer = globalResources.backgroundAudioData;
			audioSource.connect(globalResources.audioContext.destination);
			audioSource.loop = true;
			audioSource.start(0);
		}
	}
}

/**
 *  Shader program retrieval functions
 */

globalResources.getShaderSnowRough = function() {
	return this.snowShaderRough;
}

globalResources.getStandardShaderGouraud = function() {
	return this.standardShaderGouraud;
}

globalResources.getStandardShaderPhong = function() {
	return this.standardShaderPhong;
}

globalResources.getShaderPhongRedTint = function() {
	return this.shaderPhongRedTint;
}

globalResources.getOverlayShader = function() {
	return this.overlayShader;
}

globalResources.getBackdropShader = function() {
	return this.backdropShader;
}

globalResources.getUserInitiationInterfaceImageName = function() {
	return this.userInitiationInterfaceImageName;
}

/**
 * Performs a synchronous load of a specified resource file
 * @param fileSpecification {string} Contains the URL of the resource to be loaded
 *                                   (can be a relative or absolute URL)
 * @return {DOMString} A DOM string object containing the loaded resource data
 *                     upon success, null otherwise
 */
globalResources.loadResourceFile = function(fileSpecification) {
	var fileData = null;
	
	if (validateVar(fileSpecification) && (typeof fileSpecification === "string")) {
		// Peform a synchronous HTTP request in order to load the file -
		// resource file loading is expected to be performed during initialization;
		// therefore, a synchronous request is acceptable.
		var httpRequest = new XMLHttpRequest();
		httpRequest.open("GET", fileSpecification, false);
		//httpRequest.responseType = "text";
		httpRequest.send();
		fileData = httpRequest.responseText;
	}
	
	return fileData;
}

/**
 * Retrieves the "main" canvas context used for drawing data
 *  to the browser window
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing data to the
 *			browser window
 */
globalResources.getMainCanvasContext = function() {
	return typeof this.mainCanvasContext !== "undefined" ?
		this.mainCanvasContext : null;
}

/**
 * Retrieves the overlay canvas context used for drawing data
 *  to the browser window
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing to be
 *			superimposed on the main canvas
 */
globalResources.getOverlayCanvasContext = function() {
	return typeof this.overlayCanvasContext !== "undefined" ?
		this.overlayCanvasContext : null;
}

/**
 * Sets the "main" canvas context used for drawing data to the
 *  browser window
 * @param mainCanvasContext {CanvasRenderingContext2D / WebGLRenderingContext}
 *						    The canvas context the
 *                          will be retrieved for drawing data to the browser
 *                          window
 */
globalResources.setMainCanvasContext = function(mainCanvasContext) {
	this.mainCanvasContext = mainCanvasContext;
}

/**
 * Sets the overlay canvas context used for drawing data that is
 *  to be superimposed on the main canvas
 * @param overlayCanvasContext {CanvasRenderingContext2D / WebGLRenderingContext}
 *						       The canvas context that will be retrieved for
 *                             drawing data over the main canvas
 */
globalResources.setOverlayCanvasContext = function(overlayCanvasContext) {
	this.overlayCanvasContext = overlayCanvasContext;
}

/**
 *  Retrieves the overlay texture used for superimposing data
 *   that is to be drawn over the main scene
 *  
 *  @return {WebGLTexture} The texture that is to be used
 *                         as the overlay texture
 */
globalResources.getOverlayTexture = function() {
	return this.overlayTexture;
}

/**
 * Sets the overlay texture used for drawing data that is
 *  to be superimposed on the main texture
 * @param overlayTexture {WebGLTexture} The texture that is to be used
 *                                      as an overlay texture
 */
globalResources.setOverlayTexture = function(overlayTexture) {
	this.overlayTexture = overlayTexture;
}

/**
 * Retrieves the "main" canvas context used for drawing data
 *  to the browser window
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing data to the
 *			browser window
 */
globalResources.getMainCanvasContext = function() {
	return typeof this.mainCanvasContext !== "undefined" ?
		this.mainCanvasContext : null;
}

/**
 * Initializes the global resources, loading
 *  any resources that require pre-loading
 * @param completionFuction {function} Completion function executed
 *                                     upon completion of all global
 *                                     resource loading
 */
globalResources.initialize = function(completionFunction) {
	this.loadShaders();
	completionFunction();
}