# pixi-textures
Compressed textures and retina support for pixi v3. Loader can choose textures depends on platform and rendering mode.

## Usage

### How to load texture with format depending on platform

If you are just including the built files, library will adds itself to a pixi namespace:

```js
var renderer = PIXI.autoDetectRenderer({ width: 800, height: 600, resolution: 2 });
var loader = new PIXI.loaders.Loader();
// textureParser will form list of allowed extensions based on renderer.
loader.use( PIXI.compressedTextures.textureParser(renderer) );
// use @2x texture if resolution is 2, use dds format if its windows
var textureOptions1 = { extra: {choice: ["@2x.png", ".dds", "@2x.dds"]} };
// use dds format if its windows but dont care for retina
var textureOptions2 = { extra: {choice: [".dds"]} };
// while loading atlas pass this thing to image
var atlasOptions = { extra: { imageExtra: { choice: [".dds"]} } };

var stage = new PIXI.Container();

loader.add('building1', 'img/building.png', textureOptions1)
    .add('building2', 'img/building.png', textureOptions2)
    .add('building3', 'img/building.png')
    .add('atlas1', 'img/atlas.json', atlasOptions )
    .load(function(loader, resources) {
        // You have to preload all compressed textures into videomemory, pixi renderer cant do that for you.
        // You also can specify different renderer or set in that function
        // and this thing doesnt work for canvas
        if (renderer.type == PIXI.RENDERER_TYPE.WEBGL)
            renderer.textureManager.updateAllTextures(resources, true);

        var spr = new Sprite(resources.building1.texture);
        var spr2 = new Sprite(resources.building2.texture);
        var spr3 = new Sprite(resources.building3.texture);
        spr1.position.x = spr2.position.x = spr3.position.x = 100;
        spr1.position.y = 50;
        spr2.position.y = 250;
        spr3.position.y = 450;
        stage.add(spr1);
        stage.add(spr2);
        stage.add(spr3);
    });
```

### Browserify

If you use browserify you can use pixi-textures like this:

```js
var PIXI = require('pixi.js'),
    TEX = require('pixi-compressed-textures');

var renderer = PIXI.autoDetectRenderer(800, 600);
var loader = new PIXI.loaders.Loader();
// textureParser will form list of allowed extensions based on renderer.
loader.use( PIXI.compressedTextures.textureParser(renderer) );
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
