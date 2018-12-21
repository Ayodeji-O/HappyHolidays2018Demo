// FragmentShaderPhong.shader - Generic Phong shading
//                              fragment shader

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uOverlaySampler;
uniform mediump vec3 uniform_ambientLightVector;
uniform mediump vec3 uniform_viewingVector;
varying mediump vec3 vNormalVector;

varying lowp vec4 vBaseFragmentColor;

void main() {
	const mediump float AMBIENT_CONTRIBUTION_FRACTION = 0.7;
	const mediump float REFLECTIVITY_COEFFICIENT = 1.5;
	const mediump float PHONG_EXPONENT = 6.0;
	
	// Compute the reflection vector...
	mediump vec3 reflectionVector = reflect(-normalize(uniform_ambientLightVector), normalize(vNormalVector));
	// Compute the base phong contribution, using the reflection vector.
	mediump float ambientDotProductPhong = dot(reflectionVector, -uniform_viewingVector);
	
	// Narrow the phong highlight through exponentiation, and combine the
	// the phong contribution with the fragment base color.
	mediump float ambientContibution = pow(abs(ambientDotProductPhong), PHONG_EXPONENT) * AMBIENT_CONTRIBUTION_FRACTION;
	mediump float baseContribution = 1.0 - AMBIENT_CONTRIBUTION_FRACTION;
	mediump float phongAmbientFraction = REFLECTIVITY_COEFFICIENT * ambientContibution;
	mediump vec3 phongColorContribution = vec3(phongAmbientFraction);
	
	gl_FragColor = vec4((vBaseFragmentColor * baseContribution).xyz + phongColorContribution, 1.0);
}