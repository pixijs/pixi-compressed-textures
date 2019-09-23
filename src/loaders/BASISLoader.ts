/// <reference path="./AbstractInteranlLoader.ts"/>

/**
 * @file BASISLoader - Basis implementation for PIXI
 * @see https://github.com/BinomialLLC/basis_universal
 * 
 * @author Timoshenko Konstantin 
 * @see https://github.com/exponenta
 */

declare class BasisFile {
    constructor(buffer : Uint8Array);
    getNumImages(): number;
    getNumLevels(): number;
    getImageWidth(imageId: number, level:number): number;
    getImageHeight(imageId: number, level:number): number;
    getHasAlpha(): boolean;
    startTranscoding(): boolean;
    getImageTranscodedSizeInBytes(imageId : number, level: number, basisFormat: number): number;
    transcodeImage(dstBuff: Uint8Array, imageId: number, level: number, basisFormat: number, pvrtcWrapAddressing: boolean, getAlphaForOpaqueFormats: boolean): number
}

namespace pixi_compressed_textures {

    const BASIS_FORMAT = {
        cTFETC1: 0, // not support alpha
        // cTFETC2: 1, // not WebGL
        cTFBC1: 2, // not support alpha
        cTFBC3: 3,
        // cTFBC4: 4, // not WebGL
        // cTFBC5: 5, // not WebGL
        // cTFBC7_M6_OPAQUE_ONLY: 6 // not WebGL
        // cTFBC7_M5 : 7 // not WebGL
        cTFPVRTC1_4_RGB: 8, // not support alpha
        cTFPVRTC1_4_RGBA: 9,
        cTFASTC_4x4: 10, // mobile alpha! Ehooo
        // cTFATC_RGB : 11 //  not WebGL
        // cTFATC_RGBA_INTERPOLATED_ALPHA : 12  not WebGL

        cTFRGBA32: 11 // why not?
    };

    const BASIS_HAS_ALPHA = {
        [3]: true, [9]: true, [10]: true, [11]: true
    } as {[key: number]: boolean}

    const NON_COMPRESSED = -1;
    const COMPRESSED_RGB_ETC1_WEBGL = 0x8D64;
    const COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
    const COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
    const COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
    const COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;
    const COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;
    const COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;
    const COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;

    const BASIS_TO_FMT = {
        // fallback
        [BASIS_FORMAT.cTFRGBA32]: NON_COMPRESSED,
        [BASIS_FORMAT.cTFETC1]: COMPRESSED_RGB_ETC1_WEBGL,
        [BASIS_FORMAT.cTFBC1]: COMPRESSED_RGB_S3TC_DXT1_EXT,
        [BASIS_FORMAT.cTFBC3]: COMPRESSED_RGBA_S3TC_DXT5_EXT,
        [BASIS_FORMAT.cTFPVRTC1_4_RGB]: COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
        [BASIS_FORMAT.cTFPVRTC1_4_RGBA]: COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
        [BASIS_FORMAT.cTFASTC_4x4]: COMPRESSED_RGBA_ASTC_4x4_KHR
    }

    const FMT_TO_BASIS = Object.keys(BASIS_TO_FMT).reduce((acc : any, next : string) => {
        acc[BASIS_TO_FMT[+next]] = +next;
        return acc;
    }, {} as {[key: number]: number});

    export class BASISLoader extends AbstractInternalLoader {        
        static BASIS_BINDING: typeof BasisFile = undefined;
        static RGB_FORMAT: {basis: number, name: string, native: number};
        static RGBA_FORMAT: {basis: number, name: string, native: number};

        type = "BASIS";

        private _file : BasisFile = undefined;

        constructor(_image : CompressedImage) {
            super(_image);
        }

