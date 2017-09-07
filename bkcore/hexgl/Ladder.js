 /*
 * HexGL
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * @license This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License. 
 *          To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/.
 */

const bkcore = bkcore || {};
bkcore.hexgl = bkcore.hexgl || {};

bkcore.hexgl.Ladder = {};
bkcore.hexgl.Ladder.global = {};

bkcore.hexgl.Ladder.load = function(callback)
{
	const s = encodeURIComponent(window.location.href);
	bkcore.Utils.request("nothing", false, function(req)
	{
		try {
			bkcore.Ladder.global = JSON.parse(req.responseText);
			if(callback) callback.call(window);
		}
		catch(e)
		{
			console.warn('Unable to load ladder. '+e);
		}
	},
	{
		u: s
	});
}

bkcore.hexgl.Ladder.displayLadder = function(id, track, mode, num)
{
	const d = document.getElementById(id);
	if(d == undefined || bkcore.Ladder.global[track] == undefined || !bkcore.Ladder.global[track][mode] == undefined)
	{
		console.warn('Undefined ladder.');
		return;
	}

	const l = bkcore.Ladder.global[track][mode];
	let h = '';
	const m = Math.min((num == undefined ? 10 : num), l.length-1);
	for(let i = 0; i < l.length-1; i++)
	{
		const t = bkcore.Timer.msToTime(l[i]['score']);
		h += '<span class="ladder-row"><b>'+(i+1)+'. '+l[i]['name']+'</b><i>'+t.m+'\''+t.s+'\'\''+t.ms+'</i></span>';
	}

	d.innerHTML = h;
}