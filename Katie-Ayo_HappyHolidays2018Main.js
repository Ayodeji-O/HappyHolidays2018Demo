// Katie-Ayo_HappyHolidays2018Main.js - Happy Holidays 2017 demo entry point
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -WebGlUtility.js
//  -InternalConstants.js
//  -GlobalResources.js
//  -SceneExecution.js
//  -MainSnowmanSnowballFightScene.js

function setupUserInitiationInterface(completionFunction) {
	// Display a button that will elicit a click from the user
	// (a click is required to permit audio to be played).
	buildSingleImageDom(globalResources.getUserInitiationInterfaceImageName(), completionFunction);
}

/**
 * Initializes any required DOM resources
 *  (creates objects, etc.)
 * @param completionFunction {function} Function to be invoked after the
 *                                      DOM resource initialization has
 *                                      been completed.
 */
function initDomResources(completionFunction) {
	// Remove any previous elements from the DOM.
	document.body = document.createElement("body");	
	
	// Create the main canvas on which output
	// will be displayed..
	mainDiv = document.createElement("div");
	
	// Center the div within the window (the height centering will
	// not be retained if the window size has been altered).
	mainDiv.setAttribute("style", "text-align:center; margin-top: " +
		Math.round((window.innerHeight - Constants.defaultCanvasHeight) / 2.0) + "px");
		
	// Add the DIV to the DOM.
	document.body.appendChild(mainDiv);		
	var mainCanvas = document.createElement("canvas");
	var overlayCanvas = document.createElement("canvas");
	
    if (validateVar(mainCanvas) && validateVar(overlayCanvas) &&
		(typeof mainCanvas.getContext === 'function')) {
		mainCanvas.width = Constants.defaultCanvasWidth;
		mainCanvas.height = Constants.defaultCanvasHeight;
		
		overlayCanvas.width = Constants.overlayTextureWidth;
		overlayCanvas.height = Constants.overlayTextureHeight;
	
        // Store the WeblGL context that will be used
        // to write data to the canvas.
        var mainCanvasContext = getWebGlContextFromCanvas(mainCanvas);
		var overlayCanvasContext = overlayCanvas.getContext("2d");
    
		if (validateVar(mainCanvasContext) && validateVar(overlayCanvasContext)) {
			// Prepare the WebGL context for use.
			initializeWebGl(mainCanvasContext);

			// Add the canvas object DOM (within the DIV).
			mainDiv.appendChild(mainCanvas);
			
			// Create an overlay texture - this texture will be used primarily
			// to display the message text using multitexturing.
			var overlayTexture = createTextureFromCanvas(mainCanvasContext, overlayCanvas, false);
			if (validateVar(overlayTexture)) {
				globalResources.setOverlayTexture(overlayTexture);
			}
			
			globalResources.setMainCanvasContext(mainCanvasContext);
			globalResources.setOverlayCanvasContext(overlayCanvasContext);
		}
	}
	
	function loadCompletionFunction() {
		completionFunction();
	}
	
	globalResources.initialize(loadCompletionFunction);	
}

/**
 *  Builds a document object model that consists of a
 *   single image (destroys the existing model)
 *  
 *  @param imageUri {string} URI used to access the image resource
 *  @param onClickFunction {Function} (Optional) function invoked
 *                                    when a click on the image occurs
 */
function buildSingleImageDom(imageUri, onClickFunction) {
	// Destroy the existing document object model...
	document.body = document.createElement("body");	
	
	// Create the image element, and add it to the
	// document object model as the sole element.
	var domImage = new Image();
	domImage.src = imageUri;// globalResources.getUserInitiationInterfaceImageName();
	domImage.setAttribute("style", "display:block; margin:auto");
	
	if (validateVarAgainstType(onClickFunction, Function)) {
		domImage.onclick = onClickFunction;
	}
	document.body.appendChild(domImage);
}

/**
 * Completion function to be used with globalResources.initialize() -
 *  performs any final activities related to loading, and executes
 *  the main scene immediately after all image data has been loaded
 * @see globalResources.initialize
 */
finalizeLoading = function() {
	globalResources.playBackgroundAudio();
	executeMainScene();
}

/**
 * Performs execution of the main demo scene
 */
executeMainScene = function() {
	// Create the main image transformation scene, and ultimately
	// invoke the start of the demo.
	var snowmanSnowballFightScene = new MainSnowmanSnowballFightScene();
	sceneExecution(snowmanSnowballFightScene);
}

/**
 * Main routine - function that is
 *  executed when page loading has
 *  completed
 */
onLoadHandler = function() {
	
	function userInitiationCompleted() {
		// Display a preload spinner while resources load
		// (the resources consist of shaders, so the
		// loading time should be very short).
		buildSingleImageDom(globalResources.preloadSpinnerImageName);
		
		// Initalize the DOM resources, immediately
		// executing the demo after completion of
		// initialization.
		initDomResources(finalizeLoading);
	}
	
	function initializeUserInitiationInterface() {
		// Set-up an element that will require a click from
		// the viewer.
		setupUserInitiationInterface(userInitiationCompleted);
	}
	
	// Display a preload spinner while the background audio
	// data is loaded.
	buildSingleImageDom(globalResources.preloadSpinnerImageName);
	globalResources.loadBackgroundAudio(initializeUserInitiationInterface);
}