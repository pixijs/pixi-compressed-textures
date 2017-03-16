var core = PIXI,
    CompressedImage = require('./CompressedImage'),
    WebGLManager = core.WebGLManager;
/**
 * @class
 * @memberof PIXI.compressedTextures
 * @extends PIXI.WebGLManager
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function CompressedTextureManager(renderer) {
    WebGLManager.call(this, renderer);
    this.extensions = {};
}

CompressedTextureManager.prototype = Object.create(WebGLManager.prototype);
CompressedTextureManager.prototype.constructor = CompressedTextureManager;

CompressedTextureManager.prototype.onContextChange = function() {
    const gl = this.renderer.gl;
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

    this.extensions = {
        dxt: getExtension(gl, "WEBGL_compressed_texture_s3tc"),
        pvrtc: getExtension(gl, "WEBGL_compressed_texture_pvrtc"),
        atc: getExtension(gl, "WEBGL_compressed_texture_atc")
    };
    // CRN exists only with DXT!
    this.extensions.crn = this.extensions.dxt;
};

module.exports = CompressedTextureManager;

core.WebGLRenderer.registerPlugin('compressedTextureManager', CompressedTextureManager);

CompressedTextureManager.prototype.getSupportedExtensions = function () {
    return this.extensions;
};
