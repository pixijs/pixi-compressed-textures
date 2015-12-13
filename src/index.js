var compressedTextures = {
    CompressedTextureManager: require('./CompressedTextureManager.js'),
    compressedImageParser: require('./compressedImageParser.js'),
    extensionChooser: require('./extensionChooser.js'),
    extensionFixer: require('./extensionFixer.js'),
    detectExtensions: function(renderer) {
        if (renderer instanceof PIXI.WebGLRenderer) {
            var data = renderer.plugins['compressedTextureManager'].getSupportedExtensions();
            if (data.dxt) extensions.push('.dxt');
            if (data.pvrtc) extensions.push('.pvr');
            if (data.atc) extensions.push('.atc');
        } else if (renderer instanceof PIXI.CanvasRenderer) {
            //nothing special for canvas
        }
        //retina!
        if (renderer.resolution == 2 ) {
            var ext = extensions.slice(0);
            while (ext.length>0) {
                extensions.push("@2x"+ext.pop());
            }
            extensions.push("@2x.png");
            extensions.push("@2x.jpg");
        }
    }
};

PIXI.loaders.Loader.addPixiMiddleware(compressedTextures.compressedImageParser);
PIXI.loaders.Loader.addPixiMiddleware(compressedTextures.extensionFixer);
PIXI.loader.use(compressedTextures.compressedImageParser());
PIXI.loader.use(compressedTextures.extensionFixer());

module.exports = global.PIXI.compressedTextures = compressedTextures;
