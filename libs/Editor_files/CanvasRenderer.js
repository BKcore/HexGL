var pgli = pgli || {};
pgli.render = pgli.render || {};

pgli.render.CanvasRenderer = gamecore.Base.extend('CanvasRenderer',
{ // static

	SCOPE_KEYWORDS: {
		'use': 0,
		'repeat': 1,
		'comment': 2
	},
	SCOPE_XFORMS: {
		'x': 1,
		'y': 2,
		'width': 3,
		'height': 4,
		'scale': 0
	},
	REPEAT_TYPES: {
		'none': 'no-repeat',
		'x': 'repeat-x',
		'y': 'repeat-y',
		'xy': 'repeat'
	}

},
{ // instance

	dom: null,
	container: null,
	canvas: null,
	context: null,
	width: 1024,
	height: 768,
	project: null,
	xform: [],
	xseek: -1,
	scope: [],
	sseek: -1,
	resources: {
		images: []
	},
	variables: null,

	/**
	 * Bind a new renderer to given canvas
	 * @param  jQuery.DOMElement domElement [description]
	 * @param  Integer width      [description]
	 * @param  Integer height     [description]
	 */
	init: function(domElement)
	{
		this.dom = domElement;
		this.container = $('#'+this.dom);
		this.canvas = document.createElement("Canvas");
		this.container.append(this.canvas);

		this.resize();

		this.variables = new gamecore.Hashtable();
	},

	draw: function()
	{
		clearTrace();

		if(!this.project)
		{
			trace("#Render failed: No project loaded");
			return;
		}
		trace("#Starting renderer...");

		this.context.clearRect(0, 0, this.width, this.height);

		var ratio = this.getRenderRatio();
		var root = this.project.getRootModule();
		var w = root.width*ratio;
		var h = root.height*ratio;
		var x = Math.round((this.width - w)/2);
		var y = Math.round((this.height - h)/2);

		this.sreset();
		this.xreset(ratio, x, y, w, h);
		this.walkModule(root);
	},

	walkModule: function(module)
	{
		if(!module) return;

		trace("#Render: "+module.name);

		if("params" in module) for(p in module.params)
			this.sset(p, module.params[p]);

		if("vars" in module)
			this.actionVars(module.vars);

		if("fill" in module)
			this.actionFill(module.fill);

		if("layers" in module) for(var i=0, len=module.layers.length; i<len; ++i)
		{
			var layer = module.layers[i];
			if("use" in layer)
			{
				if("repeat" in layer)
				{
					var iterator;

					try {
						iterator = pgli.lang.Parser.parseRepeat(layer.repeat, this.sget());
						trace("#  Found repeat layer ["+iterator.varname+" from "+iterator.start+" to "+iterator.end+"]");
					} catch(e) {
						trace("(!) Syntax error in repeat expression ["+layer.repeat+"]");
						continue;
					}
					
					while(iterator.loop())
					{
						this.sset(iterator.varname, iterator.step);
						this.walkLayer(layer);
						iterator.next();
					}
				}
				else
				{
					this.walkLayer(layer);
				}
			}
		}
	},

	walkLayer: function(layer)
	{
		var static = pgli.render.CanvasRenderer;

		this.xpush();
		this.spush();

		for(k in layer)
		{
			if(k in static.SCOPE_KEYWORDS)
				continue;
			else if(k in static.SCOPE_XFORMS)
			{
				var val = pgli.lang.Parser.parseExpression(layer[k], this.sget(), this.xget());
				if(typeof(val) == "number")
				{
					val = Number(val)*this.xgetr();
				}
				else
				{
					var p = val.search("%");
					if(p > 0)
						val = (Number(val.substr(O, p))/100)*this.xget()[static.SCOPE_XFORMS[k]];
					else continue;
				}
				if(k == "x" || k == "y")
				{
					val += this.xget()[static.SCOPE_XFORMS[k]];
				}
				this.xset(static.SCOPE_XFORMS[k], val);
			}
			else
				this.sset(k, pgli.lang.Parser.parseExpression(layer[k], this.sget()), this.xget());
		}

		this.walkModule(this.project.getModule(layer.use));
		
		this.spop();
		this.xpop();
	},

	actionVars: function(opts)
	{
		var static = pgli.render.CanvasRenderer;

		for(k in opts)
		{
			if(k in static.SCOPE_KEYWORDS || k in static.SCOPE_XFORMS)
				continue;
			else
				this.sset(k, pgli.lang.Parser.parseExpression(opts[k], this.sget(), this.xget()));
		}
	},

	actionFill: function(opts)
	{
		var static = pgli.render.CanvasRenderer;

		if(opts.type == "image")
		{
			//trace("#  Fill(image)...")
			var image = this.loadImage(
					pgli.lang.Parser.parseExpression(opts.value, this.sget(), this.xget())
				);

			if("repeat" in opts && opts.repeat in static.REPEAT_TYPES)
			{
				var pattern = this.context.createPattern(image, static.REPEAT_TYPES[opts.repeat]);

				this.context.rect(this.xgetx(), this.xgety(), this.xgetw(), this.xgeth());
				this.context.fillStyle = pattern;
				this.context.fill();

				//pattern = null;
			}
			else
			{
				this.context.drawImage(image, this.xgetx(), this.xgety(), this.xgetw(), this.xgeth());
			}
		}
		else if(opts.type == "color")
		{
			//trace("#  Fill(color)...")
			this.context.beginPath();
			this.context.rect(this.xgetx(), this.xgety(), this.xgetw(), this.xgeth());
			this.context.fillStyle = pgli.lang.Parser.parseExpression(opts.value, this.sget(), this.xget());
			this.context.fill();
		}
		else if(opts.type == "line")
		{
			//trace("#  Fill(line)...")
			this.context.beginPath();
			this.context.rect(this.xgetx(), this.xgety(), this.xgetw(), this.xgeth());
			this.context.lineWidth = 1;
			this.context.strokeStyle = pgli.lang.Parser.parseExpression(opts.value, this.sget(), this.xget());
			this.context.stroke();
		}
	},

	loadImage: function(url)
	{
		var self = this;
		if(url in this.resources.images)
		{
			return this.resources.images[url];
		}
		else
		{
			trace("/!\\ Image is loading, will redraw onload.");
			var img = new Image();
			img.onload = function(){
				trace("#Image loaded, redrawing...");
				self.draw();
			};
			img.src = url;
			this.resources.images[url] = img;
			return img;
		}
	},

	spush: function()
	{
		this.scope.push(this.cloneScope(this.sget()));
		this.sseek++;
	},

	spop: function()
	{
		this.sseek--;
		return this.scope.pop();
	},

	sreset: function()
	{
		this.scope = [{}];
		this.sseek = 0;
	},

	sget: function()
	{
		return this.scope[this.sseek];
	},

	sset: function(key, value)
	{
		this.scope[this.sseek][key] = value;
	},

	xpush: function(ratio, x, y, h, w)
	{
		if(ratio == undefined)
			if(this.xseek == -1)
				this.xform.push([1.0, 0, 0, this.width, this.height]);
			else
				this.xform.push(this.xget().slice(0))
		else
			this.xform.push([ratio, x, y, h, w]);
		
		this.xseek++;
	},

	xpop: function()
	{
		this.xseek--;
		return this.xform.pop();
	},

	xget: function()
	{
		return this.xform[this.xseek];
	},

	xset: function(key, value)
	{
		this.xform[this.xseek][key] = value;
	},

	xreset: function(ratio, x, y, h, w)
	{
		this.xseek = -1;
		this.xform = [];
		this.xpush(ratio, x, y, h, w);
	},

	xgetr: function()
	{
		return this.xform[this.xseek][0];
	},

	xgetx: function()
	{
		return this.xform[this.xseek][1];
	},

	xgety: function()
	{
		return this.xform[this.xseek][2];
	},

	xgetw: function()
	{
		return this.xform[this.xseek][3];
	},

	xgeth: function()
	{
		return this.xform[this.xseek][4];
	},

	cloneScope: (function()
	{ 
		return function (obj) { Clone.prototype=obj; return new Clone() };
		function Clone(){}
	}()),

	bindProject: function(project)
	{
		this.project = project;
	},

	resize: function()
	{
		var w = this.container.width();
		var h = this.container.height();

		var size = 0.9*Math.min(w, h);
		this.width = size;
		this.height = size;
		var $canvas = $(this.canvas);
		$canvas.width(size);
		$canvas.height(size);
		this.canvas.width = size;
		this.canvas.height = size;
		$canvas.css('marginTop', this.container.height() / 2 - size / 2);
		$canvas.css('marginLeft', this.container.width() / 2 - size / 2);

		this.context = this.canvas.getContext("2d");

		/*var ctx = this.canvas.getContext("2d");
		ctx.clearRect(0, 0, size, size);
		ctx.canvas.width = ctx.canvas.height = size;
		ctx.font = 'bold 40px Arial';
		ctx.textAlign = 'center';
		ctx.fillStyle = '#444';
		ctx.fillText("Preview", size/2, size/2);*/
	},

	getRenderRatio: function()
	{
		var root = this.project.getRootModule();
		if(!root) return;
		return Math.min(this.width/root.width, this.height/root.height);
	}

});