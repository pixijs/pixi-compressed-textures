/// <reference path="./AbstractInteranlLoader.ts"/>


// Utility functions
// Builds a numeric code for a given fourCC string
function fourCCToInt32(value: string) {
    return value.charCodeAt(0) +
        (value.charCodeAt(1) << 8) +
        (value.charCodeAt(2) << 16) +
        (value.charCodeAt(3) << 24);
}

// Turns a fourCC numeric code into a string
function int32ToFourCC(value: number) {
    return String.fromCharCode(
        value & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff
    );
}

namespace pixi_compressed_textures {
    // DXT values and structures referenced from:
    // http://msdn.microsoft.com/en-us/library/bb943991.aspx/
    const DDS_MAGIC = 0x20534444;
    const DDSD_MIPMAPCOUNT = 0x20000;
    const DDPF_FOURCC = 0x4;
    const DDS_HEADER_LENGTH = 31; // The header length in 32 bit ints.

    // Offsets into the header array.
    const DDS_HEADER_MAGIC = 0;
    const DDS_HEADER_SIZE = 1;
    const DDS_HEADER_FLAGS = 2;
    const DDS_HEADER_HEIGHT = 3;
    const DDS_HEADER_WIDTH = 4;
    const DDS_HEADER_MIPMAPCOUNT = 7;
    const DDS_HEADER_PF_FLAGS = 20;
    const DDS_HEADER_PF_FOURCC = 21;

    // FourCC format identifiers.
    const FOURCC_DXT1 = fourCCToInt32("DXT1");
    const FOURCC_DXT3 = fourCCToInt32("DXT3");
    const FOURCC_DXT5 = fourCCToInt32("DXT5");

    const FOURCC_ATC = fourCCToInt32("ATC ");
    const FOURCC_ATCA = fourCCToInt32("ATCA");
    const FOURCC_ATCI = fourCCToInt32("ATCI");

    // DXT formats, from:
    // http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
    const COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
    const COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
    const COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
    const COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;

    // ATC formats, from:
    // http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_atc/
    const COMPRESSED_RGB_ATC_WEBGL = 0x8C92;
    const COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 0x8C93;
    const COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 0x87EE;

    const FOURCC_TO_FORMAT = {
        [FOURCC_DXT1]: COMPRESSED_RGB_S3TC_DXT1_EXT,
        [FOURCC_DXT3]: COMPRESSED_RGBA_S3TC_DXT3_EXT,
        [FOURCC_DXT5]: COMPRESSED_RGBA_S3TC_DXT5_EXT,
        [FOURCC_ATC]: COMPRESSED_RGB_ATC_WEBGL,
        [FOURCC_ATCA]: COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL,
        [FOURCC_ATCI]: COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL
    }

    export class DDSLoader extends AbstractInternalLoader {
        public static type = "DDS";
        constructor(_image: CompressedImage) {
            super(_image);
        }

        load(arrayBuffer: ArrayBuffer) {
            if (!DDSLoader.test(arrayBuffer)) {
                // Do some sanity checks to make sure this is a valid ASTC file.
                throw "Invalid magic number in DDS header";
            }

            // Get a view of the arrayBuffer that represents the DDS header.
            const header = new Int32Array(arrayBuffer, 0, DDS_HEADER_LENGTH);

            if (!(header[DDS_HEADER_PF_FLAGS] & DDPF_FOURCC))
                throw "Unsupported format, must contain a FourCC code";

            // Determine what type of compressed data the file contains.
            const fourCC = header[DDS_HEADER_PF_FOURCC];
            let internalFormat = FOURCC_TO_FORMAT[fourCC] || -1;

            if (internalFormat < 0) {
                throw "Unsupported FourCC code: " + int32ToFourCC(fourCC);
            }

            // Determine how many mipmap levels the file contains.
            let levels = 1;
            if (header[DDS_HEADER_FLAGS] & DDSD_MIPMAPCOUNT) {
                levels = Math.max(1, header[DDS_HEADER_MIPMAPCOUNT]);
            }

            // Gather other basic metrics and a view of the raw the DXT data.
            const width = header[DDS_HEADER_WIDTH];
            const height = header[DDS_HEADER_HEIGHT];
            const dataOffset = header[DDS_HEADER_SIZE] + 4;
            const dxtData = new Uint8Array(arrayBuffer, dataOffset);
            const dest = this._image;

            this._format = internalFormat;
            dest.init(dest.src, dxtData, 'DDS', width, height, levels, internalFormat);

            return dest;
        }

        static test(buffer: ArrayBuffer) {
            const magic = new Int32Array(buffer, 0, 1);
            return magic[0] === DDS_MAGIC;
        }

        levelBufferSize(width: number, height: number, mipLevel: number = 0): number {
            switch (this._format) {
                case COMPRESSED_RGB_S3TC_DXT1_EXT:
                case COMPRESSED_RGB_ATC_WEBGL:
                    return ((width + 3) >> 2) * ((height + 3) >> 2) * 8;

                case COMPRESSED_RGBA_S3TC_DXT3_EXT:
                case COMPRESSED_RGBA_S3TC_DXT5_EXT:
                case COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL:
                case COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL:
                    return ((width + 3) >> 2) * ((height + 3) >> 2) * 16;

                default:
                    return 0;
            }
        }
    }
}
