declare namespace PIXI {
	interface LoaderResource {
		_defaultUrlChoice?: string;
		_defaultUrl?: string;
		_baseUrl?: string;
	}
}

namespace pixi_compressed_textures {
    export function extensionChooser(supportedExtensions : Array<string> = []) {
        return function(this: PIXI.Loader, resource: PIXI.LoaderResource, next: () => any) {
            let ext = resource.metadata.choice;
            if (!ext) {
                return next();
            }
            //let us choose extension!
            let url = resource.url;
            let k = 0;
            if (!resource._defaultUrlChoice) {
                resource._defaultUrlChoice = url;
                k = url.lastIndexOf(".");
                if (k >= 0) {
                    resource._baseUrl = url.substring(0, k);
                } else {
                    return next();
                }
            }
            for (let i = ext.length - 1; i >= 0; i--) {
                url = resource._baseUrl + ext[i];
                let isSupported = false;
                for (let j = 0; j < supportedExtensions.length; j++) {
                    if (ext[i] === supportedExtensions[j]) {
                        resource.url = url;

                        let pureExt = ext[i];
                        if (pureExt.indexOf('@') > -1) {
                            //@0.5x.dds should have pureExt "dds", not 5x.dds
                            // -> remove format specifier (@2x, @0.5x) before
                            //determining the extension
                            pureExt = pureExt.replace(/@[0-9.]*x/, "");
                        }
                        k = pureExt.indexOf('.');
                        if (k >= 0) {
                            pureExt = pureExt.substring(k + 1);
                        }

                        resource.extension = pureExt;
                        resource.loadType = (resource as any)._determineLoadType();
                        next();
                        return;
                    }
                }
            }
            next();
        }
    }
}
