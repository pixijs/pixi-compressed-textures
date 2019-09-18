/// <reference path="./AbstractInteranlLoader.ts"/>

// ASTC Formats, from
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_astc/
// https://arm-software.github.io/opengl-es-sdk-for-android/astc_textures.html

/** HEADER
 * struct astcheader
    {
        uint8_t magic [ 4 ] ;
        uint8_t blockdim_x ;
        uint8_t blockdim_y ;
        uint8_t blockdim_z ;
        uint8_t x_size [ 3 ] ;
        uint8_t y_size [ 3 ] ;
        uint8_t z_size [ 3 ] ;
    } ;
 */

namespace pixi_compressed_textures {

    // headers
    const ASTC_HEADER_LENGTH = 16;
    // uint 8
    const ASTC_HEADER_DIM_X = 4;
    // uint 8
    const ASTC_HEADER_DIM_Y = 5;
    // uint 24
    const ASTC_HEADER_WIDTH = 7;
    //uint 24
    const ASTC_HEADER_HEIGHT = 10;

    const ASTC_MAGIC = 0x5CA1AB13;

    /* Compressed Texture Format */
    const COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;
    const COMPRESSED_RGBA_ASTC_5x4_KHR = 0x93B1;
    const COMPRESSED_RGBA_ASTC_5x5_KHR = 0x93B2;
    const COMPRESSED_RGBA_ASTC_6x5_KHR = 0x93B3;
    const COMPRESSED_RGBA_ASTC_6x6_KHR = 0x93B4;
    const COMPRESSED_RGBA_ASTC_8x5_KHR = 0x93B5;
    const COMPRESSED_RGBA_ASTC_8x6_KHR = 0x93B6;
    const COMPRESSED_RGBA_ASTC_8x8_KHR = 0x93B7;
    const COMPRESSED_RGBA_ASTC_10x5_KHR = 0x93B8;
    const COMPRESSED_RGBA_ASTC_10x6_KHR = 0x93B9;
    const COMPRESSED_RGBA_ASTC_10x8_KHR = 0x93BA;
    const COMPRESSED_RGBA_ASTC_10x10_KHR = 0x93BB;
    const COMPRESSED_RGBA_ASTC_12x10_KHR = 0x93BC;
    const COMPRESSED_RGBA_ASTC_12x12_KHR = 0x93BD;

    const COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = 0x93D0;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR = 0x93D1;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR = 0x93D2;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR = 0x93D3;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR = 0x93D4;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR = 0x93D5;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR = 0x93D6;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR = 0x93D7;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR = 0x93D8;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR = 0x93D9;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR = 0x93DA;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR = 0x93DB;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR = 0x93DC;
    const COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR = 0x93DD;

    const ASTC_DIMS_TO_FORMAT = {
        [4 * 4]: 0,
        [5 * 4]: 1,
        [5 * 5]: 2,
        [6 * 5]: 3,
        [6 * 6]: 4,
        [8 * 5]: 5,
        [8 * 6]: 6,
        [8 * 8]: 7,
        [10 * 5]: 8,
        [10 * 6]: 9,
        [10 * 8]: 10,
        [10 * 10]: 11,
        [12 * 10]: 12,
        [12 * 12]: 13
    }
    
    export class ASTCLoader extends AbstractInternalLoader {
        public static type = "ASTC";
        private _blockSize: { x: number; y: number } = { x: 0, y: 0 };

        constructor(_image: CompressedImage, public useSRGB = false) {
            super(_image);
        }

        load(buffer: ArrayBuffer) {
            if (!ASTCLoader.test(buffer)) {
                // Do some sanity checks to make sure this is a valid ASTC file.
                throw "Invalid magic number in ASTC header";
            }

            const header = new Uint8Array(buffer, 0, ASTC_HEADER_LENGTH);
            const dim_x = header[ASTC_HEADER_DIM_X];
            const dim_y = header[ASTC_HEADER_DIM_Y];
            const width = (header[ASTC_HEADER_WIDTH]) + (header[ASTC_HEADER_WIDTH + 1] << 8) + (header[ASTC_HEADER_WIDTH + 2] << 16);
            const height = (header[ASTC_HEADER_HEIGHT]) + (header[ASTC_HEADER_HEIGHT + 1] << 8) + (header[ASTC_HEADER_HEIGHT + 2] << 16);
            const internalFormat = ASTC_DIMS_TO_FORMAT[dim_x * dim_y] + (this.useSRGB ? COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : COMPRESSED_RGBA_ASTC_4x4_KHR);
            const astcData = new Uint8Array(buffer, ASTC_HEADER_LENGTH);

            this._format = internalFormat;
            this._blockSize.x = dim_x;
            this._blockSize.y = dim_y;

            const dest = this._image;
            dest.init(dest.src, astcData, 'ASTC', width, height, 1, internalFormat);
            return dest;
        }

        static test(buffer: ArrayBuffer) {
            const magic = new Int32Array(buffer, 0, 1);
            return magic[0] === ASTC_MAGIC;
        }

        levelBufferSize(width: number, height: number, mipLevel: number = 0): number {
            const f_ = Math.floor;
            const dim_x = this._blockSize.x;
            const dim_y = this._blockSize.y;

            return (f_((width + dim_x - 1) / dim_x) * f_((height + dim_y - 1) / dim_y)) << 4;
        }
    }
}
