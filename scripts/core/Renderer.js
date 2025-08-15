class Renderer {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.isInitialized = false;
        this.clearColor = [0.1, 0.1, 0.1, 1.0];
        this.viewport = { width: 0, height: 0 };
        this.camera = null;
        this.scene = null;
        this.shaders = new Map();
        this.textures = new Map();
        this.meshes = new Map();
        this.materials = new Map();
    }

    async initialize(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        this.viewport.width = canvas.width;
        this.viewport.height = canvas.height;
        
        // Set up WebGL state
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.clearColor(...this.clearColor);
        
        // Create default shaders
        await this.createDefaultShaders();
        
        this.isInitialized = true;
        console.log('✅ Renderer initialized');
    }

    async createDefaultShaders() {
        // Basic vertex shader
        const vertexShaderSource = `
            attribute vec3 a_position;
            attribute vec3 a_normal;
            attribute vec2 a_texCoord;
            
            uniform mat4 u_modelViewMatrix;
            uniform mat4 u_projectionMatrix;
            uniform mat3 u_normalMatrix;
            
            varying vec3 v_normal;
            varying vec2 v_texCoord;
            varying vec3 v_position;
            
            void main() {
                v_position = vec3(u_modelViewMatrix * vec4(a_position, 1.0));
                v_normal = u_normalMatrix * a_normal;
                v_texCoord = a_texCoord;
                gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
            }
        `;

        // Basic fragment shader
        const fragmentShaderSource = `
            precision mediump float;
            
            varying vec3 v_normal;
            varying vec2 v_texCoord;
            varying vec3 v_position;
            
            uniform vec3 u_lightPosition;
            uniform vec3 u_lightColor;
            uniform vec3 u_materialColor;
            uniform sampler2D u_texture;
            
            void main() {
                vec3 normal = normalize(v_normal);
                vec3 lightDir = normalize(u_lightPosition - v_position);
                float diff = max(dot(normal, lightDir), 0.0);
                vec3 diffuse = diff * u_lightColor;
                vec3 ambient = 0.1 * u_lightColor;
                vec3 color = (ambient + diffuse) * u_materialColor;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        this.shaders.set('basic', {
            program: this.createShaderProgram(vertexShaderSource, fragmentShaderSource),
            attributes: {
                position: this.gl.getAttribLocation(this.shaders.get('basic').program, 'a_position'),
                normal: this.gl.getAttribLocation(this.shaders.get('basic').program, 'a_normal'),
                texCoord: this.gl.getAttribLocation(this.shaders.get('basic').program, 'a_texCoord')
            },
            uniforms: {
                modelViewMatrix: this.gl.getUniformLocation(this.shaders.get('basic').program, 'u_modelViewMatrix'),
                projectionMatrix: this.gl.getUniformLocation(this.shaders.get('basic').program, 'u_projectionMatrix'),
                normalMatrix: this.gl.getUniformLocation(this.shaders.get('basic').program, 'u_normalMatrix'),
                lightPosition: this.gl.getUniformLocation(this.shaders.get('basic').program, 'u_lightPosition'),
                lightColor: this.gl.getUniformLocation(this.shaders.get('basic').program, 'u_lightColor'),
                materialColor: this.gl.getUniformLocation(this.shaders.get('basic').program, 'u_materialColor'),
                texture: this.gl.getUniformLocation(this.shaders.get('basic').program, 'u_texture')
            }
        });
    }

    createShaderProgram(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error('Shader program link error: ' + this.gl.getProgramInfoLog(program));
        }
        
        return program;
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error('Shader compile error: ' + this.gl.getShaderInfoLog(shader));
        }
        
        return shader;
    }

    setViewport(width, height) {
        this.viewport.width = width;
        this.viewport.height = height;
        this.gl.viewport(0, 0, width, height);
    }

    setClearColor(r, g, b, a = 1.0) {
        this.clearColor = [r, g, b, a];
        this.gl.clearColor(r, g, b, a);
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    render(scene, camera) {
        if (!this.isInitialized || !scene || !camera) return;
        
        this.clear();
        
        // Update camera matrices
        camera.updateMatrices();
        
        // Render all objects in scene
        for (const object of scene.objects) {
            if (object.visible && object.mesh && object.material) {
                this.renderObject(object, camera);
            }
        }
    }

    renderObject(object, camera) {
        const shader = this.shaders.get('basic');
        this.gl.useProgram(shader.program);
        
        // Set matrices
        const modelViewMatrix = this.multiplyMatrices(camera.viewMatrix, object.transform.getMatrix());
        const normalMatrix = this.calculateNormalMatrix(modelViewMatrix);
        
        this.gl.uniformMatrix4fv(shader.uniforms.modelViewMatrix, false, modelViewMatrix);
        this.gl.uniformMatrix4fv(shader.uniforms.projectionMatrix, false, camera.projectionMatrix);
        this.gl.uniformMatrix3fv(shader.uniforms.normalMatrix, false, normalMatrix);
        
        // Set material properties
        this.gl.uniform3fv(shader.uniforms.materialColor, object.material.color);
        this.gl.uniform3fv(shader.uniforms.lightPosition, [0, 10, 0]);
        this.gl.uniform3fv(shader.uniforms.lightColor, [1, 1, 1]);
        
        // Bind mesh data
        this.bindMesh(object.mesh);
        
        // Draw
        this.gl.drawElements(this.gl.TRIANGLES, object.mesh.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }

    bindMesh(mesh) {
        const shader = this.shaders.get('basic');
        
        // Bind vertex buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vertexBuffer);
        this.gl.vertexAttribPointer(shader.attributes.position, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(shader.attributes.position);
        
        // Bind normal buffer
        if (mesh.normalBuffer) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
            this.gl.vertexAttribPointer(shader.attributes.normal, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(shader.attributes.normal);
        }
        
        // Bind texture coordinate buffer
        if (mesh.texCoordBuffer) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.texCoordBuffer);
            this.gl.vertexAttribPointer(shader.attributes.texCoord, 2, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(shader.attributes.texCoord);
        }
        
        // Bind index buffer
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    }

    createMesh(vertices, indices, normals = null, texCoords = null) {
        const mesh = {
            vertexBuffer: this.gl.createBuffer(),
            indexBuffer: this.gl.createBuffer(),
            indexCount: indices.length,
            normalBuffer: null,
            texCoordBuffer: null
        };
        
        // Create vertex buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        
        // Create index buffer
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
        
        // Create normal buffer
        if (normals) {
            mesh.normalBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
        }
        
        // Create texture coordinate buffer
        if (texCoords) {
            mesh.texCoordBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.texCoordBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);
        }
        
        return mesh;
    }

    createCubeMesh() {
        const vertices = [
            // Front face
            -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,  1,
            // Back face
            -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1, -1,
            // Top face
            -1,  1, -1, -1,  1,  1,  1,  1,  1,  1,  1, -1,
            // Bottom face
            -1, -1, -1,  1, -1, -1,  1, -1,  1, -1, -1,  1,
            // Right face
             1, -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,
            // Left face
            -1, -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1
        ];
        
        const indices = [
            0,  1,  2,    0,  2,  3,   // front
            4,  5,  6,    4,  6,  7,   // back
            8,  9,  10,   8,  10, 11,  // top
            12, 13, 14,   12, 14, 15,  // bottom
            16, 17, 18,   16, 18, 19,  // right
            20, 21, 22,   20, 22, 23   // left
        ];
        
        const normals = [
            // Front
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            // Back
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
            // Top
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
            // Bottom
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            // Right
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            // Left
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
        ];
        
        return this.createMesh(vertices, indices, normals);
    }

    createSphereMesh(radius = 1, segments = 16) {
        const vertices = [];
        const indices = [];
        const normals = [];
        
        for (let lat = 0; lat <= segments; lat++) {
            const theta = lat * Math.PI / segments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            
            for (let lon = 0; lon <= segments; lon++) {
                const phi = lon * 2 * Math.PI / segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                
                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;
                
                vertices.push(radius * x, radius * y, radius * z);
                normals.push(x, y, z);
            }
        }
        
        for (let lat = 0; lat < segments; lat++) {
            for (let lon = 0; lon < segments; lon++) {
                const first = lat * (segments + 1) + lon;
                const second = first + segments + 1;
                
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
        
        return this.createMesh(vertices, indices, normals);
    }

    // Matrix utilities
    multiplyMatrices(a, b) {
        const result = new Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = 
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
        return result;
    }

    calculateNormalMatrix(modelViewMatrix) {
        // Extract 3x3 normal matrix from 4x4 model-view matrix
        const normalMatrix = new Array(9);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                normalMatrix[i * 3 + j] = modelViewMatrix[i * 4 + j];
            }
        }
        return normalMatrix;
    }

    dispose() {
        if (this.gl) {
            // Clean up WebGL resources
            this.shaders.forEach(shader => {
                this.gl.deleteProgram(shader.program);
            });
            this.shaders.clear();
            
            this.meshes.forEach(mesh => {
                this.gl.deleteBuffer(mesh.vertexBuffer);
                this.gl.deleteBuffer(mesh.indexBuffer);
                if (mesh.normalBuffer) this.gl.deleteBuffer(mesh.normalBuffer);
                if (mesh.texCoordBuffer) this.gl.deleteBuffer(mesh.texCoordBuffer);
            });
            this.meshes.clear();
        }
    }
}

window.Renderer = Renderer;