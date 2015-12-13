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
            var url = baseUrl + ext[i];
            for (var j = 0; j < supportedExtensions.length; j++) {
                var se = supportedExtensions[j];
                if (url.length >= se.length && url.substring(url.length - se.length) == se) {
                    resource.url = url;
                    return next();
                }
            }
        }
        next();
    }
}

module.exports = extensionChooser;
