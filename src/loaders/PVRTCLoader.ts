/// <reference path="./AbstractInteranlLoader.ts"/>

namespace pixi_compressed_textures {
    //===============//
    // PVR constants //
    //===============//

    // PVR formats, from:
    // http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_pvrtc/
    const COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;
    const COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 0x8C01;
    const COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;
    const COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 0x8C03;

    // ETC1 format, from:
    // http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_etc1/
    const COMPRESSED_RGB_ETC1_WEBGL = 0x8D64;

    const PVR_FORMAT_2BPP_RGB = 0;
    const PVR_FORMAT_2BPP_RGBA = 1;
    const PVR_FORMAT_4BPP_RGB = 2;
    const PVR_FORMAT_4BPP_RGBA = 3;
    const PVR_FORMAT_ETC1 = 6;
    const PVR_FORMAT_DXT1 = 7;
    const PVR_FORMAT_DXT3 = 9;
    const PVR_FORMAT_DXT5 = 5;

    const PVR_HEADER_LENGTH = 13; // The header length in 32 bit ints.
    const PVR_MAGIC = 0x03525650; //0x50565203;

    // Offsets into the header array.
    const PVR_HEADER_MAGIC = 0;
    const PVR_HEADER_FORMAT = 2;
    const PVR_HEADER_HEIGHT = 6;
    const PVR_HEADER_WIDTH = 7;
    const PVR_HEADER_MIPMAPCOUNT = 11;
    const PVR_HEADER_METADATA = 12;

    // DXT formats, from:
    // http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
    const COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
    const COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
    const COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
    const COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;

    const PVR_TO_FORMAT = {
        [PVR_FORMAT_2BPP_RGB] : COMPRESSED_RGB_PVRTC_2BPPV1_IMG,
        [PVR_FORMAT_2BPP_RGBA] : COMPRESSED_RGBA_PVRTC_2BPPV1_IMG,
        [PVR_FORMAT_4BPP_RGB] : COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
        [PVR_FORMAT_4BPP_RGBA] : COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
        [PVR_FORMAT_ETC1] : COMPRESSED_RGB_ETC1_WEBGL,
        [PVR_FORMAT_DXT1] : COMPRESSED_RGB_S3TC_DXT1_EXT,
        [PVR_FORMAT_DXT3] : COMPRESSED_RGBA_S3TC_DXT3_EXT,
        [PVR_FORMAT_DXT5] : COMPRESSED_RGBA_S3TC_DXT5_EXT
    } as {[key: number] : number};

    export class PVRTCLoader extends AbstractInternalLoader {        
        public static type = "PVR";

        constructor(_image : CompressedImage) {
            super(_image);
        }

        load(arrayBuffer: ArrayBuffer) {
            if (!DDSLoader.test(arrayBuffer)) {
                // Do some sanity checks to make sure this is a valid ASTC file.
                throw "Invalid magic number in PVR header";
            }

            // Get a view of the arrayBuffer that represents the DDS header.
            const header = new Int32Array(arrayBuffer, 0, PVR_HEADER_LENGTH);

            // Determine what type of compressed data the file contains.
            const format = header[PVR_HEADER_FORMAT];
            const internalFormat = PVR_TO_FORMAT[format] || -1;

            // Gather other basic metrics and a view of the raw the DXT data.
            const width = header[PVR_HEADER_WIDTH];
            const height = header[PVR_HEADER_HEIGHT];
            const levels = header[PVR_HEADER_MIPMAPCOUNT];
            const dataOffset = header[PVR_HEADER_METADATA] + 52;
            const pvrtcData = new Uint8Array(arrayBuffer, dataOffset);

            const dest = this._image;
            
            this._format = internalFormat;
            dest.init(dest.src, pvrtcData, 'PVR', width, height, levels, internalFormat);

            return dest;
        }

        static test(buffer: ArrayBuffer) {
            const magic = new Int32Array(buffer, 0, 1);
            return magic[0] === PVR_MAGIC;
        }

        levelBufferSize(width : number, height : number, mipLevel: number = 0): number {            
            switch (this._format) {
                case COMPRESSED_RGB_S3TC_DXT1_EXT:
                case COMPRESSED_RGB_ETC1_WEBGL:
                    return ((width + 3) >> 2) * ((height + 3) >> 2) * 8;
    
                case COMPRESSED_RGBA_S3TC_DXT3_EXT:
                case COMPRESSED_RGBA_S3TC_DXT5_EXT:
                    return ((width + 3) >> 2) * ((height + 3) >> 2) * 16;
    
                case COMPRESSED_RGB_PVRTC_4BPPV1_IMG:
                case COMPRESSED_RGBA_PVRTC_4BPPV1_IMG:
                    return Math.floor((Math.max(width, 8) * Math.max(height, 8) * 4 + 7) / 8);
    
                case COMPRESSED_RGB_PVRTC_2BPPV1_IMG:
                case COMPRESSED_RGBA_PVRTC_2BPPV1_IMG:
                    return Math.floor((Math.max(width, 16) * Math.max(height, 8) * 2 + 7) / 8);
    
                default:
                    return 0;
            }
        }
    }
}
