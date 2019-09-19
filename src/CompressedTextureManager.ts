/// <reference path="./loaders/ASTCLoader.ts"/>
/// <reference path="./loaders/DDSLoader.ts"/>
/// <reference path="./loaders/PVRTCLoader.ts"/>
/// <reference path="./loaders/CRNLoader.ts"/>


declare namespace PIXI.systems {
    interface TextureSystem {
        initCompressed?(): void;
        registerCompressedLoader?(loader: any): void;
        compressedExtensions?: any;
    }
}

namespace pixi_compressed_textures {
    
    // default loader list
    export let Loaders : Array<any> = [
        DDSLoader,
        PVRTCLoader,
        ASTCLoader,
        CRNLoader
    ];

    PIXI.systems.TextureSystem.prototype.initCompressed = function() {
        const gl = this.gl;
        if (!this.compressedExtensions) {
            this.compressedExtensions = {
                dxt: gl.getExtension("WEBGL_compressed_texture_s3tc"),
                pvrtc: gl.getExtension("WEBGL_compressed_texture_pvrtc"),
                astc: gl.getExtension("WEBGL_compressed_texture_astc"),
                atc: gl.getExtension("WEBGL_compressed_texture_atc"),
                etc1: gl.getExtension("WEBGL_compressed_texture_etc1")
            };
            this.compressedExtensions.crn = this.compressedExtensions.dxt;
        }
    };
    
    export function RegisterCompressedLoader (...loaders: any[]): void
    {
        Loaders = Loaders || [];
        for(let e in loaders) {
            if(Loaders.indexOf(loaders[e]) < 0) {
                Loaders.push(loaders[e])
            }
        }
    }

    export function detectExtensions(renderer: PIXI.Renderer, resolution?: number) {
        let extensions = [];
        if (renderer instanceof PIXI.Renderer) {
            renderer.texture.initCompressed();
            let data = renderer.texture.compressedExtensions;
            if (data.dxt) extensions.push('.dds');
            if (data.pvrtc) extensions.push('.pvr');
            if (data.atc) extensions.push('.atc');
            if (data.astc) extensions.push('.astc');
            if (data.etc1) extensions.push('.etc1');
        }
        //retina or not
        resolution = resolution || renderer.resolution;
        let res = "@"+resolution+"x";
        let ext = extensions.slice(0);
        while (ext.length > 0) {
            extensions.push(res + ext.pop());
        }
        extensions.push(res + ".png");
        extensions.push(res + ".jpg");
        //atlas support @1x @2x @.5x
        extensions.push(res + ".json");
        extensions.push(res + ".atlas");
        return extensions;
    }
}
