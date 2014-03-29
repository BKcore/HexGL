var pgli = pgli || {};
pgli.diagram = pgli.diagram || {};

pgli.diagram.Node = gamecore.Base.extend('Node',
{ // static
	layersWidth: 20,
	layersMargin: 20,
	layersHeight: 16,
	headerHeight: 40,
	slotX: 10,
	slotY: 14,
	slotRadius: 6
},
{ // instance
	module: null,

	key: null,

	shape: null,
	background: null,
	name: null,
	layers: null,
	slot: null,
	
	sockets: [],
	
	width: 150,
	height: 200,

	init: function(key, module, x, y)
	{
		var static = pgli.diagram.Node;

		this.key = key;
		this.module = module;

		this.shape = new Kinetic.Group({
			x: x == undefined ? 0 : x,
			y: y == undefined ? 0 : y,
			draggable: true
		});

		var layerCount = (module.layers != undefined ? module.layers.length : 0) + 1;

		this.height = static.headerHeight + layerCount * static.layersHeight;

		this.background = new Kinetic.Rect({
			x: 0,
			y: 0,
			width: this.width,
			height: this.height,
			fill: "#222",
			stroke: "#000",
			strokeWidth: 0.5,
			shadow: {
				color: "black",
				blur: 6,
				offset: [0, 0],
				opacity: 0.5
			}
		});

		this.layers = new Kinetic.Shape({
			drawFunc: function(ctx){
				ctx.beginPath();
				for(var i=0, len = this.attrs.count; i < len; ++i)
					ctx.arc(10, 10+i*static.layersHeight, static.slotRadius, 0, Math.PI*2, true); 
				ctx.closePath();
				this.fill(ctx);
			},
			x: this.width-static.layersWidth,
			y: static.layersMargin,
			count: layerCount,
			fill: "#111"
		});

		this.slot = new Kinetic.Circle({
			x: static.slotX,
			y: static.slotY,
			radius: static.slotRadius,
			fill: "#111"
		});

		this.name = new Kinetic.Text({
			x: 20,
			y: 6,
			text: module.name,
			fontSize: 13,
			fontFamily: "Ubuntu Mono",
			textFill: "#aaa"
		});

		this.shape.on('mousedown', function(){
			this.moveToTop();
		});

		this.shape.add(this.background);
		this.shape.add(this.name);
		this.shape.add(this.layers);
		this.shape.add(this.slot);
	},

	updateLayers: function()
	{
		var layerCount = (module.layers != undefined ? module.layers.length : 0) + 1;
		this.layers.attrs.count = layerCount;
	},

	getSlot: function()
	{
		var static = pgli.diagram.Node;
		return [this.shape.getX()+static.slotX, 
				this.shape.getY()+static.slotY];
	},

	getLayerSlot: function(index)
	{
		var static = pgli.diagram.Node;
		return [this.shape.getX()+this.width-static.layersWidth/2, 
				this.shape.getY()+10+index*static.layersHeight+static.layersMargin];
	}
});