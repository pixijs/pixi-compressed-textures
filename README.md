# pixi-textures
Compressed textures and retina support for pixi v4. Loader can choose textures depends on platform and rendering mode.

## Minimum demo

Pretty easy to hack parser into your loader.

```js
var loader = new PIXI.loaders.Loader();
loader.before(PIXI.compressedTextures.imageParser());
loader.add('building', 'building.dds');
loader.load(function(loader, resources) {
    var sprite = new PIXI.Sprite(resources['building'].texture);
});
```

## Full example

If your app has no detection of supported formats it is not ready for production.

This [example](https://ivanpopelyshev.github.io/examples/index.html?s=textures&f=dds.js&title=DirectDrawSurface%20(DDS)&plugins=pixi-compressed-textures)
shows how to handle multiple resolutions and multiple image formats for single images and for atlases.

```js
var renderer = PIXI.autoDetectRenderer(800, 600, { resolution: window.devicePixelRatio || 1 });
renderer.view.style.width = "800px";
renderer.view.style.height = "600px";
document.body.appendChild(renderer.view);

// this will form list of allowed extensions based on renderer.
var extensions = PIXI.compressedTextures.detectExtensions(renderer);

var loader = new PIXI.loaders.Loader();
// this middleware chooses appropriate file. It also has imageParser() inside
loader.before(PIXI.compressedTextures.extensionChooser(extensions));
// use @2x texture if resolution is 2, use dds format if its windows
var textureOptions1 = { metadata: {choice: ["@2x.png", ".dds", "@2x.dds"]} };
// use dds format if its windows but dont care for retina
var textureOptions2 = { metadata: {choice: [".dds"]} };
// while loading atlas, choose resolution for atlas and choose format for image
var atlasOptions = { metadata: { choice: ["@2x.json"], imageMetadata: { choice: [".dds"]} } };

var stage = new PIXI.Container();

loader.add('building1', '_assets/compressed/building1.png', textureOptions1)
    .add('building2', '_assets/compressed/building2.png', textureOptions2)
    .add('atlas1', '_assets/compressed/buildings.json', atlasOptions )
    .load(function(loader, resources) {
        // You have to preload all compressed textures into videomemory, pixi renderer cant do that for you.
        // You also can specify different renderer or set in that function
        // and this thing doesnt work for canvas
        if (renderer.type == PIXI.RENDERER_TYPE.WEBGL)
            renderer.plugins.compressedTextureManager.updateAllTextures(resources, true);

        var spr1 = new PIXI.Sprite(resources.building1.texture);
        var spr2 = new PIXI.Sprite(resources.building2.texture);
        var spr3 = new PIXI.Sprite.fromImage('goldmine_10_5.png');
        var spr4 = new PIXI.Sprite.fromImage('wind_extractor_10.png');
        spr1.position.y = spr3.position.y = 150;
        spr2.position.y = spr4.position.y = 350;
        spr1.position.x = spr2.position.x = 250;
        spr3.position.x = spr4.position.x = 450;
        stage.addChild(spr1);
        stage.addChild(spr2);
        stage.addChild(spr3);
        stage.addChild(spr4);
    });

animate();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(stage);
}
```

### Browserify

If you use browserify you can use pixi-textures like this:

```js
var PIXI = require('pixi.js'),
    TEX = require('pixi-compressed-textures');

var loader = new PIXI.loaders.Loader();
// textureParser will form list of allowed extensions based on renderer.
loader.before(PIXI.compressedTextures.extensionChooser(PIXI.compressedTextures.detectExtensions(renderer)));
```

## Building

You will need to have [node][node] and [gulp][gulp] setup on your machine.

Then you can install dependencies and build:

```js
npm i && npm run build
```

That will output the built distributables to `./dist`.

[node]:       http://nodejs.org/
[gulp]:       http://gulpjs.com/
