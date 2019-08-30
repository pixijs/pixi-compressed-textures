namespace pixi_compressed_textures {
	export class ExtensionFixer {
		static use(this: PIXI.Loader, resource: PIXI.LoaderResource, next: () => any) {
			if (resource.texture && resource._defaultUrlChoice && resource._defaultUrl !== resource.url) {
				let texture = resource.texture;
				let baseTexture = texture.baseTexture;

				const oldUrl = resource.url;
				const newUrl = resource._defaultUrlChoice;

				let ind = baseTexture.textureCacheIds.indexOf(oldUrl);
				if (ind >= 0) {
					baseTexture.textureCacheIds[ind] = newUrl;
					delete PIXI.utils.BaseTextureCache[resource.url];
					PIXI.utils.BaseTextureCache[newUrl] = baseTexture;
				}

				ind = texture.textureCacheIds.indexOf(oldUrl);
				if (ind >= 0) {
					texture.textureCacheIds[ind] = newUrl;
					delete PIXI.utils.TextureCache[resource.url];
					PIXI.utils.TextureCache[newUrl] = baseTexture;
				}
			}
			next();
		}
	}
}
