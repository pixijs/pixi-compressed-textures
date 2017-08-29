var plugin = {
    CompressedImage: require('./CompressedImage'),
    CompressedTextureManager: require('./CompressedTextureManager'),
    imageParser: require('./imageParser'),
    extensionChooser: require('./extensionChooser'),
    extensionFixer: require('./extensionFixer'),
    GLTextureMixin: require('./GLTextureMixin'),
    detectExtensions: function (renderer, resolution) {
        var extensions = [];
        if (renderer instanceof PIXI.WebGLRenderer) {
            var data = renderer.plugins.compressedTextureManager.getSupportedExtensions();
            if (data.dxt) extensions.push('.dds');
            if (data.pvrtc) extensions.push('.pvr');
            if (data.atc) extensions.push('.atc');
            if (data.astc) extensions.push('.astc');
        } else if (renderer instanceof PIXI.CanvasRenderer) {
            //nothing special for canvas
        }
        //retina or not
        resolution = resolution || renderer.resolution;
        var res = "@"+resolution+"x";
        var ext = extensions.slice(0);
        while (ext.length > 0) {
            extensions.push(res + ext.pop());
        }
        extensions.push(res + ".png");
        extensions.push(res + ".jpg");
        //atlas support @1x @2x @.5x
        extensions.push(res + ".json");
        extensions.push(res + ".atlas");
        return extensions;
    }
};

try {
    plugin.crn = require('./../lib/crn_decomp');
} catch (e) {
    //oh well, couldn't require it - probably due to eval() not being allowed in whatever context
    //we are loaded in
    console.warn('Unable to load crn decompression in pixi-compressed-textures');
}

Object.assign(PIXI.glCore.GLTexture.prototype, plugin.GLTextureMixin);

PIXI.loaders.Loader.addPixiMiddleware(plugin.extensionFixer);
PIXI.loader.use(plugin.extensionFixer());

module.exports = global.PIXI.compressedTextures = plugin;
