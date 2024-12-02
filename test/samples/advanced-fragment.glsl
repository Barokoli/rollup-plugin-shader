uniform sampler2D mytexture;
uniform float cutOutRadius;
uniform float exposure;
uniform float firstRadius;
uniform vec3 scenePosition;
uniform vec3 maxBB;
uniform vec3 minBB;
varying vec2 vUv;
varying vec4 vWuv;
varying float depth;
varying vec4 vcenterUV;
varying vec4 centerPos;
varying vec4 currentPosition;
varying vec3 vPosition;
uniform vec3 scale;
uniform vec3 shaderPos;
uniform sampler2D shadowMap;
uniform float fadeFactor; //Higher the Value to increase transparency





#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif

vec4 myLinearTosRGB( in vec4 value ) {
    return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}

vec3 RRTAndODTFit( vec3 v ) {
    vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
    vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
    return a / b;
}

vec3 myACESFilmicToneMapping( vec3 color ) {
    const mat3 ACESInputMat = mat3(
    vec3( 0.59719, 0.07600, 0.02840 ), vec3( 0.35458, 0.90834, 0.13383 ), vec3( 0.04823, 0.01566, 0.83777 )
    );
    const mat3 ACESOutputMat = mat3(
    vec3(  1.60475, -0.10208, -0.00327 ), vec3( -0.53108, 1.10813, -0.07276 ), vec3( -0.07367, -0.00605, 1.07602 )
    );
    color *= exposure / 0.6;
    color = ACESInputMat * color;
    color = RRTAndODTFit( color );
    color = ACESOutputMat * color;
    return saturate( color );
}


void innerCircle() {
    vec4 sum = vec4(0.0);
    //mapping shadowMap onto vWuv
    sum = texture2D( shadowMap, vec2(vWuv.x/(scale.x), 1.0-vWuv.z/(scale.z)));
    vec4 texColor = texture2D(mytexture,vUv);
    float distanceToCenter = smoothstep(cutOutRadius,cutOutRadius,distance(centerPos.xz,vcenterUV.xz));
    //creating Pixel-color and compute transparency with the shadowmap (multiply by fadefactor)
    if(distanceToCenter == 1.0){
        discard;
    }
    if(sum.w == 1.0){
        gl_FragColor = vec4(texColor.rgb,0.0);
    }else{
        gl_FragColor = vec4(texColor.rgb,1.0);
    }
}


uniform float innerCutOut;
uniform float ringSize;
uniform float ringSize;

#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif

vec4 myLinearTosRGB( in vec4 value ) {
    return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}

vec3 RRTAndODTFit( vec3 v ) {
    vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
    vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
    return a / b;
}

vec3 myACESFilmicToneMapping( vec3 color ) {
    const mat3 ACESInputMat = mat3(
    vec3( 0.59719, 0.07600, 0.02840 ), vec3( 0.35458, 0.90834, 0.13383 ), vec3( 0.04823, 0.01566, 0.83777 )
    );
    const mat3 ACESOutputMat = mat3(
    vec3(  1.60475, -0.10208, -0.00327 ), vec3( -0.53108, 1.10813, -0.07276 ), vec3( -0.07367, -0.00605, 1.07602 )
    );
    color *= exposure / 0.6;
    color = ACESInputMat * color;
    color = RRTAndODTFit( color );
    color = ACESOutputMat * color;
    return saturate( color );
}


void outerCircle() {
    vec4 sum = vec4(0.0);
    //mapping shadowMap onto vWuv
    vec4 texColor = texture2D(mytexture,vUv);
    //Define cut out circle here (e.g. smoothstep(cutOutRadius,cutOutRadius,distance(centerPos.xz,vcenterUV.xz)); cuts out the inner n meters)
    float distanceToCenter = smoothstep(innerCutOut,innerCutOut+ringSize,distance(centerPos.xz,vcenterUV.xz));
    //creating Pixel-color and compute transparency with the shadowmap (multiply by fadefactor)
    if(distance(centerPos.xz,vcenterUV.xz) >= innerCutOut + ringSize){
        discard;
    }
    if(distance(centerPos.xz,vcenterUV.xz) < innerCutOut){
        discard;
    }
    //float d = sqrt(dot(vcenterUV,vcenterUV));
    //float t = 1.0 - smoothstep(ringSize, ringSize, abs(ringSize-d));
    gl_FragColor = vec4(myACESFilmicToneMapping(texColor.rgb * exposure), 1.0);
}
