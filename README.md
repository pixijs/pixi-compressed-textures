# pixi-textures
Compressed textures and retina support for pixi v3. Loader can choose textures depends on platform and rendering mode.

## Usage

### How to load texture format depending on browser

If you are just including the built files, library will adds itself to a pixi namespace:

```js
var renderer = PIXI.autoDetectRenderer({ width: 800, height: 600, resolution: 2 });
// textureParser will form list of allowed extensions based on renderer.
var textureParser = PIXI.compressedTextures.textureParser(renderer);
var loader = new PIXI.loaders.Loader();
loader.use(textureParser);
// use @2x texture if resolution is 2, use dds format if its windows
var textureOptions1 = { ext: ["@2x.dds", "@2x.png", ".dds", ".png"] };
// use dds format if its windows but dont care for retina
var textureOptions2 = { ext: [".dds", ".png"] };

var stage = new PIXI.Container();

loader.add('building1', 'img/building', textureOptions1)
    .add('building2', 'img/building', textureOptions2)
    .add('building3', 'img/building.png')
    .load(function(loader, resources) {
        //if you want to preload all textures into videomemory. Its good if your textures are 2048x2048.
        textureParser.updateAllTextures(renderer);

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
var textureParser = TEX.textureParser(renderer);
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
