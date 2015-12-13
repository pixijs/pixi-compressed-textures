var core = PIXI,
    utils = core.utils,
    extensionFixer = require('./CompressedImage');

function textureExtensionFixer(supportedExtensions) {
    return function (resource, next) {
        if (resource.texture && resource._defaultUrlChoice && resource._defaultUrl != resource.url) {
            var texture = resource.texture;
            var baseTexture = texture.baseTexture;
            delete utils.BaseTextureCache[baseTexture.imageUrl];
            delete utils.TextureCache[baseTexture.imageUrl];
            baseTexture.imageUrl = resource._defaultUrlChoice;
            core.utils.BaseTextureCache[baseTexture.imageUrl] = baseTexture;
            core.utils.TextureCache[baseTexture.imageUrl] = texture;
        }
        next();
    }
}

module.exports = textureExtensionFixer;
