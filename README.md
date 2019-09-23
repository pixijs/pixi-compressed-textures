# pixi-textures

Compressed textures and retina support for pixi v5. Loader can choose textures depends on platform and rendering mode.

You can use previous version with PixiJS v4 - [v4.x branch](https://github.com/pixijs/pixi-compressed-textures/tree/v4.x) npm version `1.1.8` 

Supports DDS (S3TC DXT1-3-5, ATC, ATCA/ATC explicit, ATCI/ATC interpolated), PVR (PVRTC, ETC1, S3TC DXT1-3-5, PVRTC 2-4bpp RGB-RGBA), ASTC (all blocks size) 2D LDR preset

Supports advanced DXT compression [crunch](https://github.com/BinomialLLC/crunch)

## Minimum demo

Pretty easy to hack parser into your loader.

```js
let loader = new PIXI.Loader();
loader.add('building', 'building.dds');
loader.load(function(loader, resources) {
    let sprite = new PIXI.Sprite(resources['building'].texture);
});
```

However if somehow pixi-compressed-textures was initialized after creation of loader, add a ImageParser to it:

```js
loader.use(PIXI.compressedTextures.ImageParser.use);
```

## Full example

If your app has no detection of supported formats it is not ready for production.

This [example](http://pixijs.github.io/examples/#/textures/dds.js)
shows how to handle multiple resolutions and multiple image formats for single images and for atlases.

```js
const app = new PIXI.Application({ resolution: window.devicePixelRatio || 1 });
document.body.appendChild(app.view);

// use empty array if you dont want to use detect feature
const extensions = PIXI.compressedTextures.detectExtensions(app.renderer);
const loader = app.loader;

loader.pre(PIXI.compressedTextures.extensionChooser(extensions));
// use @2x texture if resolution is 2, use dds format if its windows
const textureOptions1 = { metadata: { choice: ['@2x.png', '.dds', '@2x.dds'] } };
// use dds format if its windows but dont care for retina
const textureOptions2 = { metadata: { choice: ['.dds'] } };
// while loading atlas, choose resolution for atlas and choose format for image
const atlasOptions = { metadata: { choice: ['@2x.json', '@1x.json'], imageMetadata: { choice: ['.dds'] } } };

loader.add('building1', 'examples/assets/pixi-compressed-textures/building1.png', textureOptions1)
    .add('building2', 'examples/assets/pixi-compressed-textures/building2.png', textureOptions2)
    // will be swapped to @1xб because @1x is always detected and we've specified it in atlasOptions
    // look up `detectExtensions` code, params and output
    .add('atlas1', 'examples/assets/pixi-compressed-textures/buildings.json', atlasOptions)
    .load((loaderInstance, resources) => {
        const spr1 = new PIXI.Sprite(resources.building1.texture);
        const spr2 = new PIXI.Sprite(resources.building2.texture);
        const spr3 = PIXI.Sprite.from('goldmine_10_5.png');
        const spr4 = PIXI.Sprite.from('wind_extractor_10.png');
        spr1.y = spr3.y = 150;
        spr2.y = spr4.y = 350;
        spr1.x = spr2.x = 250;
        spr3.x = spr4.x = 450;
        app.stage.addChild(spr1, spr2, spr3, spr4);
    });
```

### Fixing it in cache

To fix url names in cache your have to add one extra loader plugin: extensionFixer.
 
It should be added after all other image-related plugins.

That way in the example above, image will appear under name `examples/assets/pixi-compressed-textures/building1.png`
and not `examples/assets/pixi-compressed-textures/building1.dds`.

```js
loader.use(PIXI.compressedTextures.ExtensionFixer.use);
```

### Using crunch

To use crunch you have to manually add `lib/crn_decomp.js` to your build. 

We cant help you with adding it in webpack or browserify or angular, its your job.

### Using BASIS

Basis format disabled by default and require transcoder.
Transcoder may be got from: https://github.com/BinomialLLC/basis_universal/tree/master/webgl/transcoder

This lib can't include transcoder because transcoder use wasm and is heavy (greater then 300kb) at the moment.

For using BASIS, you can bind transcoder to load, it register `.basis` to loader automatically.

#### Simple way:

```js

BASIS().then(Module => {

    const { BasisFile, initializeBasis } = Module;
    
    // run module
    initializeBasis();
    
    // init for getting `compressedExtensions`
    app.renderer.texture.initCompressed();

    // get supported extensions
    const supp = app.renderer.texture.compressedExtensions;
    
    // bind transcoder to loader with specific extensions
    PIXI.compressedTextures.BASISLoader.bindTranscoder(BasisFile, supp);
});

```

#### Worker:

Because BASIS is synchronous then it transcode a RGB texture of 1024x1024 pixels  ~30ms in main thread.
Using it in Worker is the rightest way.

`WorkedBASISLoader` use workers for transcoding.
There are few API for it:
    
```js
WorkedBASISLoader.loadAndRunTranscoder(options: 
    {
        path: string, // path to worker source `basis_transcoder.js` and `basis_transcoder.wasm`
        ext: any, //extensions from `app.renderer.texture.compressedExtensions`
        threads: number //workers count
    }) : Promise<void>
```
    
```js
WorkedBASISLoader.runTranscoder(options: 
    {
        jsSource: string, // text of jsFile
        wasmSource: ArrayBuffer, // buffer of wasm file
        threads: number,
        ext: any
    }): Promise<void>`
```
_Note: wasmSource is transferred to workers for faster initialisation._

You must call 1 or 2 before loading of `.basis` files .

Ex:
```js

app.renderer.texture.initCompressed();

// get supported extensions
const ext = app.renderer.texture.compressedExtensions;
const WBL = PIXI.compressedTextures.WorkedBASISLoader;
const pathToTranscoder = "/path/to/trancoder";

WBL.loadAndRunTranscoder({path : pathToTranscoder, ext: ext, threads : 2})
.then(() => {
    // BASIS transcoder is loaded, you can start loading .basis files
});

```

## Note about atlases

PIXI recognizes resolution of atlas by suffix (@1x, @2x, ... )

If you dont specify that, resolution of the atlas will be taken from "meta.scale" which in our example is 1 and 0.5 instead of 2 and 1. It will shrink everything!

### Browserify / WebPack / Angular

If you use browserify or Webpack you can use pixi-textures like this:

```js
import * as PIXI from "pixi.js';
window.PIXI = PIXI;
import "pixi-compressed-textures"; //or require("pixi-compressed-textures")
// textureParser will form list of allowed extensions based on renderer.
loader.pre(PIXI.compressedTextures.extensionChooser(PIXI.compressedTextures.detectExtensions(renderer)));
```

## Building

You will need to have [node][node]

Then you can install dependencies and build:

```js
npm i
npm run build
```

That will output the built distributables to `./dist`.

[node]:       http://nodejs.org/
