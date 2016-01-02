var core = PIXI,
    utils = core.utils,
    CompressedImage = require('./CompressedImage'),
    Resource = core.loaders.Resource;

Resource.setExtensionXhrType('dds', Resource.XHR_RESPONSE_TYPE.BUFFER);
Resource.setExtensionXhrType('pvr', Resource.XHR_RESPONSE_TYPE.BUFFER);

function imageParser() {
    return function (resource, next) {
        if (resource.url.indexOf('.dds') != -1 || resource.url.indexOf('.pvr') != -1) {
            var compressedImage = resource.compressedImage || new CompressedImage(resource.url);
            if (resource.data) {
                throw "compressedImageParser middleware must be specified in loader.before() and must have zero resource.data";
            }
            resource.isCompressedImage = true;
            resource.data = compressedImage;
            resource.once('complete', function() {
                resource.isImage = true;
                compressedImage.loadFromArrayBuffer(resource.data);
                resource.data = compressedImage;
            });
        }
        next();
    }
}

module.exports = imageParser;
