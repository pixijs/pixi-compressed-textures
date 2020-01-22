

declare namespace PIXI {
    interface GLTexture {
        compressed?: boolean;
    }
}

namespace pixi_compressed_textures {

    export function loadFromArrayBuffer(arrayBuffer: ArrayBuffer, src: string, crnLoad?: boolean): CompressedImage {
        return new CompressedImage(src).loadFromArrayBuffer(arrayBuffer, crnLoad);
    }

    export class CompressedImage extends PIXI.resources.Resource {
        private _internalLoader: AbstractInternalLoader;

        constructor(src: string, data?: Uint8Array, type?: string, width?: number, height?: number, levels?: number, internalFormat?: number) {
            super();
            this.init(src, data, type, width, height, levels, internalFormat)
        }

        init(src: string, data: Uint8Array, type: string, width: number = -1, height: number = -1, levels: number, internalFormat: number): CompressedImage {
            this.src = src;
            (this.resize as any)(width, height);
            this._width = width;
            this._height = height;
            this.data = data;
            this.type = type;
            this.levels = levels;
            this.internalFormat = internalFormat;

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

        baseTexture: PIXI.BaseTexture = null;

        dispose() {
            this.data = null;
        }

        bind(baseTexture: PIXI.BaseTexture) {
            if (baseTexture.alphaMode !== undefined)
            {
                // 5.2.0
                baseTexture.alphaMode = PIXI.ALPHA_MODES.NO_PREMULTIPLIED_ALPHA;
            } else
            {
                // 5.1.2
                (baseTexture as any).premultiplyAlpha = false;
            }
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

            //TODO: support cubemap resources, target is not TEXTURE_2D for them
            //TODO: support anisotropic levels

            // Loop through each mip level of compressed texture data provided and upload it to the given texture.
            for (let i = 0; i < levels; ++i) {
                
                // Determine how big this level of compressed texture data is in bytes.
                const levelSize = this._internalLoader.levelBufferSize(width, height, i);
                
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
            
            //clean internal loader data
            this._internalLoader.free();
      
            // Cleaning the data to save memory. NOTE : BECAUSE OF THIS WE CANNOT CREATE TWO GL TEXTURE FROM THE SAME COMPRESSED IMAGE !
            if (!this.preserveSource)
                this.data = null;

            return true;
        }

        style(renderer: PIXI.Renderer, baseTexture: PIXI.BaseTexture, glTexture: PIXI.GLTexture): boolean {
            // We can't use gl.generateMipmaps with compressed textures, so only use
            // mipmapped filtering if the compressed texture data contained mip levels.

            const gl = renderer.state.gl;
            const levels = this.levels;
            if (baseTexture.scaleMode === PIXI.SCALE_MODES.LINEAR) {
                if (levels > 1 && glTexture.mipmap) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }
            } else {
                if (levels > 1 && glTexture.mipmap) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                }
            }

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, glTexture.wrapMode);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, glTexture.wrapMode);

            return true;
        }

        loadFromArrayBuffer(arrayBuffer: ArrayBuffer, crnLoad?: boolean): CompressedImage {
            const loaders = Loaders;
            
            if(!loaders || !loaders.length) {
                throw "Registered compressed loaders is missing. Call `TextureSystem.initCompressed` before loading!";
            }

            let selectedLoaderCtr = undefined;
            
            for(let loader of loaders) {
                if(!crnLoad) {
                    if(loader.test(arrayBuffer)) {
                        selectedLoaderCtr = loader;
                        break;
                    }
                } else {
                    /// so.... 
                    if(loader.type === "CRN"){
                        selectedLoaderCtr = loader;
                        break;
                    }
                }
            }

            //todo: implement onload
            if (selectedLoaderCtr){
                this._internalLoader = new selectedLoaderCtr(this);
                return this._internalLoader.load(arrayBuffer);
            } else {
                throw new Error("Compressed texture format is not recognized: " + this.src);
            }
        }
    }
}
