# webgl-filter

A port of the WebGLImageFilter library. This version modernizes the original source code to esNext and es6 modules.

Thank you to Dominic Szablewski - phoboslab.org - for all the hard work!
https://github.com/phoboslab/WebGLImageFilter



webglFilter
==========

Construct a chain of image filters and apply them to an Image or Canvas element.
All filters are executed by WebGL Shaders which makes them pretty fast.


Demo: [phoboslab.org/log/2013/11/webgl-image-filter](http://phoboslab.org/log/2013/11/fast-image-filters-with-webgl)


Please also have a look at the excellent [glfx.js](https://github.com/evanw/glfx.js) by @evanw.


### Usage ###

```javascript
// Synopsis: create the filter object, add filters to it and apply
// it to an image

// Example:
import webglFilter from '@longlost/webgl-filter/webgl-filter.js';


const filter = webglFilter(); // A Factory function in this version.

filter.addFilter('hue', 180);
filter.addFilter('negative');
filter.addFilter('blur', 7);

// inputImage may be an Image, or even an HTML Canvas!
const filteredImage = filter.apply(inputImage);

// The 'filteredImage' is a canvas element. 
// You can draw it on a 2D canvas, or just add it to your DOM.

// Use .reset() to clear the current filter chain. 
// This is faster than creating a new webglFilter instance.
filter.reset();
```

#### Using an Existing Canvas element

Internally, webglFilter creates one canvas element, which is what the output filtered result is written to.
If you have an existing `canvas` element that you want to render to, you can configure webglFilter to use it:

```javascript

// In this case, filteredImage is an existing html canvas.
const filter = webglFilter({ canvas: filteredImage });

// ... filters setup here.

filter.apply(inputImage); 

// At this point, filteredImage has already been updated.

```


### Filters ###

#### Main filters ####
- `colorMatrix( matrix )` apply a the 5x5 color matrix (`Array[20]`), similar to Flash's ColorMatrixFilter
- `convolution( matrix )` apply a 3x3 convolution matrix (`Array[9]`)
- `blur( radius )` blur with radius in pixels


#### Presets using the main filters ####
- `brightness( amount )` change brightness. `1` increases the it two fold, `-1` halves it
- `saturation( amount )` change saturation. `1` increases the it two fold, `-1` halves it
- `contrast( amount )` change contrast. `1` increases the it two fold, `-1` halves it
- `negative()` invert colors
- `hue( rotation )` rotate the hue, values are `0-360`
- `desaturate()` desaturate the image by all channels equally
- `desaturateLuminance()` desaturate the image taking the natural luminace of each channel into acocunt
- `sepia()` sepia colors
- `brownie()` vintage colors
- `vintagePinhole()` vintage colors
- `kodachrome()` vintage colors
- `technicolor()` vintage colors
- `detectEdges()` detect edges
- `sobelX()` detect edges using a horizontal sobel operator
- `sobelY()` detect edges using a vertical sobel operator
- `sharpen( amount )` sharpen
- `emboss( size )` emboss effect with size in pixels
- `polaroid()` polaroid camera effect
- `shiftToBGR()` shift colors from RGB to BGR
- `pixelate(amount)` pixelate 


#### License
MIT