var core = PIXI,
    utils = core.utils,
    CompressedImage = require('./CompressedImage'),
    Resource = core.loaders.Resource;

Resource.setExtensionXhrType('dds', Resource.XHR_RESPONSE_TYPE.BUFFER);
Resource.setExtensionXhrType('crn', Resource.XHR_RESPONSE_TYPE.BUFFER);
Resource.setExtensionXhrType('pvr', Resource.XHR_RESPONSE_TYPE.BUFFER);
Resource.setExtensionXhrType('etc1', Resource.XHR_RESPONSE_TYPE.BUFFER);

function imageParser() {
    return function (resource, next) {
        if (resource.url.indexOf('.crn') != -1 || resource.url.indexOf('.dds') != -1 || resource.url.indexOf('.pvr') != -1 || resource.url.indexOf('.etc1') != -1) {
            var compressedImage = resource.compressedImage || new CompressedImage(resource.url);
            if (resource.data) {
                throw "compressedImageParser middleware must be specified in loader.before() and must have zero resource.data";
            }
            resource.isCompressedImage = true;
            resource.data = compressedImage;
            resource.onComplete.add(function() {
                resource.type = Resource.TYPE.IMAGE;
                compressedImage.loadFromArrayBuffer(resource.data, resource.url.includes(".crn"));
                resource.data = compressedImage;
            });
        }
        next();
    };
}

module.exports = imageParser;
