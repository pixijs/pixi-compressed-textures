declare namespace PIXI {
    interface LoaderResource {
        compressedImage?: pixi_compressed_textures.CompressedImage;
        isCompressedImage?: boolean;
    }
}

namespace pixi_compressed_textures {
    import Resource = PIXI.LoaderResource;

    export const TEXTURE_EXTENSIONS :  string[] = [];

    export function RegisterCompressedExtensions(...ext: string[]) {
        for(let e in ext) {
            if(TEXTURE_EXTENSIONS.indexOf(e) < 0) {
                TEXTURE_EXTENSIONS.push(e);
                Resource.setExtensionXhrType(e, Resource.XHR_RESPONSE_TYPE.BUFFER);
            }
        }        
    }

    export class ImageParser {
        static use(this: PIXI.Loader, resource: PIXI.LoaderResource, next: () => any) {
            
            const url = resource.url;
            const idx = url.lastIndexOf('.');
            const amper = url.lastIndexOf('?');
            const ext = url.substring(idx + 1, amper > 0 ? amper : url.length );

            if (TEXTURE_EXTENSIONS.indexOf(ext) < 0) {
                next();
                return;
            }

            if (!resource.data) {
                throw new Error("compressedImageParser middleware for PixiJS v5 must be specified in loader.use()" +
                    " and must have resource.data when completed");
            }
            if (resource.compressedImage) {
                // ImageParser was added twice! ignore it.
                next();
                return;
            }
            resource.compressedImage = new CompressedImage(resource.url);
            resource.compressedImage.loadFromArrayBuffer(resource.data, ext === 'crn');
            resource.isCompressedImage = true;
            resource.texture = fromResource(resource.compressedImage, resource.url, resource.name);
            next();
        }
    }

    function fromResource(resource: PIXI.resources.Resource, imageUrl: string, name: string) {
        const baseTexture = new PIXI.BaseTexture(resource, {
            scaleMode: PIXI.settings.SCALE_MODE,
            resolution: PIXI.utils.getResolutionOfUrl(imageUrl),
        });

        const texture = new PIXI.Texture(baseTexture);

        // No name, use imageUrl instead
        if (!name)
        {
            name = imageUrl;
        }

        // lets also add the frame to pixi's global cache for 'fromLoader' function
        PIXI.BaseTexture.addToCache(texture.baseTexture, name);
        PIXI.Texture.addToCache(texture, name);

        // also add references by url if they are different.
        if (name !== imageUrl)
        {
            PIXI.BaseTexture.addToCache(texture.baseTexture, imageUrl);
            PIXI.Texture.addToCache(texture, imageUrl);
        }

        return texture;
    }
    
    RegisterCompressedExtensions('dds','crn','pvr','etc1','astc');
    PIXI.Loader.registerPlugin(ImageParser);
}
