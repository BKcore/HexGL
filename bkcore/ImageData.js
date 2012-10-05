/*!
 * @class bkcore.ImageData
 *
 * Loads an image and gives access to pixel data.
 * 
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 */

/*!
 * @package bkcore
 */
var bkcore = bkcore || {};

/*!
 * Creates a new ImageData object
 * 
 * @param path String The path of the image
 * @param callback Function A callback function to be called once th eimage is loaded
 */
bkcore.ImageData = function(path, callback)
{
	var self = this;

	this.image = new Image();
	this.pixels = null;
	this.canvas = null;
	this.loaded = false;

	this.image.onload = function() {
	    self.canvas = document.createElement('canvas');
	    self.canvas.width = self.image.width;
	    self.canvas.height = self.image.height;

	    var context = self.canvas.getContext('2d');
	    context.drawImage(self.image, 0, 0);

	    self.pixels = context.getImageData(0, 0, self.canvas.width, self.canvas.height);

	    self.loaded = true;

	    context = null;
	    self.canvas = null;
	    self.image = null;

	    if(callback) callback.call(self);	    
	};
	this.image.crossOrigin = "anonymous";
	this.image.src = path;
};

/*!
 * Gets pixel RGBA data at given index
 * 
 * @param x int In pixels
 * @param y int In pixels
 * @return Object{r,g,b,a}
 */
bkcore.ImageData.prototype.getPixel = function(x, y)
{
	if(this.pixels == null
		|| x < 0
		|| y < 0
		|| x >= this.pixels.width
		|| y >= this.pixels.height)
		return {r: 0, g: 0, b: 0, a:0};

	var index = (y*this.pixels.width + x) * 4;

    return {
    	r: this.pixels.data[index],
    	g: this.pixels.data[index + 1],
    	b: this.pixels.data[index + 2],
    	a: this.pixels.data[index + 3]
    };
};

/*!
 * Gets pixel RGBA data at given float index using bilinear interpolation
 * 
 * @param x float In subpixels
 * @param y float In subpixels
 * @return Object{r,g,b,a}
 */
bkcore.ImageData.prototype.getPixelBilinear = function(fx, fy)
{
	var x = Math.floor(fx);
	var y = Math.floor(fy);
	var rx = fx - x - .5;
	var ry = fy - y - .5;
	var ax = Math.abs(rx);
	var ay = Math.abs(ry);
	var c, cxy, cx, cy, cf1, cf2;
	var dx = rx < 0 ?  -1 : 1;
	var dy = ry < 0 ? -1 : 1;
	
	c = this.getPixel(x, y);
	cx = this.getPixel(x+dx, y);
	cy = this.getPixel(x, y+dy);
	cxy = this.getPixel(x+dx, y+dy);

	cf1 = [
		(1-ax) * c.r + ax * cx.r,
		(1-ax) * c.g + ax * cx.g,
		(1-ax) * c.b + ax * cx.b,
		(1-ax) * c.a + ax * cx.a
	];

	cf2 = [
		(1-ax) * cy.r + ax * cxy.r,
		(1-ax) * cy.g + ax * cxy.g,
		(1-ax) * cy.b + ax * cxy.b,
		(1-ax) * cy.a + ax * cxy.a
	];
	
	return {
		r: (1-ay) * cf1[0] + ay * cf2[0],
		g: (1-ay) * cf1[1] + ay * cf2[1],
		b: (1-ay) * cf1[2] + ay * cf2[2],
		a: (1-ay) * cf1[3] + ay * cf2[3]
	};
}

/*!
 * Gets pixel data at given index 
 * as 3-bytes integer (for floating-point textures erzats, from RGB values)
 * 
 * @param x int In pixels
 * @param y int In pixels
 * @return int (R + G*255 + B*255*255)
 */
bkcore.ImageData.prototype.getPixelF = function(x, y)  
{ 
	var color = this.getPixel(x, y);
	return color.r + color.g * 255 + color.b * 255 * 255; 
};

/*!
 * Gets pixel data at given float index using bilinear interpolationas
 * as 3-bytes integer (for floating-point textures erzats, from RGB values)
 * 
 * @param x float In subpixels
 * @param y float In subpixels
 * @return Object{r,g,b,a}
 */
bkcore.ImageData.prototype.getPixelFBilinear = function(fx, fy)
{
	var color = this.getPixelBilinear(fx, fy);
	return color.r + color.g * 255.0 + color.b * 255.0 * 255.0; 
}