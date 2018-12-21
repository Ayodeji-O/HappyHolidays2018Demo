// FragmentShaderBackdrop.shader - Shader employed to generate
// a gradient backdrop

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;

void main() {
	const mediump vec2 REFERENCE_POINT = vec2(0.5, 1.0);
	const mediump float SECONDARY_COMPONENT_POWER = 2.0;
	const mediump float DISTANCE_SCALING_FACTOR = 0.5;
	
	// Determine the distance from the reference point (will be used
	// to determine the color intensity)
	mediump float distanceFromRefPoint = distance(REFERENCE_POINT, vTextureCoord);
	
	// Create a gradient pattern - two gradient change rates will be used
	// in order to create overlapping color shades within the gradient.
	mediump float baseColorValue = DISTANCE_SCALING_FACTOR * distanceFromRefPoint;
	
	mediump float primaryComponentValue = baseColorValue;
	mediump float secondaryComponentValue = pow(baseColorValue, SECONDARY_COMPONENT_POWER);
	
	mediump vec3 finalColor = vec3(secondaryComponentValue, secondaryComponentValue, primaryComponentValue);
	gl_FragColor = vec4(finalColor, 1.0);
}