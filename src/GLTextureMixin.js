var CompressedImage = require('./CompressedImage');
var GLTexture = PIXI.glCore.GLTexture;

/**
 * @mixin
 */
var GLTextureMixin = {
    uploadNotCompressed: GLTexture.prototype.upload,
    isCompressed: false,
    upload: function(source)
    {   
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
        if (this.isCompressed) {
            return;
        }
        var gl = this.gl;

        this.bind();

        this.mipmap = true;

        gl.generateMipmap(gl.TEXTURE_2D);
    }
};

module.exports = GLTextureMixin;
