###
  Loads an image and gives access to pixel data.
  
  @class bkcore.ImageData
  @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
###
class ImageData

  ###
    Creates a new ImageData object
    
    @param path string The path of the image
    @param callback function A callback function to be called
      once th eimage is loaded
  ###
  constructor: (path, callback)->

    @image = new Image
    @pixels = null
    @canvas = null
    @loaded = false

    @image.onload = ()=>

      @canvas = document.createElement('canvas')
      @canvas.width = @image.width
      @canvas.height = @image.height

      context = @canvas.getContext('2d')
      context.drawImage(@image, 0, 0)

      @pixels = context.getImageData(0,0, @canvas.width, @canvas.height)
      @loaded = true

      context = null
      @canvas = null
      @image = null

      callback?.call(@)

    @image.crossOrigin = "anonymous"
    @image.src = path

  ###
    Gets pixel RGBA data at given index
    
    @param x int In pixels
    @param y int In pixels
    @return Object{r,g,b,a}
  ###
  getPixel: (x, y)->

    if !@pixels? or x < 0 or y < 0 or x >= @pixels.width or y >= @pixels.height
      return {r: 0, g: 0, b:0, a:0}

    i = (y*@pixels.width + x) * 4

    return {
      r: @pixels.data[i]
      g: @pixels.data[i+1]
      b: @pixels.data[i+2]
      a: @pixels.data[i+3]
    }

  ###
    Gets pixel RGBA data at given float index using bilinear interpolation
    
    @param x float In subpixels
    @param y float In subpixels
    @return Object{r,g,b,a}
  ###
  getPixelBilinear: (fx, fy)->

    x = Math.floor(fx)
    y = Math.floor(fy)
    rx = fx - x - .5
    ry = fy - y - .5
    ax = Math.abs(rx)
    ay = Math.abs(ry)
    dx = if rx < 0 then -1 else 1
    dy = if ry < 0 then -1 else 1

    c = @getPixel(x, y)
    cx = @getPixel(x+dx, y)
    cy = @getPixel(x, y+dy)
    cxy = @getPixel(x+dx, y+dy)

    cf1 = [
      (1-ax) * c.r + ax * cx.r
      (1-ax) * c.g + ax * cx.g
      (1-ax) * c.b + ax * cx.b
      (1-ax) * c.a + ax * cx.a
    ]

    cf2 = [
      (1-ax) * cy.r + ax * cxy.r
      (1-ax) * cy.g + ax * cxy.g
      (1-ax) * cy.b + ax * cxy.b
      (1-ax) * cy.a + ax * cxy.a
    ]

    return {
      r: (1-ay) * cf1[0] + ay * cf2[0]
      g: (1-ay) * cf1[1] + ay * cf2[1]
      b: (1-ay) * cf1[2] + ay * cf2[2]
      a: (1-ay) * cf1[3] + ay * cf2[3]
    }

  ###
    Gets pixel data at given index
    as 3-bytes integer (for floating-point textures erzats, from RGB values)
    
    @param x int In pixels
    @param y int In pixels
    @return int (R + G*255 + B*255*255)
  ###
  getPixelF: (x, y)->

    c = @getPixel(x, y)
    return c.r + c.g * 255 + c.b * 255 * 255

  ###
    Gets pixel data at given float index using bilinear interpolationas
    as 3-bytes integer (for floating-point textures erzats, from RGB values)
    
    @param x float In subpixels
    @param y float In subpixels
    @return Object{r,g,b,a}
  ###
  getPixelFBilinear: (fx, fy)->

    c = @getPixelBilinear(fx, fy)
    return c.r + c.g * 255 + c.b * 255 * 255

###
  Exports
  @package bkcore
###
exports = exports ? @
exports.bkcore ||= {}
exports.bkcore.ImageData = ImageData