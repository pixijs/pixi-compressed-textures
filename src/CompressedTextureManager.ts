/// <reference path="./loaders/ASTCLoader.ts"/>
/// <reference path="./loaders/DDSLoader.ts"/>
/// <reference path="./loaders/PVRTCLoader.ts"/>
/// <reference path="./loaders/BASISLoader.ts"/>
/// <reference path="./loaders/CRNLoader.ts"/>

declare namespace PIXI.systems {
	interface TextureSystem {
		initCompressed?(): void;

		registerCompressedLoader?(loader: any): void;

		compressedExtensions?: any;
	}
}

namespace pixi_compressed_textures {

	export let Loaders: Array<any> = [
		DDSLoader,
		PVRTCLoader,
		ASTCLoader,
		CRNLoader
	];

	PIXI.systems.TextureSystem.prototype.initCompressed = function () {
		const gl = this.gl;
		if (!this.compressedExtensions) {
			this.compressedExtensions = {
				dxt: gl.getExtension("WEBGL_compressed_texture_s3tc"),
				pvrtc: (gl.getExtension("WEBGL_compressed_texture_pvrtc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc")), // 09-21-2019 -- IOS require it
				astc: gl.getExtension("WEBGL_compressed_texture_astc"),
				atc: gl.getExtension("WEBGL_compressed_texture_atc"),
				etc1: gl.getExtension("WEBGL_compressed_texture_etc1")
			};
			this.compressedExtensions.crn = this.compressedExtensions.dxt;
		}
	};

	export function RegisterCompressedLoader(...loaders: any[]): void {
		Loaders = Loaders || [];
		for (let e in loaders) {
			if (Loaders.indexOf(loaders[e]) < 0) {
				Loaders.push(loaders[e])
			}
		}
	}

	export let defaultDetectedExtensions = ['.png', '.jpg', '.json', '.atlas'];

	export function detectExtensions(renderer: PIXI.Renderer, resolution?: number, defaultResolution: number = 1) {
		let extensions = [];
		if (renderer instanceof PIXI.Renderer) {
			renderer.texture.initCompressed();
			let data = renderer.texture.compressedExtensions;
			if (data.dxt) extensions.push('.dds');
			if (data.pvrtc) extensions.push('.pvr');
			if (data.atc) extensions.push('.atc');
			if (data.astc) extensions.push('.astc');
			if (data.etc1) extensions.push('.etc1');
		}
		//retina or not
		let ext = extensions.slice(0);

		let resolutions = [resolution || renderer.resolution];
		if (defaultResolution) {
			resolutions.push(defaultResolution);
		}

		for (let i = 0; i < resolutions.length; i++) {
			let res = "@" + resolutions[i] + "x";
			for (let j = 0; j < ext.length; j++) {
				extensions.push(res + ext[j]);
			}
			for (let j = 0; j < defaultDetectedExtensions.length; j++) {
				extensions.push(res + defaultDetectedExtensions[j]);
			}
		}
		return extensions;
	}
}
