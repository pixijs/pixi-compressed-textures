// @ts-nocheck 
declare var BASIS: any;

namespace pixi_compressed_textures.WorkedBASIS {
	export const basisWorkerSource = function () {
		let _BasisFile : any;
		function init (message : any) {
			const bin = message.wasmBinary as ArrayBuffer;
			__init (bin).then(()=>{
				self.postMessage({
					type : "init", status : true, buffer : bin
				}, "*", [bin]); // return back for next workers
			});
		}

		function transcode(message : any) {
			try {
				const res = __transcode( message.buffer, message.config);

				Object.assign(res, {
					type : 'transcode',
				});
				self.postMessage( res, "*", [res.buffer.buffer] );

			} catch ( error ) {
				console.error( error );
				self.postMessage( { type: 'error', id: message.id, error: error.message },  "*" );
			}
		}

		onmessage = function ( e ) {
			const message = e.data;
			const func = self[message.type];
			if(func) {
				//@ts-ignore
				func(message);
			}
		};

		function __init( wasmBinary: ArrayBuffer ) {

			let Module: any;
			return new Promise( ( resolve ) => 
			{
				Module = { wasmBinary, onRuntimeInitialized: resolve };
				return BASIS(Module);

			}).then( () => {
				const { BasisFile, initializeBasis } = Module;

				_BasisFile = BasisFile;
				initializeBasis();
			});
		}

		function __transcode( buffer : ArrayBuffer, config: any ) {
			const basisFile = new _BasisFile( new Uint8Array( buffer ) );
			const width = basisFile.getImageWidth( 0, 0 );
			const height = basisFile.getImageHeight( 0, 0 );
			const levels = config.genMip ? basisFile.getNumLevels( 0 ) : 1;
			const hasAlpha = basisFile.getHasAlpha();

			const cleanup = () => {
				basisFile.close();
				basisFile.delete();
			};

			if (!width || !height || !levels ) {
				cleanup();
				throw 'Invalid .basis file';
			}

			if ( ! basisFile.startTranscoding() ) {
				cleanup();
				throw '.startTranscoding failed';
			}

			let totalSize = 0;
			let offset = 0;
			let targetBuffer = undefined;
			
			const mipmaps = [];
			const target = hasAlpha ? config.rgbaFormat : config.rgbFormat;

			for ( let mip = 0; mip < levels; mip ++ ) {
				const mipWidth = basisFile.getImageWidth( 0, mip );
				const mipHeight = basisFile.getImageHeight( 0, mip );
				const size = basisFile.getImageTranscodedSizeInBytes( 0, mip, target );
				
				//calc total size of buffer for all mips
				totalSize += size;
				mipmaps.push( { width: mipWidth, height: mipHeight, format: target, size } );
			}

			targetBuffer = new Uint8Array(totalSize);
			for ( let mip = 0; mip < levels; mip ++ ) {
				const size = mipmaps[mip].size;
				const dst = new Uint8Array(targetBuffer.buffer, offset, size);
				const status = basisFile.transcodeImage(
					dst,
					0,
					mip,
					target,
					0,
					0
				);

				if (!status) {
					cleanup();
					throw '.transcodeImage failed.';
				}
				
				offset += size;
				//mipmaps[mip].data = dst;
			}

			cleanup();
			return { width, height, hasAlpha, mipmaps, buffer : targetBuffer};
		}
	}

	export function generateWorker(basisJSSource: string): Worker {
		let source = basisWorkerSource.toString();
		const b0 = source.indexOf("{");
		const b1 = source.lastIndexOf("}");
	 
		source = basisJSSource + "\n" + source.substring(b0 + 1, b1);
		return new Worker(URL.createObjectURL(new Blob([source])));
	} 
}