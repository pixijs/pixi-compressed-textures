/// <reference path="./BASISLoader.ts"/>

namespace pixi_compressed_textures {

    export class WorkedBASISLoader extends BASISLoader {
        private _mips: Array<IMipmap> = [];

        constructor(_image: CompressedImage) {
            super(_image);
        }

        async _loadAsync(buffer: ArrayBuffer) {
            const start = performance.now();
            const pool: WorkedBASIS.TranscoderWorkerPool = BASISLoader.BASIS_BINDING as any;

            const config = {
                genMip: true,
                rgbaFormat: BASISLoader.RGBA_FORMAT.basis,
                rgbFormat: BASISLoader.RGB_FORMAT.basis,
                transfer: true
            };

            return pool
                .transcode(buffer, config)
                .then( (result: ITranscodeResult ) => 
                {
                    const width = result.width;
                    const height = result.height;
                    const srcBuffer = new Uint8Array(result.buffer);
                    const target = result.hasAlpha ? BASISLoader.RGBA_FORMAT : BASISLoader.RGB_FORMAT;
                    const name = target.name.replace("COMPRESSED_", "");
                    const dest = this._image;

                    this._mips = result.mipmaps;

                    console.log("[WorkedBASISLoader] Total transcoding time:", performance.now() - start);
                    return dest.init(dest.src, srcBuffer, 'BASIS|' + name, width, height, 1, target.native);
                }
            );
        }

        static loadAndRunTranscoder(options: {path: string, ext: any, threads: number}) {
            return Promise.all([
                fetch(options.path + "/basis_transcoder.js").then((r)=>r.text()),
                fetch(options.path + "/basis_transcoder.wasm").then((w)=>w.arrayBuffer()),
            ]).then( ([js, wasm]) => {
                WorkedBASISLoader.runTranscoder(Object.assign(options, {
                    jsSource: js, wasmSource: wasm
                }));
            });
        }

        static runTranscoder(options: {jsSource: string, wasmSource: ArrayBuffer, threads: number, ext: any}) {
            const trans = new WorkedBASIS.TranscoderWorkerPool(options.threads || 2);
            
            super.bindTranscoder(trans as any, options.ext);

            const idx = Loaders.indexOf(BASISLoader);
            Loaders[idx] = WorkedBASISLoader;

            return trans.init(options.jsSource, options.wasmSource);
        }

        levelBufferSize(width:number, height: number, mip: number) {
            return this._mips[mip].size;
        }
    }
}