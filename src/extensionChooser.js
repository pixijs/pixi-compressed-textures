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
                    if (pureExt.indexOf('@') > -1){
                        //@0.5x.dds should have pureExt "dds", not 5x.dds
                        // -> remove format specifier (@2x, @0.5x) before
                        //determining the extension
                        pureExt=pureExt.replace(/@[0-9.]*x/,""); 
                    }
                    k = pureExt.indexOf('.');
                    if (k >= 0){
                        pureExt = pureExt.substring(k+1);
                    }

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
