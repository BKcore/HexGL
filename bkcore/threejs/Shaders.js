/**
 * @author Thibaut Despoulain / http://bkcore.com
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */
const bkcore = bkcore || {};
bkcore.threejs = bkcore.threejs || {};

bkcore.threejs.Shaders = 
{
	'additive' : {
		uniforms: {
			tDiffuse: { type: "t", value: 0, texture: null },
			tAdd: { type: "t", value: 1, texture: null },
			fCoeff: { type: "f", value: 1.0 }
		},

		vertexShader: [
			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"
		].join("\n"),

		fragmentShader: [
			"uniform sampler2D tDiffuse;",
			"uniform sampler2D tAdd;",
			"uniform float fCoeff;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 texel = texture2D( tDiffuse, vUv );",
				"vec4 add = texture2D( tAdd, vUv );",
				"gl_FragColor = texel + add * fCoeff * add.a;",

			"}"
		].join("\n")
	},

	/* ------------------------------------------------------------------------------------------------
	//	Hexagonal Vignette shader
	//  by BKcore.com
	 ------------------------------------------------------------------------------------------------ */

	'hexvignette': {

		uniforms: {

			tDiffuse: { type: "t", value: 0, texture: null },
			tHex: {type: "t", value: 1, texture: null},
			size: {type: "f", value: 512.0},
			rx: {type: "f", value: 1024.0},
			ry: {type: "f", value: 768.0},
			color: {type: "c", value: new THREE.Color(0x458ab1)}

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform float size;",
			"uniform float rx;",
			"uniform float ry;",

			"uniform vec3 color;",

			"uniform sampler2D tDiffuse;",
			"uniform sampler2D tHex;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 vcolor = vec4(color,1.0);",

				"vec2 hexuv;",
				"hexuv.x = mod(vUv.x * rx, size) / size;",
				"hexuv.y = mod(vUv.y * ry, size) / size;",
				"vec4 hex = texture2D( tHex, hexuv );",

				"float tolerance = 0.2;",
       			"float vignette_size = 0.6;",
        		"vec2 powers = pow(abs(vec2(vUv.x - 0.5,vUv.y - 0.5)),vec2(2.0));",
        		"float radiusSqrd = vignette_size*vignette_size;",
        		"float gradient = smoothstep(radiusSqrd-tolerance, radiusSqrd+tolerance, powers.x+powers.y);",

				"vec2 uv = ( vUv - vec2( 0.5 ) );",

				"vec2 sample = uv * gradient * 0.5 * (1.0-hex.r);",

				"vec4 texel = texture2D( tDiffuse, vUv-sample );",
				"gl_FragColor = (((1.0-hex.r)*vcolor) * 0.5 * gradient) + vec4( mix( texel.rgb, vcolor.xyz*0.7, dot( uv, uv ) ), texel.a );",

			"}"

		].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	Normal map shader (perpixel)
	//		- Blinn-Phong
	//		- normal + diffuse + specular + AO + displacement + reflection + shadow maps
	//		- PER-PIXEL point and directional lights (use with "lights: true" material option)
	//		- modified by BKcore
	 ------------------------------------------------------------------------- */

	'normal' : {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "lights" ],
			THREE.UniformsLib[ "shadowmap" ],

			{

			"enableAO"		  : { type: "i", value: 0 },
			"enableDiffuse"	  : { type: "i", value: 0 },
			"enableSpecular"  : { type: "i", value: 0 },
			"enableReflection": { type: "i", value: 0 },

			"tDiffuse"	   : { type: "t", value: 0, texture: null },
			"tCube"		   : { type: "t", value: 1, texture: null },
			"tNormal"	   : { type: "t", value: 2, texture: null },
			"tSpecular"	   : { type: "t", value: 3, texture: null },
			"tAO"		   : { type: "t", value: 4, texture: null },
			"tDisplacement": { type: "t", value: 5, texture: null },

			"uNormalScale": { type: "f", value: 1.0 },

			"uDisplacementBias": { type: "f", value: 0.0 },
			"uDisplacementScale": { type: "f", value: 1.0 },

			"uDiffuseColor": { type: "c", value: new THREE.Color( 0xffffff ) },
			"uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
			"uAmbientColor": { type: "c", value: new THREE.Color( 0xffffff ) },
			"uShininess": { type: "f", value: 30 },
			"uOpacity": { type: "f", value: 1 },

			"uReflectivity": { type: "f", value: 0.5 },

			"uOffset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
			"uRepeat" : { type: "v2", value: new THREE.Vector2( 1, 1 ) },

			"wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

			}

		] ),

		fragmentShader: [

			"uniform vec3 uAmbientColor;",
			"uniform vec3 uDiffuseColor;",
			"uniform vec3 uSpecularColor;",
			"uniform float uShininess;",
			"uniform float uOpacity;",

			"uniform bool enableDiffuse;",
			"uniform bool enableSpecular;",
			"uniform bool enableAO;",
			"uniform bool enableReflection;",

			"uniform sampler2D tDiffuse;",
			"uniform sampler2D tNormal;",
			"uniform sampler2D tSpecular;",
			"uniform sampler2D tAO;",

			"uniform samplerCube tCube;",

			"uniform float uNormalScale;",
			"uniform float uReflectivity;",

			"varying vec3 vTangent;",
			"varying vec3 vBinormal;",
			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"uniform vec3 ambientLightColor;",

			"#if MAX_DIR_LIGHTS > 0",
				"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
				"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
			"#endif",

			"#if MAX_POINT_LIGHTS > 0",
				"uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
				"uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
				"uniform float pointLightDistance[ MAX_POINT_LIGHTS ];",
			"#endif",

			"#ifdef WRAP_AROUND",
				"uniform vec3 wrapRGB;",
			"#endif",

			"varying vec3 vViewPosition;",

			THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
			THREE.ShaderChunk[ "fog_pars_fragment" ],

			"void main() {",

				"gl_FragColor = vec4( vec3( 1.0 ), uOpacity );",

				"vec3 specularTex = vec3( 1.0 );",

				"vec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;",
				"normalTex.xy *= uNormalScale;",
				"normalTex = normalize( normalTex );",

				"if( enableDiffuse ) {",

					"#ifdef GAMMA_INPUT",

						"vec4 texelColor = texture2D( tDiffuse, vUv );",
						"texelColor.xyz *= texelColor.xyz;",

						"gl_FragColor = gl_FragColor * texelColor;",

					"#else",

						"gl_FragColor = gl_FragColor * texture2D( tDiffuse, vUv );",

					"#endif",

				"}",

				"if( enableAO ) {",

					"#ifdef GAMMA_INPUT",

						"vec4 aoColor = texture2D( tAO, vUv );",
						"aoColor.xyz *= aoColor.xyz;",

						"gl_FragColor.xyz = gl_FragColor.xyz * aoColor.xyz;",

					"#else",

						"gl_FragColor.xyz = gl_FragColor.xyz * texture2D( tAO, vUv ).xyz;",

					"#endif",

				"}",

				"if( enableSpecular )",
					"specularTex = texture2D( tSpecular, vUv ).xyz;",

				"mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );",
				"vec3 finalNormal = tsb * normalTex;",

				"vec3 normal = normalize( finalNormal );",
				"vec3 viewPosition = normalize( vViewPosition );",

				"#ifdef DOUBLE_SIDED",

					"normal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );",

				"#endif",

				// point lights

				"#if MAX_POINT_LIGHTS > 0",

					"vec3 pointDiffuse = vec3( 0.0 );",
					"vec3 pointSpecular = vec3( 0.0 );",

					"for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {",

						"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
						"vec3 pointVector = lPosition.xyz + vViewPosition.xyz;",

						"float pointDistance = 1.0;",
						"if ( pointLightDistance[ i ] > 0.0 )",
							"pointDistance = 1.0 - min( ( length( pointVector ) / pointLightDistance[ i ] ), 1.0 );",

						"pointVector = normalize( pointVector );",

						// diffuse

						"#ifdef WRAP_AROUND",

							"float pointDiffuseWeightFull = max( dot( normal, pointVector ), 0.0 );",
							"float pointDiffuseWeightHalf = max( 0.5 * dot( normal, pointVector ) + 0.5, 0.0 );",

							"vec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );",

						"#else",

							"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

						"#endif",

						"pointDiffuse += pointDistance * pointLightColor[ i ] * uDiffuseColor * pointDiffuseWeight;",

						// specular

						"vec3 pointHalfVector = normalize( pointVector + viewPosition );",
						"float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
						"float pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, uShininess ), 0.0 );",

						"#ifdef PHYSICALLY_BASED_SHADING",

							// 2.0 => 2.0001 is hack to work around ANGLE bug

							"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

							"vec3 schlick = specularTex + vec3( 1.0 - specularTex ) * pow( 1.0 - dot( pointVector, pointHalfVector ), 5.0 );",
							"pointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * pointDistance * specularNormalization;",

						"#else",

							"pointSpecular += pointDistance * pointLightColor[ i ] * specularTex * pointSpecularWeight * pointDiffuseWeight;",

						"#endif",

					"}",

				"#endif",

				// directional lights

				"#if MAX_DIR_LIGHTS > 0",

					"vec3 dirDiffuse = vec3( 0.0 );",
					"vec3 dirSpecular = vec3( 0.0 );",

					"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

						"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
						"vec3 dirVector = normalize( lDirection.xyz );",

						// diffuse

						"#ifdef WRAP_AROUND",

							"float directionalLightWeightingFull = max( dot( normal, dirVector ), 0.0 );",
							"float directionalLightWeightingHalf = max( 0.5 * dot( normal, dirVector ) + 0.5, 0.0 );",

							"vec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), wrapRGB );",

						"#else",

							"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

						"#endif",

						"dirDiffuse += directionalLightColor[ i ] * uDiffuseColor * dirDiffuseWeight;",

						// specular

						"vec3 dirHalfVector = normalize( dirVector + viewPosition );",
						"float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );",
						"float dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, uShininess ), 0.0 );",

						"#ifdef PHYSICALLY_BASED_SHADING",

							// 2.0 => 2.0001 is hack to work around ANGLE bug

							"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

							"vec3 schlick = specularTex + vec3( 1.0 - specularTex ) * pow( 1.0 - dot( dirVector, dirHalfVector ), 5.0 );",
							"dirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;",

						"#else",

							"dirSpecular += directionalLightColor[ i ] * specularTex * dirSpecularWeight * dirDiffuseWeight;",

						"#endif",

					"}",

				"#endif",

				// all lights contribution summation

				"vec3 totalDiffuse = vec3( 0.0 );",
				"vec3 totalSpecular = vec3( 0.0 );",

				"#if MAX_DIR_LIGHTS > 0",

					"totalDiffuse += dirDiffuse;",
					"totalSpecular += dirSpecular;",

				"#endif",

				"#if MAX_POINT_LIGHTS > 0",

					"totalDiffuse += pointDiffuse;",
					"totalSpecular += pointSpecular;",

				"#endif",

				"gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor) + totalSpecular;",

				"if ( enableReflection ) {",

					"#ifdef DOUBLE_SIDED",

						"float flipNormal = ( -1.0 + 2.0 * float( gl_FrontFacing ) );",
						
					"#else",

						"float flipNormal = 1.0;",

					"#endif",

					"vec3 wPos = cameraPosition - vViewPosition;",
					"vec3 vReflect = reflect( normalize( wPos ), normal );",

					"vec4 cubeColor = textureCube( tCube, flipNormal*vec3( -vReflect.x, vReflect.yz ) );",

					"#ifdef GAMMA_INPUT",

						"cubeColor.xyz *= cubeColor.xyz;",

					"#endif",

					"gl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularTex.r * uReflectivity );",

				"}",

				THREE.ShaderChunk[ "shadowmap_fragment" ],
				THREE.ShaderChunk[ "linear_to_gamma_fragment" ],
				THREE.ShaderChunk[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertexShader: [

			"attribute vec4 tangent;",

			"uniform vec2 uOffset;",
			"uniform vec2 uRepeat;",

			"#ifdef VERTEX_TEXTURES",

				"uniform sampler2D tDisplacement;",
				"uniform float uDisplacementScale;",
				"uniform float uDisplacementBias;",

			"#endif",

			"varying vec3 vTangent;",
			"varying vec3 vBinormal;",
			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"varying vec3 vViewPosition;",

			THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

			"void main() {",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				"vViewPosition = -mvPosition.xyz;",

				// normal, tangent and binormal vectors

				"vNormal = normalMatrix * normal;",
				"vTangent = normalMatrix * tangent.xyz;",
				"vBinormal = cross( vNormal, vTangent ) * tangent.w;",

				"vUv = uv * uRepeat + uOffset;",

				// displacement mapping

				"#ifdef VERTEX_TEXTURES",

					"vec3 dv = texture2D( tDisplacement, uv ).xyz;",
					"float df = uDisplacementScale * dv.x + uDisplacementBias;",
					"vec4 displacedPosition = vec4( normalize( vNormal.xyz ) * df, 0.0 ) + mvPosition;",
					"gl_Position = projectionMatrix * displacedPosition;",

				"#else",

					"gl_Position = projectionMatrix * mvPosition;",

				"#endif",

				THREE.ShaderChunk[ "shadowmap_vertex" ],

			"}"

		].join("\n")

	},

	/* -------------------------------------------------------------------------
		//	Normal map shader
		//		- Blinn-Phong
		//		- normal + diffuse + specular + AO + displacement + reflection + shadow maps
		//		- PER-VERTEX point and directional lights (use with "lights: true" material option)
		 ------------------------------------------------------------------------- */

		'normalV' : {

			uniforms: THREE.UniformsUtils.merge( [

				THREE.UniformsLib[ "fog" ],
				THREE.UniformsLib[ "lights" ],
				THREE.UniformsLib[ "shadowmap" ],

				{

				"enableAO"		  : { type: "i", value: 0 },
				"enableDiffuse"	  : { type: "i", value: 0 },
				"enableSpecular"  : { type: "i", value: 0 },
				"enableReflection": { type: "i", value: 0 },

				"tDiffuse"	   : { type: "t", value: 0, texture: null },
				"tCube"		   : { type: "t", value: 1, texture: null },
				"tNormal"	   : { type: "t", value: 2, texture: null },
				"tSpecular"	   : { type: "t", value: 3, texture: null },
				"tAO"		   : { type: "t", value: 4, texture: null },
				"tDisplacement": { type: "t", value: 5, texture: null },

				"uNormalScale": { type: "f", value: 1.0 },

				"uDisplacementBias": { type: "f", value: 0.0 },
				"uDisplacementScale": { type: "f", value: 1.0 },

				"uDiffuseColor": { type: "c", value: new THREE.Color( 0xffffff ) },
				"uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
				"uAmbientColor": { type: "c", value: new THREE.Color( 0xffffff ) },
				"uShininess": { type: "f", value: 30 },
				"uOpacity": { type: "f", value: 1 },

				"uReflectivity": { type: "f", value: 0.5 },

				"uOffset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
				"uRepeat" : { type: "v2", value: new THREE.Vector2( 1, 1 ) },

				"wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

				}

			] ),

			fragmentShader: [

				"uniform vec3 uAmbientColor;",
				"uniform vec3 uDiffuseColor;",
				"uniform vec3 uSpecularColor;",
				"uniform float uShininess;",
				"uniform float uOpacity;",

				"uniform bool enableDiffuse;",
				"uniform bool enableSpecular;",
				"uniform bool enableAO;",
				"uniform bool enableReflection;",

				"uniform sampler2D tDiffuse;",
				"uniform sampler2D tNormal;",
				"uniform sampler2D tSpecular;",
				"uniform sampler2D tAO;",

				"uniform samplerCube tCube;",

				"uniform float uNormalScale;",
				"uniform float uReflectivity;",

				"varying vec3 vTangent;",
				"varying vec3 vBinormal;",
				"varying vec3 vNormal;",
				"varying vec2 vUv;",

				"uniform vec3 ambientLightColor;",

				"#if MAX_DIR_LIGHTS > 0",
					"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
					"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
				"#endif",

				"#if MAX_POINT_LIGHTS > 0",
					"uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
					"varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",
				"#endif",

				"#ifdef WRAP_AROUND",
					"uniform vec3 wrapRGB;",
				"#endif",

				"varying vec3 vViewPosition;",

				THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
				THREE.ShaderChunk[ "fog_pars_fragment" ],

				"void main() {",

					"gl_FragColor = vec4( vec3( 1.0 ), uOpacity );",

					"vec3 specularTex = vec3( 1.0 );",

					"vec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;",
					"normalTex.xy *= uNormalScale;",
					"normalTex = normalize( normalTex );",

					"if( enableDiffuse ) {",

						"#ifdef GAMMA_INPUT",

							"vec4 texelColor = texture2D( tDiffuse, vUv );",
							"texelColor.xyz *= texelColor.xyz;",

							"gl_FragColor = gl_FragColor * texelColor;",

						"#else",

							"gl_FragColor = gl_FragColor * texture2D( tDiffuse, vUv );",

						"#endif",

					"}",

					"if( enableAO ) {",

						"#ifdef GAMMA_INPUT",

							"vec4 aoColor = texture2D( tAO, vUv );",
							"aoColor.xyz *= aoColor.xyz;",

							"gl_FragColor.xyz = gl_FragColor.xyz * aoColor.xyz;",

						"#else",

							"gl_FragColor.xyz = gl_FragColor.xyz * texture2D( tAO, vUv ).xyz;",

						"#endif",

					"}",

					"if( enableSpecular )",
						"specularTex = texture2D( tSpecular, vUv ).xyz;",

					"mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );",
					"vec3 finalNormal = tsb * normalTex;",

					"vec3 normal = normalize( finalNormal );",
					"vec3 viewPosition = normalize( vViewPosition );",

					// point lights

					"#if MAX_POINT_LIGHTS > 0",

						"vec3 pointDiffuse = vec3( 0.0 );",
						"vec3 pointSpecular = vec3( 0.0 );",

						"for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {",

							"vec3 pointVector = normalize( vPointLight[ i ].xyz );",
							"float pointDistance = vPointLight[ i ].w;",

							// diffuse

							"#ifdef WRAP_AROUND",

								"float pointDiffuseWeightFull = max( dot( normal, pointVector ), 0.0 );",
								"float pointDiffuseWeightHalf = max( 0.5 * dot( normal, pointVector ) + 0.5, 0.0 );",

								"vec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );",

							"#else",

								"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

							"#endif",

							"pointDiffuse += pointDistance * pointLightColor[ i ] * uDiffuseColor * pointDiffuseWeight;",

							// specular

							"vec3 pointHalfVector = normalize( pointVector + viewPosition );",
							"float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
							"float pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, uShininess ), 0.0 );",

							"#ifdef PHYSICALLY_BASED_SHADING",

								// 2.0 => 2.0001 is hack to work around ANGLE bug

								"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

								"vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( pointVector, pointHalfVector ), 5.0 );",
								"pointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * pointDistance * specularNormalization;",

							"#else",

								"pointSpecular += pointDistance * pointLightColor[ i ] * uSpecularColor * pointSpecularWeight * pointDiffuseWeight;",

							"#endif",

						"}",

					"#endif",

					// directional lights

					"#if MAX_DIR_LIGHTS > 0",

						"vec3 dirDiffuse = vec3( 0.0 );",
						"vec3 dirSpecular = vec3( 0.0 );",

						"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

							"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
							"vec3 dirVector = normalize( lDirection.xyz );",

							// diffuse

							"#ifdef WRAP_AROUND",

								"float directionalLightWeightingFull = max( dot( normal, dirVector ), 0.0 );",
								"float directionalLightWeightingHalf = max( 0.5 * dot( normal, dirVector ) + 0.5, 0.0 );",

								"vec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), wrapRGB );",

							"#else",

								"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

							"#endif",

							"dirDiffuse += directionalLightColor[ i ] * uDiffuseColor * dirDiffuseWeight;",

							// specular

							"vec3 dirHalfVector = normalize( dirVector + viewPosition );",
							"float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );",
							"float dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, uShininess ), 0.0 );",

							"#ifdef PHYSICALLY_BASED_SHADING",

								// 2.0 => 2.0001 is hack to work around ANGLE bug

								"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

								"vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( dirVector, dirHalfVector ), 5.0 );",
								"dirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;",

							"#else",

								"dirSpecular += directionalLightColor[ i ] * uSpecularColor * dirSpecularWeight * dirDiffuseWeight;",

							"#endif",

						"}",

					"#endif",

					// all lights contribution summation

					"vec3 totalDiffuse = vec3( 0.0 );",
					"vec3 totalSpecular = vec3( 0.0 );",

					"#if MAX_DIR_LIGHTS > 0",

						"totalDiffuse += dirDiffuse;",
						"totalSpecular += dirSpecular;",

					"#endif",

					"#if MAX_POINT_LIGHTS > 0",

						"totalDiffuse += pointDiffuse;",
						"totalSpecular += pointSpecular;",

					"#endif",

					"gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor) + totalSpecular;",

					"if ( enableReflection ) {",

						"vec3 wPos = cameraPosition - vViewPosition;",
						"vec3 vReflect = reflect( normalize( wPos ), normal );",

						"vec4 cubeColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",

						"#ifdef GAMMA_INPUT",

							"cubeColor.xyz *= cubeColor.xyz;",

						"#endif",

						"gl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularTex.r * uReflectivity );",

					"}",

					THREE.ShaderChunk[ "shadowmap_fragment" ],
					THREE.ShaderChunk[ "linear_to_gamma_fragment" ],
					THREE.ShaderChunk[ "fog_fragment" ],

				"}"

			].join("\n"),

			vertexShader: [

				"attribute vec4 tangent;",

				"uniform vec2 uOffset;",
				"uniform vec2 uRepeat;",

				"#ifdef VERTEX_TEXTURES",

					"uniform sampler2D tDisplacement;",
					"uniform float uDisplacementScale;",
					"uniform float uDisplacementBias;",

				"#endif",

				"varying vec3 vTangent;",
				"varying vec3 vBinormal;",
				"varying vec3 vNormal;",
				"varying vec2 vUv;",

				"#if MAX_POINT_LIGHTS > 0",

					"uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
					"uniform float pointLightDistance[ MAX_POINT_LIGHTS ];",

					"varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",

				"#endif",

				"varying vec3 vViewPosition;",

				THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

				"void main() {",

					"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

					"vViewPosition = -mvPosition.xyz;",

					// normal, tangent and binormal vectors

					"vNormal = normalMatrix * normal;",
					"vTangent = normalMatrix * tangent.xyz;",
					"vBinormal = cross( vNormal, vTangent ) * tangent.w;",

					"vUv = uv * uRepeat + uOffset;",

					// point lights

					"#if MAX_POINT_LIGHTS > 0",

						"for( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {",

							"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
							"vec3 lVector = lPosition.xyz - mvPosition.xyz;",

							"float lDistance = 1.0;",
							"if ( pointLightDistance[ i ] > 0.0 )",
								"lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );",

							"lVector = normalize( lVector );",

							"vPointLight[ i ] = vec4( lVector, lDistance );",

						"}",

					"#endif",

					// displacement mapping

					"#ifdef VERTEX_TEXTURES",

						"vec3 dv = texture2D( tDisplacement, uv ).xyz;",
						"float df = uDisplacementScale * dv.x + uDisplacementBias;",
						"vec4 displacedPosition = vec4( normalize( vNormal.xyz ) * df, 0.0 ) + mvPosition;",
						"gl_Position = projectionMatrix * displacedPosition;",

					"#else",

						"gl_Position = projectionMatrix * mvPosition;",

					"#endif",

					THREE.ShaderChunk[ "shadowmap_vertex" ],

				"}"

			].join("\n")

		},

	/* -------------------------------------------------------------------------
	//	Cube map shader
	 ------------------------------------------------------------------------- */

	'cube': {

		uniforms: { "tCube": { type: "t", value: 1, texture: null },
					"tFlip": { type: "f", value: -1 } },

		vertexShader: [

			"varying vec3 vViewPosition;",

			"void main() {",

				"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
				"vViewPosition = cameraPosition - mPosition.xyz;",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform samplerCube tCube;",
			"uniform float tFlip;",

			"varying vec3 vViewPosition;",

			"void main() {",

				"vec3 wPos = cameraPosition - vViewPosition;",
				"gl_FragColor = textureCube( tCube, vec3( tFlip * wPos.x, wPos.yz ) );",

			"}"

		].join("\n")

	}

};