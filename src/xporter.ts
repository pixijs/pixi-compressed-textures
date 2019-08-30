/// <reference types="pixi.js" />

namespace pixi_compressed_textures {
	(PIXI as any).compressedTextures = pixi_compressed_textures;
}

declare module "pixi-compressed-textures" {
	export = pixi_compressed_textures;
}
