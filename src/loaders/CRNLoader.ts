/// <reference path="./AbstractInteranlLoader.ts"/>

declare module CRN_Module {
    export function _free(src: number): void

    export let HEAPU8: Uint8Array;

    export function _crn_get_width(src: number, size: number): number;

    export function _crn_get_height(src: number, size: number): number;

    export function _crn_get_levels(src: number, size: number): number;

    export function _crn_get_dxt_format(src: number, size: number): number;

    export function _crn_get_uncompressed_size(src: number, size: number, stuff: number): number;

    export function _malloc(size: number): number;

    export function _crn_decompress(src: number, srcSize: number, dst: number, dstSize: number, stuff: number): void;
}

namespace pixi_compressed_textures {
    
    function arrayBufferCopy(src: Uint8Array, dst: Uint8Array, dstByteOffset: number, numBytes: number): void {
        const dst32Offset = dstByteOffset / 4;
        const tail = (numBytes % 4);
        const src32 = new Uint32Array(src.buffer, 0, (numBytes - tail) / 4);
        const dst32 = new Uint32Array(dst.buffer);
        for (let ii = 0; ii < src32.length; ii++) {
            dst32[dst32Offset + ii] = src32[ii];
        }
        for (let i = numBytes - tail; i < numBytes; i++) {
            dst[dstByteOffset + i] = src[i];
        }
    }

    
    // DXT formats, from:
    // http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
    const COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
    const COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
    const COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;

    // Taken from crnlib.h
    const DXT_FORMAT_MAP = [
        COMPRESSED_RGB_S3TC_DXT1_EXT, 	// 0
        COMPRESSED_RGBA_S3TC_DXT3_EXT,  // 1
        COMPRESSED_RGBA_S3TC_DXT5_EXT 	// 2
    ];

    export class CRNLoader extends AbstractInternalLoader {
        public static type = "CRN";
        private _caches : number [];
        constructor(_image: CompressedImage) {
            super(_image);
        }

        load(arrayBuffer: ArrayBuffer) {

            const srcSize = arrayBuffer.byteLength;
            const bytes = new Uint8Array(arrayBuffer);
            const src = CRN_Module._malloc(srcSize);

            arrayBufferCopy(bytes, CRN_Module.HEAPU8, src, srcSize);

            const width = CRN_Module._crn_get_width(src, srcSize);
            const height = CRN_Module._crn_get_height(src, srcSize);
            const levels = CRN_Module._crn_get_levels(src, srcSize);
            const format = CRN_Module._crn_get_dxt_format(src, srcSize);
            const dstSize = CRN_Module._crn_get_uncompressed_size(src, srcSize, 0);
            const dst = CRN_Module._malloc(dstSize);

            CRN_Module._crn_decompress(src, srcSize, dst, dstSize, 0);

            const dxtData = new Uint8Array(CRN_Module.HEAPU8.buffer, dst, dstSize);
            const internalFormat = DXT_FORMAT_MAP[format];
            const dest = this._image;

            this._format = internalFormat;
            this._caches = [src, dst];

            return dest.init(dest.src, dxtData, 'CRN', width, height, levels, internalFormat);
        }

        levelBufferSize(width: number, height: number, mipLevel: number = 0): number {
            // same as in DDS
            return DDSLoader.prototype.levelBufferSize.call(this, width, height, mipLevel);
        }

        free() {
            CRN_Module._free(this._caches[0]);
            CRN_Module._free(this._caches[1]);
            
        }

        static test(buffer: ArrayBuffer) {
            return !!CRN_Module;
        }
    }
}