        static test(array: ArrayBuffer) {
            const header = new Uint32Array(array, 0, 1)[0];      
            const decoder = !!BASISLoader.BASIS_BINDING;
            const isValid = header === 0x134273 && decoder;
            const isSupported = BASISLoader.RGB_FORMAT && BASISLoader.RGBA_FORMAT;

            if (!isValid && isSupported) {
                console.warn("[BASIS LOADER] Is Supported, but transcoder not binded or file is not BASIS file!");
            }

            return (isSupported && isValid);
        }

        /**
         * Binding BASIS Transcoder to loader
         * 
         * @param fileCtr BASIS File contreuctor
         * @param ext supported extension, grub it from `app.renderer.plugins.texture.compressedExtensions`
         */
        static bindTranscoder(fileCtr: typeof BasisFile, ext: any) {
            if(!fileCtr || !ext) {
                throw "Invalid state! undef fileCtr or ext invalid!"
            };

            // fetch list of ALL extensions
            const plain = Object.keys(ext)
                .reduce((acc, key) => {
                    const val = ext [key];
                    if (!val) { 
                        return acc; 
                    };
                    return Object.assign(acc, val.__proto__);
                }, {});

            let latestOp = undefined;
            let lastestAlpha = undefined;

            // SELECT SUPPORT
            for (let v in plain) {
                const native = plain[v];
                if (FMT_TO_BASIS[native] !== undefined) {
                    let basis = FMT_TO_BASIS[native] as number;
                    if (BASIS_HAS_ALPHA[basis]) {
                        lastestAlpha = {
                            native, name: v, basis
                        }
                    } else {
                        latestOp = {
                            native, name: v, basis
                        }
                    }
                }
            }

            BASISLoader.RGB_FORMAT = latestOp || lastestAlpha;
            BASISLoader.RGBA_FORMAT = lastestAlpha || latestOp;
            BASISLoader.BASIS_BINDING = fileCtr;

            console.log(
                    `[BASISLoader] Supported formats:`,
                    `\nRGB:${BASISLoader.RGB_FORMAT.name}\nRGBA:${BASISLoader.RGBA_FORMAT.name}`
            );

            //Register self after bunding
            RegisterCompressedLoader(BASISLoader);
            RegisterCompressedExtensions('basis');
        }

        load(buffer : ArrayBuffer) {            
            if(!BASISLoader.test(buffer)) {
                throw "BASIS Transcoder not binded or transcoding not supported =(!";
            }

            this._loadAsync(buffer);
            return this._image;
        }

        _loadAsync(buffer : ArrayBuffer) {            
            const startTime = performance.now();
            const BasisFileCtr = BASISLoader.BASIS_BINDING as any;
            const basisFile = new BasisFileCtr(new Uint8Array(buffer)) as BasisFile;
            const width = basisFile.getImageWidth(0, 0);
            const height = basisFile.getImageHeight(0, 0);
            // const images = await basisFile.getNumImages(); // not support yet
            const levels = 1;//await basisFile.getNumLevels( 0 ); // not support yet
            const hasAlpha = basisFile.getHasAlpha();
            const dest = this._image;

            if (!basisFile.startTranscoding()) {
                throw "Transcoding error!";
            }

            const target = hasAlpha ? BASISLoader.RGBA_FORMAT : BASISLoader.RGB_FORMAT;

            console.log("Grats! BASIS will be transcoded to:", target);

            const dst = new Uint8Array(basisFile.getImageTranscodedSizeInBytes(0, 0, target.basis));
          
            if (!basisFile.transcodeImage(dst, 0, 0, target.basis, !!0, !!0)) {
                throw "Transcoding error!";
            }

            console.log("[BASISLoader] Totla transcoding time:", performance.now() - startTime);
           
            this._format = target.native;
            this._file = basisFile;

            let name = target.name.replace("COMPRESSED_", "");

            return Promise.resolve(dest.init(dest.src, dst, 'BASIS|' + name, width, height, levels, target.native));
        }

        levelBufferSize(width : number, height: number, level: number): number {
            return this._file ? this._file.getImageTranscodedSizeInBytes(0, level, FMT_TO_BASIS[this._format]) : undefined;
        }
    }
}