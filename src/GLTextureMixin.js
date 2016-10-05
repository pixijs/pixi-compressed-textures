var CompressedImage = require('./CompressedImage');
var GLTexture = PIXI.glCore.GLTexture;

/**
 * @mixin
 */
var GLTextureMixin = {
    source: null,
    uploadNotCompressed: GLTexture.uploadNotCompressed,
    isCompressed: false,
    upload: function(source)
    {
        this.source = source;
        
        if (!(source instanceof CompressedImage)) {
            return this.uploadNotCompressed(source);
        }
        this.bind();

        var gl = this.gl;

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);

        this.isCompressed = true;

        source.generateWebGLTexture(gl, true);
    },

    enableMipmap: function() {
        if (this.source.isCompressed) {
            return;
        }
        var gl = this.gl;

        this.bind();

        this.mipmap = true;

        gl.generateMipmap(gl.TEXTURE_2D);
    }
};

module.exports = GLTextureMixin;
