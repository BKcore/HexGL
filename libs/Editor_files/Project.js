var pgli = pgli || {};


pgli.Project = gamecore.Base.extend('Project',
{
	patternRoot: /\/([a-z]+\.pmod)/ig,
	patternPath: /([a-z\/]+\/)[a-z]+\.pmod/ig

},

{
	appInstance: null,
	modules: null,
	activeFile: null,
	files:null,
	keys :[],
	name: "default",
	path: "/files/",
	root: "default.pmod",
	diagram: null,
	loadingQueue: [],
	onLoad: function() { console.log("Project loaded."); },

	

	init : function(projectFile, onLoad)
	{
		this.onLoad = onLoad;		
		this.modules = new gamecore.Hashtable();
		this.files = new gamecore.Hashtable();
		this.path = pgli.Project.patternPath.exec(projectFile)[1];
	    this.root = pgli.Project.patternRoot.exec(projectFile)[1];

	    var self = this;

    	this.loadFile(projectFile,this.root,true,true);
    		
	},

	loadFile: function(path,name,doDependencies,doDiagram)
	{
		trace("#Loading ["+name+"].");
		var self = this;
		var request = $.ajax({
	            url: path,
	            type: 'get',
	            dataType: "text",
		    })
		    .success(function(data)
		    {
		    	self.files.put(name, data);
		    	self.keys.push(name);

		    	var object = pgli.lang.Parser.parseModule(data);
		    	self.modules.put(name, object);

		    	if(doDependencies == true)
		    		self.loadDependencies(object);

		    	if(doDiagram == true)
		    		self.getAppInstance().addDiagramNode(name, object);

		    	trace("#["+name+"] loaded");
		  
		        self.onLoad();
		    })
		    .error(function()
		    {
		        throw "Unable to load file: " + path;
		    });
	},

	loadDependencies: function(object)
	{

		if(!("layers" in object))
			return;

		var layers = object.layers;
		var self = this;

		for (var i=0, len = layers.length; i<len ; i++)
		{
			if(!("use" in layers[i]) )
				continue;

			var layerName = layers[i].use;

			trace("#Found dependency ["+layerName+"]");

	    	(function(name,self)
	    	{
		    	self.loadFile(self.path+name,name,true,true);

	    	})(layerName,self);
		}

	},

	getModulesCount: function()
	{
		return this.keys.length;
	},

	getModule: function(key)
	{
		return this.modules.get(key);
	},

	getFile: function(key)
	{
		return this.files.get(key);
	},

	getModuleKey: function(index)
	{
		return this.keys[index];
	},

	getRootModule: function()
	{
		return this.modules.get(this.root);
	},

	isEmpty: function()
	{
		return (this.keys.length <= 0);
	},

	setAppInstance: function(app)
	{
		this.appInstance = app;
	},

	getAppInstance: function()
	{
		return this.appInstance;
	},

	setActiveFile: function(key)
	{
		this.activeFile = key;
	},

	rememberActiveFile: function()
	{
		if(!this.activeFile) return;

		this.files.put(this.activeFile, this.getAppInstance().getEditorContent());
	} 

	/*updateDiagram: function()
	{

	},

	render: function(canvasRenderer)
	{
		//canvasRenderer.Render(modules, root, new Hashtable());
	}*/

});