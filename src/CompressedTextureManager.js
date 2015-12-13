/**
 * Created by Liza on 12.12.2015.
 */

var core = PIXI,
    CompressedImage = require('./CompressedImage'),
    WebGLManager = core.WebGLManager;
/**
 * @class
 * @memberof PIXI.compressedTextures
 * @extends PIXI.WebGlManager
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function CompressedTextureManager(renderer) {
    WebGLManager.call(this, renderer);
}

CompressedTextureManager.prototype.getSupportedExtensions = function () {
    function getExtension(gl, name) {
        var vendorPrefixes = ["", "WEBKIT_", "MOZ_"];
        var ext = null;
        for (var i in vendorPrefixes) {
            ext = gl.getExtension(vendorPrefixes[i] + name);
            if (ext) {
                break;
            }
        }
        return ext;
    }

    return {
        dxt: getExtension(gl, "WEBGL_compressed_texture_s3tc"),
        pvrtc: getExtension(gl, "WEBGL_compressed_texture_pvrtc"),
        atc: getExtension(gl, "WEBGL_compressed_texture_atc")
    }
};

CompressedTextureManager.prototype = Object.create(WebGLManager.prototype);
CompressedTextureManager.prototype.constructor = CompressedTextureManager;
module.exports = CompressedTextureManager;

core.ShaderManager.registerPlugin('compressedTextureManager', CompressedTextureManager);

CompressedTextureManager.prototype.updateTexture = function (texture, removeSource) {
    var renderer = this.renderer;
    var gl = this.renderer.gl;
    var source = texture.source;
    if (!(source instanceof CompressedImage)) {
        throw "Not a compressed image";
    }
    if (!texture._glTextures[gl.id]) {
        texture._glTextures[gl.id] = gl.createTexture();
        texture.on('dispose', renderer.destroyTexture, renderer);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha);
    source.generateWebGLTexture(gl, !removeSource);
};

CompressedTextureManager.prototype.updateAllCompressedTextures = function (resources, removeSource) {
    for (var key in resources) {
        var resource = resources[key];
        if (resource.isCompressedImage) {
            this.updateTexture(resource.texture, removeSource);
        }
    }
};

CompressedTextureManager.prototype.updateAllTextures = function (resources, removeSource) {
    for (var key in resources) {
        var resource = resources[key];
        if (resource.isCompressedImage) {
            this.updateTexture(resource.texture);
        } else if (resource.isImage) {
            renderer.updateTexture(resource.texture);
        }
    }
};