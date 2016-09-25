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

CompressedTextureManager.prototype = Object.create(WebGLManager.prototype);
CompressedTextureManager.prototype.constructor = CompressedTextureManager;
module.exports = CompressedTextureManager;

core.WebGLRenderer.registerPlugin('compressedTextureManager', CompressedTextureManager);

CompressedTextureManager.prototype.getSupportedExtensions = function () {
    var gl = this.renderer.gl;
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
    };
};
