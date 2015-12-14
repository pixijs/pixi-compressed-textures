var compressedTextures = {
    CompressedTextureManager: require('./CompressedTextureManager.js'),
    compressedImageParser: require('./compressedImageParser.js'),
    extensionChooser: require('./extensionChooser.js'),
    extensionFixer: require('./extensionFixer.js'),
    detectExtensions: function (renderer) {
        var extensions = [];
        if (renderer instanceof PIXI.WebGLRenderer) {
            var data = renderer.plugins.compressedTextureManager.getSupportedExtensions();
            if (data.dxt) extensions.push('.dds');
            if (data.pvrtc) extensions.push('.pvr');
            if (data.atc) extensions.push('.atc');
        } else if (renderer instanceof PIXI.CanvasRenderer) {
            //nothing special for canvas
        }
        //retina or not
        var res = "@"+renderer.resolution+"x";
        var ext = extensions.slice(0);
        while (ext.length > 0) {
            extensions.push(res + ext.pop());
        }
        extensions.push(res + ".png");
        extensions.push(res + ".jpg");
        //atlas support @1x @2x
        extensions.push(res + ".json");
        return extensions;
    }
};

PIXI.loaders.Loader.addPixiMiddleware(compressedTextures.compressedImageParser);
PIXI.loaders.Loader.addPixiMiddleware(compressedTextures.extensionFixer);
PIXI.loader.use(compressedTextures.compressedImageParser());
PIXI.loader.use(compressedTextures.extensionFixer());

module.exports = global.PIXI.compressedTextures = compressedTextures;
