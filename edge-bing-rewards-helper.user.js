// ==UserScript==
// @name         Edge Bing Rewards Helper
// @namespace    userscripts.org
// @version      0.4
// @description
// @match        https://www.start.gg/*
// @match        https://start.gg/*
// @match        https://www.xbox.com/*
// @match        https://xbox.com/*
// @match        https://www.microsoft.com/*
// @match        https://microsoftedge.microsoft.com/*
// @match        https://www.nba.com/*
// @noframes
// @run-at document-start
// @icon         https://icons.duckduckgo.com/ip3/msn.com.ico
// ==/UserScript==


var KChanges=(function(){

	var rv={
		init:function(e){

			console.log('### KChanges.init called. : EBRH ',location.pathname,document.referrer);

			var paths={
				'www.microsoft.com':'en-us/edge/surf/play',
				'microsoftedge.microsoft.com':'addons/microsoft-edge-theme',
				'www.nba.com':'watch/league-pass-stream'
			};

			let host=location.hostname;
			let ref=document.referrer;

			if((ref=='' && location.pathname.indexOf(paths[host])!=-1) || ((ref.indexOf('://www.msn.com/')!==-1 || ref.indexOf('://rewards.bing.com/')!==-1) && (!(host in paths) || location.pathname.indexOf(paths[host])!=-1))) {
				setTimeout(function(){
					console.log('EBRH ','attempting to close window.');
					var win = window; //.open("","_self");
					win.close();
 					win = window.open("","_self");
					win.close();
				},1000);
			}

		}
	};
	return rv;
})();

window.addEventListener('load',function(){
	KChanges.init({type:'load'});
});
