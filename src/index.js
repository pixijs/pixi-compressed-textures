var compressedTextures = {
    CompressedTextureManager: require('./CompressedTextureManager.js'),
    imageParser: require('./imageParser.js'),
    extensionChooser: require('./extensionChooser.js'),
    extensionFixer: require('./extensionFixer.js'),
    detectExtensions: function (renderer, resolution) {
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

PIXI.loaders.Loader.addPixiMiddleware(compressedTextures.extensionFixer);
PIXI.loader.use(compressedTextures.extensionFixer());

module.exports = global.PIXI.compressedTextures = compressedTextures;
