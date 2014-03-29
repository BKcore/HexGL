var pgli = pgli || {};

pgli.App = gamecore.Base.extend("App",
{ // static

},
{ // instance

	project: null,
	moduleList: null,
	editor: null,
	diagram: null,
	preview: null,
	nodeCount: 0,
	console: null,
	debug: 2, // 0:none, 1:inapp, 2:console, 3:both

	init: function(domDiagram, domModuleList, domEditor, domPreview)
	{
		var self = this;

		this.moduleList = new pgli.ui.ModuleList(domModuleList);

		this.editor = ace.edit(domEditor);
		this.editor.setFontSize("16px");
		this.editor.setTheme("ace/theme/monokai");
		this.editor.getSession().setMode("ace/mode/json");

		this.diagram = new pgli.diagram.Diagram(domDiagram, 30);

		this.preview = new pgli.render.CanvasRenderer(domPreview);

		this.console = $('#console-text');

		this.bindEvents();

		pgli.lang.Parser.debug = self.debug;

		window.trace = function(args)
		{
			if(!self.debug) return;
			for(var i=0, len=arguments.length; i<len; ++i)
			{
				if(self.debug < 2) console.log(arguments[i]);
				if(self.debug == 1 || self.debug == 3) return;
				self.console.append(arguments[i].toString()+"\n");
				self.console.scrollTop(
			        self.console[0].scrollHeight - self.console.height()
			    );
			};
		}

		window.clearTrace = function()
		{
			self.console.text("");
		}
	},

	bindEvents: function()
	{
		var self = this;

		$(window).on('resize', function(){ return self.resize.call(self); });
		$(document).bind('keydown', function(e){ return self.onKeyDown.call(self,e); });
		$('#modules').on('drop', function(e) { return self.onDropEvent.call(self,e); });
		//window.addEventListener("drop",function(e){ return self.onDropEvent.call(self,e); }) ;
		 
	},

	bindProject: function(project)
	{
		this.nodeCount = 0;
		this.project = project;
		this.project.setAppInstance(this);
		this.moduleList.bindProject(project);
		this.preview.bindProject(project);
		this.draw();
	},

	draw: function()
	{
		this.moduleList != undefined && this.moduleList.draw();
		//this.preview.draw();
	},

	showInEditor: function(module)
	{
		this.project.setActiveFile(module);
		this.editor.getSession().setValue(this.project.files.get(module));
	},

	getEditorContent: function()
	{
		return this.editor.getSession().getValue();
	},

	addDiagramNode: function(key, module)
	{
		this.diagram.addNode(new pgli.diagram.Node(key, module, 50 + 160 * this.nodeCount++, 50));
	},

	resize: function()
	{
		this.diagram.resize();
		this.preview.resize();
	},

	saveModule: function()
	{
		for(var i=0; i<this.project.keys.length;i++)
		{
			var name = this.project.keys[i]
			var fileToSave = this.project.getModule(name);
			var jsonData = {file :'files/'+name ,obj: fileToSave};

			$.ajax({
			url:"/",
			type:"POST",
			data: JSON.stringify(jsonData),
    		contentType: "application/json; charset=utf-8",
    		dataType: "text",
			success:function(a)
			{
				console.log("AJAX POST OK: ", a);
			},
			error: function(a)
			{
				console.log("AJAX POST ERROR: ", a);
			}
			});
			
			console.log("STARTED AJAX REQUEST");
		}
		
	},

	onKeyDown: function(e)
	{
		if(e.keyCode==117)
		{
			this.updateDiagram();
			e.preventDefault();
			return false;
		}
		else if(e.keyCode==118)
		{
			this.preview.draw();
			e.preventDefault();
			return false;
		}
		else if(e.keyCode==119)
		{
			this.saveModule();
			e.preventDefault();
			return false;
		}	
	},

	updateDiagram:function()
	{
		this.project.rememberActiveFile();
		
		for(var i = 0, len = this.project.keys.length; i<len; i++)
		{

			var object = pgli.lang.Parser.parseModule(this.project.files.get(this.project.keys[i]));
		    this.project.modules.put(this.project.keys[i], object);
		    this.diagram.getNode(this.project.keys[i]).module = object;
		    //this.getNode.updateModule()...

		}

		this.diagram.draw();
	},

	onDropEvent: function(e)
	{
		trace("#Parsing dropped file(s)...");
		e.preventDefault();
		var self = this;

		var length = e.originalEvent.dataTransfer.files.length;
		for (var i = 0; i < length; i++) 
		{
			var file = e.originalEvent.dataTransfer.files[i];
			console.log(file);

			fileName = file.name;

			if(i == 0 && this.project == null)
			{
				var path = window.prompt("Please prove project's root path (with trailing slash).", "../files/");
				trace("#Opening new project from ["+fileName+"]...");
				this.bindProject(new pgli.Project(path+fileName, function(){ 
					self.draw(); 
					self.showInEditor(self.project.root);
				}));
			}
			else
				this.project.loadFile(self.project.path+fileName,fileName,true,true);

		}

		this.draw();
		return false;
		

	}



});