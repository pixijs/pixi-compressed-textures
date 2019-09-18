declare module CRN_Module {
    function _free(src: number): void;
    let HEAPU8: Uint8Array;
    function _crn_get_width(src: number, size: number): number;
    function _crn_get_height(src: number, size: number): number;
    function _crn_get_levels(src: number, size: number): number;
    function _crn_get_dxt_format(src: number, size: number): number;
    function _crn_get_uncompressed_size(src: number, size: number, stuff: number): number;
    function _malloc(size: number): number;
    function _crn_decompress(src: number, srcSize: number, dst: number, dstSize: number, stuff: number): void;
}
declare namespace PIXI {
    interface GLTexture {
        compressed?: boolean;
    }
}
declare namespace PIXI.compressedTextures {
    function loadFromArrayBuffer(arrayBuffer: ArrayBuffer, src: string, crnLoad?: boolean): CompressedImage;
    class CompressedImage extends PIXI.resources.Resource {
        private _internalLoader;
        flipY: boolean;
        constructor(src: string, data?: Uint8Array, type?: string, width?: number, height?: number, levels?: number, internalFormat?: number);
        init(src: string, data: Uint8Array, type: string, width: number, height: number, levels: number, internalFormat: number, crunchCache?: Array<number>): CompressedImage;
        complete: boolean;
        isCompressedImage: boolean;
        preserveSource: boolean;
        onload: (event: Object) => void;
        src: string;
        data: Uint8Array;
        type: string;
        width: number;
        height: number;
        levels: number;
        internalFormat: number;
        crunch?: Array<number>;
        baseTexture: PIXI.BaseTexture;
        dispose(): void;
        bind(baseTexture: PIXI.BaseTexture): void;
        upload(renderer: PIXI.Renderer, baseTexture: PIXI.BaseTexture, glTexture: PIXI.GLTexture): boolean;
        style(renderer: PIXI.Renderer, baseTexture: PIXI.BaseTexture, glTexture: PIXI.GLTexture): boolean;
        loadFromArrayBuffer(arrayBuffer: ArrayBuffer, crnLoad?: boolean): CompressedImage;
        arrayBufferCopy(src: Uint8Array, dst: Uint8Array, dstByteOffset: number, numBytes: number): void;
        _loadCRN(arrayBuffer: ArrayBuffer): CompressedImage;
        _loadDDS(arrayBuffer: ArrayBuffer): CompressedImage;
        _loadPVR(arrayBuffer: ArrayBuffer): CompressedImage;
    }
}
declare namespace PIXI.systems {
    interface TextureSystem {
        initCompressed?(): void;
        compressedExtensions?: any;
    }
}
declare namespace PIXI.compressedTextures {
    function detectExtensions(renderer: PIXI.Renderer, resolution?: number): any[];
}
declare namespace PIXI {
    interface LoaderResource {
        _defaultUrlChoice?: string;
        _defaultUrl?: string;
        _baseUrl?: string;
    }
}
declare namespace PIXI.compressedTextures {
    function extensionChooser(supportedExtensions?: Array<string>): (this: PIXI.Loader, resource: PIXI.LoaderResource, next: () => any) => any;
}
declare namespace PIXI.compressedTextures {
    class ExtensionFixer {
        static use(this: PIXI.Loader, resource: PIXI.LoaderResource, next: () => any): void;
    }
}
declare namespace PIXI {
    interface LoaderResource {
        compressedImage?: PIXI.compressedTextures.CompressedImage;
        isCompressedImage?: boolean;
    }
}
declare namespace PIXI.compressedTextures {
    class ImageParser {
        static use(this: PIXI.Loader, resource: PIXI.LoaderResource, next: () => any): void;
    }
}
declare const ASTC_DIMS_TO_FORMAT: {
    [x: number]: number;
};
declare namespace PIXI.compressedTextures {
    class ASTC_Loader {
        private _image;
        useSRGB: boolean;
        private _format;
        private _blockSize;
        constructor(_image?: CompressedImage, useSRGB?: boolean);
        load(buffer: ArrayBuffer): CompressedImage;
        static test(buffer: ArrayBuffer): boolean;
        levelSize(width: number, height: number): number;
    }
}
declare namespace PIXI.compressedTextures {
}
declare module "pixi-compressed-textures" {
    export = PIXI.compressedTextures;
}
