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

declare namespace PIXI {
    interface GLTexture {
        compressed?: boolean;
    }
}

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

// ATC formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_atc/
    const COMPRESSED_RGB_ATC_WEBGL = 0x8C92;
    const COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 0x8C93;
    const COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 0x87EE;

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

//============================//
// DXT constants and utilites //
//============================//

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

    // Calcualates the size of a compressed texture level in bytes
    function textureLevelSize(format: number, width: number, height: number) {
        switch (format) {
            case COMPRESSED_RGB_S3TC_DXT1_EXT:
            case COMPRESSED_RGB_ATC_WEBGL:
            case COMPRESSED_RGB_ETC1_WEBGL:
                return ((width + 3) >> 2) * ((height + 3) >> 2) * 8;

            case COMPRESSED_RGBA_S3TC_DXT3_EXT:
            case COMPRESSED_RGBA_S3TC_DXT5_EXT:
            case COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL:
            case COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL:
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

    export function loadFromArrayBuffer(arrayBuffer: ArrayBuffer, src: string, crnLoad?: boolean): CompressedImage {
        return new CompressedImage(src).loadFromArrayBuffer(arrayBuffer, crnLoad);
    }

    export class CompressedImage extends PIXI.resources.Resource {
        private _internalLoader: ASTC_Loader;
        public flipY : boolean = false;
        constructor(src: string, data?: Uint8Array, type?: string, width?: number, height?: number, levels?: number, internalFormat?: number) {
            super();
            this.init(src, data, type, width, height, levels, internalFormat)
        }

        init(src: string, data: Uint8Array, type: string, width: number = -1, height: number = -1, levels: number, internalFormat: number,
             crunchCache?: Array<number>): CompressedImage {
            this.src = src;
            (this.resize as any)(width, height);
            this._width = width;
            this._height = height;
            this.data = data;
            this.type = type;
            this.levels = levels;
            this.internalFormat = internalFormat;
            this.crunch = crunchCache;

            let oldComplete = this.complete;
            this.complete = !!data;
            if (!oldComplete && this.complete && this.onload) {
                this.onload({target: this});
            }
            this.update();

            return this;
        }

        complete = false;
        isCompressedImage = true;
        preserveSource = true;

        onload: (event: Object) => void = null;

        src: string;
        data: Uint8Array;
        type: string;
        width: number;
        height: number;
        levels: number;
        internalFormat: number;
        crunch?: Array<number>;

        baseTexture: PIXI.BaseTexture = null;

        dispose() {
            this.data = null;
        }

        bind(baseTexture: PIXI.BaseTexture) {
            baseTexture.premultiplyAlpha = false;
            super.bind(baseTexture);
        }

        upload(renderer: PIXI.Renderer, baseTexture: PIXI.BaseTexture, glTexture: PIXI.GLTexture): boolean {
            const gl = renderer.state.gl;

            glTexture.compressed = false;
            renderer.texture.initCompressed();

            if (this.data === null) {
                throw "Trying to create a second (or more) webgl texture from the same CompressedImage : " + this.src;
            }

            const levels = this.levels;
            
            let width = this.width;
            let height = this.height;
            let offset = 0;
            
            // ASTC is flipped
            // BUT compressed textures doesn't flips
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!this.flipY);

            // Loop through each mip level of compressed texture data provided and upload it to the given texture.
            for (let i = 0; i < levels; ++i) {
                // Determine how big this level of compressed texture data is in bytes.
                let levelSize = textureLevelSize(this.internalFormat, width, height);
                
                //ASTC us ref
                if(this._internalLoader) {
                    levelSize = this._internalLoader.levelSize(width, height);
                }

                // Get a view of the bytes for this level of DXT data.
                let dxtLevel = new Uint8Array(this.data.buffer, this.data.byteOffset + offset, levelSize);

                // Upload!
                gl.compressedTexImage2D(gl.TEXTURE_2D, i, this.internalFormat, width, height, 0, dxtLevel);
                // The next mip level will be half the height and width of this one.
                
                width = width >> 1;
                if (width < 1) {
                    width = 1;
                }
                
                height = height >> 1;
                if (height < 1) {
                    height = 1;
                }
                // Advance the offset into the compressed texture data past the current mip level's data.
                offset += levelSize;
            }

            // reset for default texture
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            

            if (this.crunch) {
                CRN_Module._free(this.crunch[0]); // source
                CRN_Module._free(this.crunch[1]); // destination
            }

            // Cleaning the data to save memory. NOTE : BECAUSE OF THIS WE CANNOT CREATE TWO GL TEXTURE FROM THE SAME COMPRESSED IMAGE !
            if (!this.preserveSource)
                this.data = null;

            return true;
        }

        style(renderer: PIXI.Renderer, baseTexture: PIXI.BaseTexture, glTexture: PIXI.GLTexture): boolean {
            // We can't use gl.generateMipmaps with compressed textures, so only use
            // mipmapped filtering if the compressed texture data contained mip levels.

            //TODO: add mipmap flag here?
            const gl = renderer.state.gl;
            const levels = this.levels;
            if (baseTexture.scaleMode === PIXI.SCALE_MODES.LINEAR) {
                if (levels > 1) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }
            } else {
                if (levels > 1) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                }
            }

            return true;
        }

        loadFromArrayBuffer(arrayBuffer: ArrayBuffer, crnLoad?: boolean): CompressedImage {
            const head = new Uint32Array(arrayBuffer, 0, 1)[0];
            //todo: implement onload
            if (head === DDS_MAGIC){
                return this._loadDDS(arrayBuffer);
            }
            else if (head === PVR_MAGIC){
                return this._loadPVR(arrayBuffer);
            }
            else if(ASTC_Loader.test(arrayBuffer)){
                this._internalLoader = new ASTC_Loader(this, false);
                return this._internalLoader.load(arrayBuffer);
            }
            else if (crnLoad){
                return this._loadCRN(arrayBuffer);
            }
            else{
                throw new Error("Compressed texture format is not recognized: " + this.src);
            }
        }

        arrayBufferCopy(src: Uint8Array, dst: Uint8Array, dstByteOffset: number, numBytes: number): void {
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

        _loadCRN(arrayBuffer: ArrayBuffer) {
            // Taken from crnlib.h
            const DXT_FORMAT_MAP = [
                COMPRESSED_RGB_S3TC_DXT1_EXT, 	// 0
                COMPRESSED_RGBA_S3TC_DXT3_EXT,  // 1
                COMPRESSED_RGBA_S3TC_DXT5_EXT 	// 2
            ];

            const srcSize = arrayBuffer.byteLength;
            const bytes = new Uint8Array(arrayBuffer);
            const src = CRN_Module._malloc(srcSize);
            CompressedImage.prototype.arrayBufferCopy(bytes, CRN_Module.HEAPU8, src, srcSize);

            let perfTime = performance.now();

            const width = CRN_Module._crn_get_width(src, srcSize);
            const height = CRN_Module._crn_get_height(src, srcSize);
            const levels = CRN_Module._crn_get_levels(src, srcSize);
            const format = CRN_Module._crn_get_dxt_format(src, srcSize);

            const dstSize = CRN_Module._crn_get_uncompressed_size(src, srcSize, 0);
            const dst = CRN_Module._malloc(dstSize);
            CRN_Module._crn_decompress(src, srcSize, dst, dstSize, 0);
            const dxtData = new Uint8Array(CRN_Module.HEAPU8.buffer, dst, dstSize);

            perfTime = performance.now() - perfTime;

            return this.init(this.src, dxtData, 'CRN', width, height, levels, DXT_FORMAT_MAP[format], [src, dst]);
        }

        _loadDDS(arrayBuffer: ArrayBuffer) {
            // Get a view of the arrayBuffer that represents the DDS header.
            const header = new Int32Array(arrayBuffer, 0, DDS_HEADER_LENGTH);

            // Do some sanity checks to make sure this is a valid DDS file.
            if (header[DDS_HEADER_MAGIC] != DDS_MAGIC)
                throw "Invalid magic number in DDS header";

            if (!(header[DDS_HEADER_PF_FLAGS] & DDPF_FOURCC))
                throw "Unsupported format, must contain a FourCC code";

            // Determine what type of compressed data the file contains.
            const fourCC = header[DDS_HEADER_PF_FOURCC];
            let internalFormat;
            switch (fourCC) {
                case FOURCC_DXT1:
                    internalFormat = COMPRESSED_RGB_S3TC_DXT1_EXT;
                    break;
                case FOURCC_DXT3:
                    internalFormat = COMPRESSED_RGBA_S3TC_DXT3_EXT;
                    break;
                case FOURCC_DXT5:
                    internalFormat = COMPRESSED_RGBA_S3TC_DXT5_EXT;
                    break;
                case FOURCC_ATC:
                    internalFormat = COMPRESSED_RGB_ATC_WEBGL;
                    break;
                case FOURCC_ATCA:
                    internalFormat = COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL;
                    break;
                case FOURCC_ATCI:
                    internalFormat = COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL;
                    break;
                default:
                    throw new Error("Unsupported FourCC code: " + int32ToFourCC(fourCC));
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

            return this.init(this.src, dxtData, 'DDS', width, height, levels, internalFormat);
        }

        _loadPVR(arrayBuffer: ArrayBuffer) {
            // Get a view of the arrayBuffer that represents the DDS header.
            const header = new Int32Array(arrayBuffer, 0, PVR_HEADER_LENGTH);

            // Do some sanity checks to make sure this is a valid DDS file.
            if (header[PVR_HEADER_MAGIC] != PVR_MAGIC)
                throw "Invalid magic number in PVR header";

            // Determine what type of compressed data the file contains.
            const format = header[PVR_HEADER_FORMAT];
            let internalFormat;
            switch (format) {
                case PVR_FORMAT_2BPP_RGB:
                    internalFormat = COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
                    break;
                case PVR_FORMAT_2BPP_RGBA:
                    internalFormat = COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
                    break;
                case PVR_FORMAT_4BPP_RGB:
                    internalFormat = COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                    break;
                case PVR_FORMAT_4BPP_RGBA:
                    internalFormat = COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
                    break;
                case PVR_FORMAT_ETC1:
                    internalFormat = COMPRESSED_RGB_ETC1_WEBGL;
                    break;
                case PVR_FORMAT_DXT1:
                    internalFormat = COMPRESSED_RGB_S3TC_DXT1_EXT;
                    break;
                case PVR_FORMAT_DXT3:
                    internalFormat = COMPRESSED_RGBA_S3TC_DXT3_EXT;
                    break;
                case PVR_FORMAT_DXT5:
                    internalFormat = COMPRESSED_RGBA_S3TC_DXT5_EXT;
                    break;
                default:
                    throw new Error("Unsupported PVR format: " + format);
            }

            // Gather other basic metrics and a view of the raw the DXT data.
            const width = header[PVR_HEADER_WIDTH];
            const height = header[PVR_HEADER_HEIGHT];
            const levels = header[PVR_HEADER_MIPMAPCOUNT];
            const dataOffset = header[PVR_HEADER_METADATA] + 52;
            const pvrtcData = new Uint8Array(arrayBuffer, dataOffset);

            return this.init(this.src, pvrtcData, 'PVR', width, height, levels, internalFormat);
        }
    }
}
