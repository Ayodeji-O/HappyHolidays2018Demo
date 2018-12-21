// FragmentShaderSnowRough.shader - Snow shader - uses periodic, high-frequency
//                                  noise in order to simulate view-dependent
//                                  shimmering of lightly-packed snow.

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uOverlaySampler;
uniform mediump vec3 uniform_ambientLightVector;
varying mediump vec3 vNormalVector;

varying lowp vec4 vBaseFragmentColor;

void main() {
	const mediump float AMBIENT_CONTRIBUTION_FRACTION = 0.7;
	const mediump float MAX_PERTURBATION_MAGNITUDE = 0.02;
	const mediump float CONST_PI = acos(-1.0);
	const mediump float NUM_PERTURBATIONS = 30.0;
	
	// Generate periodic "perturbations"  across both axis of the surface
	// in order to simulate a rough surface...
	mediump float perturbationX = sin(vTextureCoord.x * CONST_PI * NUM_PERTURBATIONS) * MAX_PERTURBATION_MAGNITUDE;
	mediump float perturbationY = sin(vTextureCoord.y * CONST_PI * NUM_PERTURBATIONS) * MAX_PERTURBATION_MAGNITUDE;
	mediump float totalPerturbation = perturbationX + perturbationY;
	mediump float ambientDotProduct = dot(normalize(vNormalVector), -normalize(uniform_ambientLightVector));
	mediump float ambientContibution = pow(abs(ambientDotProduct), 1.0) * AMBIENT_CONTRIBUTION_FRACTION;
	mediump float baseContribution = 1.0 - AMBIENT_CONTRIBUTION_FRACTION;
	
	// Compute the base color (gouraud shaded)
	mediump vec3 unperturbedColor = clamp((vBaseFragmentColor * (baseContribution + ambientContibution)).xyz,
		vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));
	
	// Add the perturbations to the final color output
	gl_FragColor = vec4((unperturbedColor + totalPerturbation), 1.0);
}