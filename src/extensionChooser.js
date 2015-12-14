function extensionChooser(supportedExtensions) {
    supportedExtensions = supportedExtensions || [];

    return function (resource, next) {
        var ext = resource.metadata.choice;
        if (!ext) {
            return next();
        }
        //let us choose extension!
        var url = resource.url;
        if (!resource._defaultUrlChoice) {
            resource._defaultUrlChoice = url;
            var k = url.lastIndexOf(".");
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
                    resource.loadType = resource._determineLoadType();
                    return next();
                }
            }
        }
        next();
    };
}

module.exports = extensionChooser;
