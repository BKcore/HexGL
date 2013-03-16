var pgli = pgli || {};
pgli.lang = pgli.lang || {};

pgli.lang.Parser = gamecore.Base.extend('Parser',
{

	xStruct: {
		"scale": 0,
		"x": 1,
		"y": 2,
		"width": 3,
		"height": 4
	},


	patternVar:/\@(\w+)/g,
	patternMethod: /\#(\w+)(\(([^\)]+)\))/g,

	debug: 1,


	parseExpression: function(string, scope, xform)
	{
		static = pgli.lang.Parser;

		var self = this;
		var orig = string;
		var s = (scope !== null && typeof(scope) !== "undefined")
		var x = (xform !== null && typeof(xform) !== "undefined" && xform.length > 0)

		if(typeof(string) != "string")
			return string;

		if(scope != undefined)
		{
			string = string.replace(this.patternVar,function(match,varName)
			{
				if(x && varName in static.xStruct)
					return xform[static.xStruct[varName]];
				else if(s && varName in scope)
					return scope[varName]
				else
					return 0
			});
		}

		string = string.replace(this.patternMethod,function(match,methodName,a,params)
		{
			if(self.debug < 2) console.log(arguments);
			return self.execFunction(methodName, params);
		});

		if(self.debug < 2) console.log("#Parsed expr: '"+string+"' from '"+orig+"'");
		
		try {
			return eval(string);
		} catch (e) {
			return string;
		}
		

	},

	parseRepeat: function(string, scope)
	{
		var items = string.split(" ");

		if(items.length != 4)
			throw "Syntax error in repeat expression";

		if(self.debug < 2) console.warn(items[0].substr(1))
		if(self.debug < 2) console.warn(Number(this.parseExpression(items[1], scope)))
		if(self.debug < 2) console.warn(items[2])
		if(self.debug < 2) console.warn(Number(this.parseExpression(items[3], scope)))

		return new pgli.lang.Iterator(
			items[0].substr(1),
			Number(this.parseExpression(items[1], scope)),
			items[2],
			Number(this.parseExpression(items[3], scope))
		);
	},

	parseModule: function(string)
	{
		try
		{
			return JSON.parse(string);
		}
		catch(e)
		{
			trace("(!) Syntax error in module.");
			return {error:"unable to parse module"};
		}
	},

	execFunction: function(methodName, params)
	{
		var hasP = params != undefined;
		var p = hasP ? params.replace(" ", "").split(',') : [];

		if(methodName == "random")
		{
			var r = Math.random();
			if(hasP && p.length == 2) try
			{
				var min = eval(p[0]);
				var max = eval(p[1]);
				r = Math.round(r * (max-min) + min);
			} catch(e) {
				console.warn('Bad method format: '+methodName+' / '+params);
				return 0;
			}
			return r;
		}
		else if(methodName == "mod")
		{
			if(hasP && p.length == 2) try
			{
				var base = eval(p[0]);
				var div = eval(p[1]);
				if(div == 0) throw "Divide by 0";
				return Math.floor(base/div);
			} catch(e) {
				console.warn('Bad method format: '+methodName+' / '+params);
			}
			return 0;
		}
		else
		{
			console.warn("Unsupported method : "+methodName);
			return 0;
		}
	}
},
{

});


