var pgli = pgli || {};
pgli.lang = pgli.lang || {};

pgli.lang.Iterator = gamecore.Base.extend('Iterator',
// Static
{
	MAX_ITERATIONS: 1000,

	COMPARATORS: {
		"<": 0,
		">": 1,
		"<=": 2,
		">=": 3
	},

	genComparatorMethod: function(type)
	{
		switch(type)
		{
		case 0:
			return function(a, b){ return a < b };
		case 1:
			return function(a, b){ return a > b };
		case 2:
			return function(a, b){ return a <= b };
		case 3:
			return function(a, b){ return a >= b };
		default:
			return function(a, b){ return false };
		}
	},

	genStepMethod: function(type, scope, attr)
	{
		switch(type)
		{
		case 1:
		case 3:
			return function(){ return --scope[attr] };
		case 0:
		case 2:
		default:
			return function(){ return ++scope[attr] };
		}
	}
},
// Instance
{
	varname: "i",
	start: 0,
	end: 1,
	comparator: 0,
	compMethod: null,
	stepMethod: null,
	step: 0,
	iter: 0,

	init: function(name, start, comparator, end)
	{
		var static = pgli.lang.Iterator;

		if(comparator in static.COMPARATORS)
			this.comparator = static.COMPARATORS[comparator];
		else
			this.comparator = static.COMPARATORS["<"];

		this.start = start;
		this.end = end;
		this.step = start;

		this.varname = name;
		this.compMethod = static.genComparatorMethod(this.comparator);
		this.stepMethod = static.genStepMethod(this.comparator, this, "step");
	},

	loop: function()
	{
		return (this.iter < pgli.lang.Iterator.MAX_ITERATIONS && this.compMethod(this.step, this.end));
	},

	next: function()
	{
		++this.iter;
		return this.stepMethod();
	},

	toString: function()
	{
		return "Iterator("+this.varname+") "+this.start+" - "+this.step+" - "+this.end;
	}

});