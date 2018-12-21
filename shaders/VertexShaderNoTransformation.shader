// VertexShaderNoTransformation.shader - Renders vertices without applying a transformation
// Author: Ayodeji Oshinnaiye

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

varying mediump vec2 vTextureCoord;

void main() {
	gl_Position = vec4(aVertexPosition.xyz, 1.0);
	vTextureCoord = aTextureCoord;
}
