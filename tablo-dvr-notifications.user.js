// ==UserScript==
// @name         Tablo Web App: Hide Notifications
// @namespace    greasyfork.org
// @version      1.1
// @description  This script auto-skips the update Tablo firmware screen and adds a button to close the Chrome update warning.
// @match        *://my.tablotv.com/*
// @grant    GM.xmlHttpRequest
// @noframes
// @run-at document-start
// ==/UserScript==


(function(){
	'use strict';


	console.log('### initTabloAppFixes called. TAF');

	var d=window.document;


	window.addEventListener('load',function(){

		//console.log('### initTabloAppFixes called. 2 TAF');


		// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
		// https://stackoverflow.com/questions/17632475/watch-for-element-creation-in-greasemonkey-script


		var MutationObserver = window.MutationObserver || window.WebkitMutationObserver;

		// Create an observer instance linked to the callback function
		var observer = new MutationObserver(function(mutationsList, observer) {
			//for(var mutation of mutationsList) {
			mutationsList.forEach(function(mutation){
				var i,k,nodes,targetEl,count=1,clickSkipBtn=function(i){
					try{
						targetEl.querySelector('button[name="skip"]').click();
					} catch(ex){
						console.warn('TAF',ex,count,i);
						if(++count<5 && ++i<5) {
							setTimeout(clickSkipBtn,500,count);
						}
					}
				};
				try{
					if(mutation.type == 'childList' && mutation.addedNodes.length>0) {
						for(nodes=mutation.addedNodes,i=0,k=nodes.length;i<k;i++) {
							if(nodes[i].nodeType===1) {
								if(nodes[i].classList.contains('overlayUpgradeAuthorize')) {
									targetEl=nodes[i];
									setTimeout(function(){
										clickSkipBtn(1);
									},100);
								} else if(nodes[i].querySelector('.win_invalid_version_header')!==null) {
									targetEl=nodes[i];
									nodes[i].style.position='relative';
									var a=d.createElement('a');
									a.className='btn btn-bare btn-close btn-menu-close';
									a.style.cssText='position:absolute;right:8px;top:8px;color:#000;border:1px solid;';
									a.setAttribute('aria-label',a.title='close');
									a.innerHTML='X';
									a.addEventListener('click',function(e){
										e.preventDefault();
										var el=d.querySelector('.win_invalid_version_header');
										el.parentNode.removeChild(el);
									});
									nodes[i].appendChild(a);
								}
							}
						}
					}
				} catch(ex) {
					try {
						if(console!==undefined && console.error!==undefined) {
							console.error('TAF',ex);
						}
					}catch(ex2){
						console.log('TAF Error:',ex);
					}
				}
			});
		});

		// Start observing the target node for configured mutations
		observer.observe(d.querySelector('.root-primary'),{attributes:false,childList:true,subtree:true});


	});
})();


