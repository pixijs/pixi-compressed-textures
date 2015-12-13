var core = PIXI,
    utils = core.utils,
    CompressedImage = require('./CompressedImage');

function compressedTextureParser(supportedExtensions) {
    supportedExtensions = supportedExtensions || [];

    return function (resource, next) {
        resource.isCompressedImage = false;
        if(resource.xhr && resource.xhrType === Resource.XHR_RESPONSE_TYPE.BUFFER){
            if(resource.url.indexOf('.dds') != -1 || resource.url.indexOf('.pvr') != -1)
            {
                var baseTexture = new core.BaseTexture(resource.data, null, core.utils.getResolutionOfUrl(resource.url));
                baseTexture.imageUrl = resource.url;

                resource.texture = new PIXI.Texture(baseTexture);
                resource.data = null;
                resource.isCompressedImage = true;

                utils.BaseTextureCache[baseTexture.imageUrl] = baseTexture;
                utils.TextureCache[baseTexture.imageUrl] = resource.texture;
            }
        }
        next();
    }
}

module.exports = compressedTextureParser;
