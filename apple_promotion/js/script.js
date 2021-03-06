var main = function() {
    var CANVAS = document.getElementById("your_canvas");

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    /*========================= CAPTURE MOUSE EVENTS ========================= */

    var AMORTIZATION = 0.95;
    var drag = false;
    var old_x, old_y;
    var dX = 0,
        dY = 0;

    var mouseDown = function(e) {
        drag = true;
        e.preventDefault();
        e = (e.touches && e.touches[0]) || e;
        old_x = e.pageX, old_y = e.pageY;
        return false;
    }

    var mouseUp = function(e) {
        drag = false;
    }

    var mouseMove = function(e) {
        if (!drag) return false;
        e.preventDefault();
        e = (e.touches && e.touches[0]) || e;
        dX = (e.pageX - old_x) * Math.PI / CANVAS.width, dY = (e.pageY - old_y) * Math.PI / CANVAS.height;
        THETA += dX;
        PHI += dY;
        old_x = e.pageX, old_y = e.pageY;
    }

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);


    CANVAS.addEventListener("touchstart", mouseDown, false);
    CANVAS.addEventListener("touchend", mouseUp, false);
    CANVAS.addEventListener("touchmove", mouseMove, false);
    /*========================= GET WEBGL CONTEXT ========================= */
    try {
        var GL = CANVAS.getContext("experimental-webgl", {
            antialias: true
        });
    } catch (e) {
        alert("You are not webgl compatible :(");
        return false;
    };

    /*========================= SHADERS ========================= */

    var shader_vertex_source = "\n\
attribute vec3 position;\n\
uniform mat4 Pmatrix;\n\
uniform mat4 Vmatrix;\n\
uniform mat4 Mmatrix;\n\
attribute vec2 uv;\n\
varying vec2 vUV;\n\
void main(void) { //pre-built function\n\
gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);\n\
vUV=uv;\n\
}";

    var shader_fragment_source = "\n\
precision mediump float;\n\
uniform sampler2D sampler;\n\
varying vec2 vUV;\n\
\n\
\n\
void main(void) {\n\
gl_FragColor = texture2D(sampler, vUV);\n\
}";

    var get_shader = function(source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN " + typeString + " SHADER : " + GL.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    };

    var shader_vertex = get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
    var shader_fragment = get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

    var SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);

    GL.linkProgram(SHADER_PROGRAM);

    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

    var _sampler = GL.getUniformLocation(SHADER_PROGRAM, "sampler");
    var _uv = GL.getAttribLocation(SHADER_PROGRAM, "uv");
    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

    GL.enableVertexAttribArray(_uv);
    GL.enableVertexAttribArray(_position);

    GL.useProgram(SHADER_PROGRAM);
    GL.uniform1i(_sampler, 0);

    /*========================= THE CUBE ========================= */
    //POINTS :
    var cube_vertex = [-1, -1, -1, 0, 0,
        1, -1, -1, 1, 0,
        1, 1, -1, 1, 1, -1, 1, -1, 0, 1,

        -1, -1, 1, 0, 0,
        1, -1, 1, 1, 0,
        1, 1, 1, 1, 1, -1, 1, 1, 0, 1,

        -1, -1, -1, 0, 0, -1, 1, -1, 1, 0, -1, 1, 1, 1, 1, -1, -1, 1, 0, 1,

        1, -1, -1, 0, 0,
        1, 1, -1, 1, 0,
        1, 1, 1, 1, 1,
        1, -1, 1, 0, 1,

        -1, -1, -1, 0, 0, -1, -1, 1, 1, 0,
        1, -1, 1, 1, 1,
        1, -1, -1, 0, 1,

        -1, 1, -1, 0, 0, -1, 1, 1, 1, 0,
        1, 1, 1, 1, 1,
        1, 1, -1, 0, 1
    ];

    var CUBE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER,
        new Float32Array(cube_vertex),
        GL.STATIC_DRAW);

    //FACES :
    var cube_faces = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,

        20, 21, 22,
        20, 22, 23

    ];
    var CUBE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(cube_faces),
        GL.STATIC_DRAW);

    /*========================= MATRIX ========================= */

    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -6);
    console.log(PROJMATRIX);
    var THETA = 0.43940853454859624,
        PHI = -0.712687691043783;

    /*========================= TEXTURES ========================= */
    //var video=document.getElementById("bunny_video");

    var video = document.createElement("video");
    video.autoplay = "autoplay";
    video.controls = "controls";
    video.setAttribute("webkit-playsinline", "true"); //解决微信可以不用全屏播放
    var webmsource = document.createElement("source");
    webmsource.type = "video/webm";
    webmsource.src = "./ressources/bunny.webm";
    var mp4source = document.createElement("source");
    mp4source.type = "video/mp4";
    mp4source.src = "./ressources/640.mp4";
    video.appendChild(webmsource);
    video.appendChild(mp4source);
    video.load();

    var videodata = {
        win: {
            start: 0,
            length: 10
        }
    };
    video.addEventListener("play", function(event) {
        videodata["win"]["length"] = this.duration - 31;
    });
    video.addEventListener("ended", function(event) {
        video.load();
        video.play();
    });
    // video.addEventListener("timeupdate",function(event){
    //     console.log(this.currentTime,videodata.win.start + videodata.win.length);
    //     if (this.currentTime >= videodata.win.start + videodata.win.length) {
    //         this.pause();
    //         this.currentTime = 1;
    //         this.play();
    //     }
    // });
    video.play();
    var texture = GL.createTexture();
    GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
    GL.bindTexture(GL.TEXTURE_2D, texture);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);

    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.bindTexture(GL.TEXTURE_2D, null);

    var refresh_texture = function() {
        GL.bindTexture(GL.TEXTURE_2D, texture);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, video);
    }


    /*========================= DRAWING ========================= */
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0.0, 0.0, 0.0, 0.0);
    GL.clearDepth(1.0);

    var time_old = 0;
    var animate = function(time) {
        var dt = time - time_old;
        if (!drag) {
            dX *= AMORTIZATION, dY *= AMORTIZATION;
            THETA += dX, PHI += dY;
        }
        LIBS.set_I4(MOVEMATRIX);

        LIBS.rotateY(MOVEMATRIX, THETA);
        LIBS.rotateX(MOVEMATRIX, PHI);
        time_old = time;

        GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

        if (video.currentTime > 0) {
            GL.activeTexture(GL.TEXTURE0);
            refresh_texture();
        }

        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 2), 0);
        GL.vertexAttribPointer(_uv, 2, GL.FLOAT, false, 4 * (3 + 2), 3 * 4);
        GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
        GL.drawElements(GL.TRIANGLES, 6 * 2 * 3, GL.UNSIGNED_SHORT, 0);

        GL.flush();
        window.requestAnimationFrame(animate);
    }
    animate(0);
}