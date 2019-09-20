declare namespace PIXI {
    interface GLTexture {
        compressed?: boolean;
    }
}
declare namespace PIXI.compressedTextures {
    function loadFromArrayBuffer(arrayBuffer: ArrayBuffer, src: string, crnLoad?: boolean): CompressedImage;
    class CompressedImage extends PIXI.resources.Resource {
        private _internalLoader;
        constructor(src: string, data?: Uint8Array, type?: string, width?: number, height?: number, levels?: number, internalFormat?: number);
        init(src: string, data: Uint8Array, type: string, width: number, height: number, levels: number, internalFormat: number): CompressedImage;
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
        baseTexture: PIXI.BaseTexture;
        dispose(): void;
        bind(baseTexture: PIXI.BaseTexture): void;
        upload(renderer: PIXI.Renderer, baseTexture: PIXI.BaseTexture, glTexture: PIXI.GLTexture): boolean;
        style(renderer: PIXI.Renderer, baseTexture: PIXI.BaseTexture, glTexture: PIXI.GLTexture): boolean;
        loadFromArrayBuffer(arrayBuffer: ArrayBuffer, crnLoad?: boolean): CompressedImage;
    }
}
declare namespace PIXI.systems {
    interface TextureSystem {
        initCompressed?(): void;
        registerCompressedLoader?(loader: any): void;
        compressedExtensions?: any;
    }
}
declare namespace PIXI.compressedTextures {
    let Loaders: Array<any>;
    function RegisterCompressedLoader(...loaders: any[]): void;
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
    const TEXTURE_EXTENSIONS: string[];
    function RegisterCompressedExtensions(...exts: string[]): void;
    class ImageParser {
        static use(this: PIXI.Loader, resource: PIXI.LoaderResource, next: () => any): void;
    }
}
declare namespace PIXI.compressedTextures {
    abstract class AbstractInternalLoader {
        protected _image: CompressedImage;
        static type: string;
        protected _format: number;
        constructor(_image?: CompressedImage);
        abstract levelBufferSize(width: number, height: number, mipLevel?: number): number;
        abstract load(buffer: ArrayBuffer): CompressedImage;
        free(): void;
        static test(arrayBuffer: ArrayBuffer): boolean;
    }
}
declare namespace PIXI.compressedTextures {
    class ASTCLoader extends AbstractInternalLoader {
        useSRGB: boolean;
        static type: string;
        private _blockSize;
        constructor(_image: CompressedImage, useSRGB?: boolean);
        load(buffer: ArrayBuffer): CompressedImage;
        static test(buffer: ArrayBuffer): boolean;
        levelBufferSize(width: number, height: number, mipLevel?: number): number;
    }
}
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
declare namespace PIXI.compressedTextures {
    class CRNLoader extends AbstractInternalLoader {
        static type: string;
        private _caches;
        constructor(_image: CompressedImage);
        load(arrayBuffer: ArrayBuffer): CompressedImage;
        levelBufferSize(width: number, height: number, mipLevel?: number): number;
        free(): void;
        static test(buffer: ArrayBuffer): boolean;
    }
}
declare function fourCCToInt32(value: string): number;
declare function int32ToFourCC(value: number): string;
declare namespace PIXI.compressedTextures {
    class DDSLoader extends AbstractInternalLoader {
        static type: string;
        constructor(_image: CompressedImage);
        load(arrayBuffer: ArrayBuffer): CompressedImage;
        static test(buffer: ArrayBuffer): boolean;
        levelBufferSize(width: number, height: number, mipLevel?: number): number;
    }
}
declare namespace PIXI.compressedTextures {
    class PVRTCLoader extends AbstractInternalLoader {
        static type: string;
        constructor(_image: CompressedImage);
        load(arrayBuffer: ArrayBuffer): CompressedImage;
        static test(buffer: ArrayBuffer): boolean;
        levelBufferSize(width: number, height: number, mipLevel?: number): number;
    }
}
declare namespace PIXI.compressedTextures {
}
declare module "pixi-compressed-textures" {
    export = PIXI.compressedTextures;
}
