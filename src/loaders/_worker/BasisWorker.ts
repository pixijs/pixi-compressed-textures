interface IBasicResult {
    type? : 'error' | 'init' | 'transcode';
}

interface IInitResult extends IBasicResult {
    buffer? : ArrayBuffer;
}

interface IErrorResult extends IBasicResult{
    type:'error';
    error: string;
}

interface ITranscodeOptions {
    rgbaFormat : number;
    rgbFormat : number;
    genMip? : boolean;
    transfer? : boolean;
}

interface IMipmap {
    width : number;
    height: number;
    format: number;
    size: number;
}

interface ITranscodeResult extends IInitResult {
    type: 'transcode';
    hasAlpha: boolean;
    width: number;
    height: number;
    mipmaps: Array<IMipmap>;
}

namespace pixi_compressed_textures.WorkedBASIS {

    export class BasisWorker {
        static ID = 0;

        worker : Worker = undefined;
        id: number = BasisWorker.ID ++;
        free: boolean = false;
        initDone: boolean = false;
        binary: ArrayBuffer = undefined;

        private _rej: (e: any) => void = undefined;
        private _res: (e: any) => void = undefined;

        init(basisSource: string = undefined, basisBinary: ArrayBuffer = undefined) {
            if(!this.worker) {
                this.worker = generateWorker(basisSource);
            }

            if(!this.worker) {
                throw "Can't create worker";
            }

            if(this.initDone) {
                return Promise.resolve(true);
            }
            
            console.log(`[BASIS Worker ${this.id}] init start!`);

            this.worker.addEventListener("message", this._onMessage.bind(this));
            this.worker.addEventListener("error", this._onError.bind(this));        
            this.binary = basisBinary;

            const initStart = performance.now();

            return new Promise((res, rej)=>{
                this._rej = rej;
                this._res = res;
                this._init(basisBinary);
            }).then((res : IInitResult)=>{
                console.log(`[BASIS Worker ${this.id}] init done!`, performance.now() - initStart);

                this.initDone = true;
                this.free = true;
                this.binary = res.buffer;
                return true;
            });
        }

        transcode(buffer: ArrayBuffer, options: ITranscodeOptions) {
            if(!this.free) {
                throw `[BASIS Worker ${this.id}] Is busy! Check '.free' status!`;
            }

            if(!buffer 
                || options.rgbaFormat === undefined 
                || options.rgbFormat === undefined) {
                throw "Buffer and formats requred!";
            }

            const config = {
                rgbaFormat : options.rgbaFormat,
                rgbFormat : options.rgbFormat,
                genMip : options.genMip || false
            };

            this.free = false;
            return new Promise((res, rej) => {
                this._rej = rej;
                this._res = res;

                if(options.transfer) {
                    this.worker.postMessage({
                        type : "transcode",
                        buffer,
                        config
                    }, [buffer]);
                } else {
                    this.worker.postMessage({
                        type : "transcode",
                        buffer,
                        config
                    });
                }
            }).then((result: ITranscodeResult)=>{
                this.free = true;
                return result;
            })
        }

        _init(bin: ArrayBuffer) {
            this.worker.postMessage({
                type : "init", id : 0, wasmBinary: bin
            }, [bin]);
        }

        _onMessage (event: {data: IBasicResult}) {
            if(event.data.type === "error") {
                this._onError((event.data as IErrorResult).error);
            }

            if(this._res) {
                this._res(event.data);
            }
        }

        _onError (reason: string) {
            if(this._rej) {
                this._rej(reason);
            }
        }

        destroy() {
            this.worker.terminate();
        }
    }

    export class TranscoderWorkerPool {
        public workers: Array<BasisWorker> = [];
        private count: number = 1; 
        
        constructor(count:number = 0){
            this.count = count || 1;
        }

        init(jsSource: string, wasmSource: ArrayBuffer) {
            let  count = 0;
            const next = () => {
                if( ++count > this.count) {
                    return;
                }
                const w = new BasisWorker();
                this.workers.push(w);
                return w.init(jsSource, wasmSource).then(()=>{
                    wasmSource = w.binary;
                    next();
                 });
            };

            return next().then(()=>{
                return this;
            })
        }

        transcode(buffer: ArrayBuffer, options: ITranscodeOptions) {
            if(!this.workers || !this.workers.length) {
                throw "[TranscoderWorkerPool] Pool empty, populate before!";
            }
            const workers = this.workers;

            let freeWorker: BasisWorker = undefined;
            let iteration = 0;

            const search = (doneCallback : (w: BasisWorker) => void) => {
                for(let w of workers) {
                    if(w.free) {
                        freeWorker = w;
                        break;
                    }
                }

                if(iteration > 100) {
                    throw "[TranscoderWorkerPool] Can't found free worker after 100 interation!";
                }
    
                if(!freeWorker) {
                    setTimeout( () => search(doneCallback), 10 * iteration);
                } else {
                    doneCallback(freeWorker);
                }

                iteration ++;
            }
    
            return new Promise(search).then( (worker) =>{    
                console.log(`[TranscoderWorkerPool] run transcoding on ${worker.id} worker`);
                return worker.transcode(buffer, options);
            });
        }
        
        destroy() {
            this.workers.forEach((w)=>{
                w.destroy();
            })
            this.workers = undefined;
        }
    }
}
