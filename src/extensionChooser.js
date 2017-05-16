function extensionChooser(supportedExtensions) {
    supportedExtensions = supportedExtensions || [];

    var imageParser = require('./imageParser')();

    return function (resource, next) {
        var ext = resource.metadata.choice;
        if (!ext) {
            return next();
        }
        //let us choose extension!
        var url = resource.url;
        var k = 0;
        if (!resource._defaultUrlChoice) {
            resource._defaultUrlChoice = url;
            k = url.lastIndexOf(".");
            if (k >= 0) {
                resource._baseUrl = url.substring(0, k);
            } else {
                return next();
            }
        }
        for (var i = ext.length - 1; i >= 0; i--) {
            url = resource._baseUrl + ext[i];
            var isSupported = false;
            for (var j = 0; j < supportedExtensions.length; j++) {
                if (ext[i] === supportedExtensions[j]) {
                    resource.url = url;

                    var pureExt = ext[i];
                    k = ext[i].indexOf('.');
                    if (k>=0) pureExt = ext[i].substring(k+1);

                    resource.extension = pureExt;
                    resource.loadType = resource._determineLoadType();
                    return imageParser(resource, next);
                }
            }
        }
        return imageParser(resource, next);
    };
}

module.exports = extensionChooser;
