// ==UserScript==
// @name         Fanflix.co Fixes
// @namespace    userscripts.org
// @version      0.8
// @description  Improvements to the horrible UI of the site. (Fixing the back button for the detail pages and replacing the silly carousels with plain old wrapping with vertical scrolling.)
// @homepageURL  https://github.com/Kravimir/user-scripts
// @match        https://fanflix.co/*
// @match        https://www.fanflix.co/*
// @icon         https://icons.duckduckgo.com/ip3/fanflix.co.ico
// @run-at document-start
// ==/UserScript==


var requestAnimFrame = (function(undef){ // kStyleFns.addStyleRule relies on this
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || undef;
})();

var kStyleFns={
	makeStyleElm: function(id,media) {
		var d=window.document,s;
		s=d.createElement('style');
		s.type='text/css';
		if(typeof id=='string'&&id!='') s.id=id;
		if(typeof media=='string'&&media!='') s.media=media;
		// https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
		if(/constructor/i.test(window.HTMLElement))
			s.appendChild(d.createTextNode(' ')); // for Webkit
		d.getElementsByTagName('head')[0].appendChild(s);
		return (s.sheet||s.styleSheet);
	},
	addStyleRule: function(el,selector,styles){
		var d=window.document,s;
		if(!d.styleSheets || !el) return;
		s=el.sheet?el.sheet:(el.styleSheet?el.styleSheet:el);
		try{
			if(s.rules && s.addRule && !requestAnimFrame) {
			// try the old way first to avoid bugs
				if(selector.indexOf(',')==-1) {
					s.addRule(selector,styles);
				} else {
					for(var i=0,ar=selector.split(/,/);i<ar.length;i++)
						try{s.addRule(ar[i],styles)}catch(ex){};
				}
			} else if(s.cssRules && s.insertRule) {
				s.insertRule([selector,'{',styles,'}'].join(''),s.cssRules.length);
			}
		}catch(ex){
			if(typeof console!='undefined'&&console.warn && !/\:-(moz|webkit|ms)-/.test(ex))
				console.warn('addStyleRule: ',ex);
		}
	},
	remStyleRules: function(el){
		var d=window.document,rules,i,s;
		if(!d.styleSheets || !el) return;
		try {
			s=el.sheet?el.sheet:(el.styleSheet?el.styleSheet:el);
			s.cssText='';
			if(s && (rules=s.cssRules)) {
				for(i=rules.length-1;i>-1;i--) s.deleteRule(i);
			}
		} catch(ex){}
	}
};


var KChanges=function(){
	var d=window.document;

	var styleSheet=kStyleFns.makeStyleElm(),
		styleSheetD=kStyleFns.makeStyleElm('','(min-width: 1008px)');


	kStyleFns.addStyleRule(styleSheet,'.carousel .content>table',
		'margin: 0 36px;');

	kStyleFns.addStyleRule(styleSheet,'.tier:has(.carousel)',
		'padding: 0 30px;box-sizing: border-box;max-width: 100%;');
	kStyleFns.addStyleRule(styleSheet,'.tier.hasCarousel',
		'padding: 0 30px;box-sizing: border-box;max-width: 100%;');
	kStyleFns.addStyleRule(styleSheet,'.carousel:has(.content>table)>.nav, .carousel:has(.content>table)>button.left, .carousel:has(.content>table)>button.right, .tier:has(.carousel) button.desktop.view-all, .tier:has(.carousel)>.header',
		'display: none;');
	kStyleFns.addStyleRule(styleSheet,'.carousel.hasContentTable>.nav, .carousel.hasContentTable>button.left, .carousel.hasContentTable>button.right, .tier.hasCarousel>.header, .tier.hasCarousel button.desktop.view-all',
		'display: none;');
	kStyleFns.addStyleRule(styleSheet,'.carousel .content>table',
		'transform: none !important;');
	kStyleFns.addStyleRule(styleSheet,'.carousel .content>table tr',
		'display: flex;flex-wrap: wrap;align-items: end;');
	kStyleFns.addStyleRule(styleSheet,'.carousel .content>table td',
		'display: inline-block;');


	kStyleFns.addStyleRule(styleSheetD,'#app header',
		'padding: 30px 60px 10px;');
	kStyleFns.addStyleRule(styleSheetD,'.carousel .content>table',
		'margin: 0 70px;');



	var lastInfoBtn,ignoreHashChange=false,lastHash='';

	var scrollPos={},lastScrollTop=0;

	var clickFn1=function(e){
		let el=e&&e.target?e.target:this,title;
		if(el.nodeType!=1) el=el.parentNode;
		if(el.nodeName.toLowerCase()!='button') return;
		if(el.textContent.toLowerCase().indexOf('info')!==-1) {
			lastInfoBtn=el;
			title=encodeURIComponent(el.closest('td').querySelector('img[alt]').alt||'missing-title');
			location.hash='#'+title;
			if(lastScrollTop>(scrollPos[title]||0)) scrollPos[title]=lastScrollTop;
console.log(title,scrollPos[title],d.querySelector('html').scrollTop);
		}
	};
	var clickFn2=function(e){
		let el=e&&e.target?e.target:this,title;
		if(el.nodeType!=1) el=el.parentNode;
console.log(el.textContent);
		let cn=el.className.toLowerCase();
		if(cn.indexOf('back')!==-1 || (cn.indexOf('view-all')!==-1 && el.parentNode.className.indexOf('header')===-1)) {
			if(!ignoreHashChange) {
				ignoreHashChange=true;
				history.back();
			}
			setTimeout(function(){ignoreHashChange=false;},250);
		}
	};


	// debouncing function from John Hann
	// http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
	var debounce=function(func,threshold,execAsap){
		var timeout;
		return function debounced(){
			var obj=this,args=arguments;
			function delayed(){
				if(!execAsap) func.apply(obj, args);
				timeout=null;
			};
			if(timeout) clearTimeout(timeout);
			else if(execAsap) func.apply(obj,args);
			timeout=setTimeout(delayed,threshold||100);
		};
	};


	var addClickHandlers=function(){
		d.querySelectorAll('.carousel .content').forEach(function(el){
			el.onclick=clickFn1;
		});
		d.querySelector('#app-bg+div').onclick=clickFn2;

		// for browsers that don't support the :has() selector
		d.querySelectorAll('.tier .carousel').forEach(function(el){
			el.closest('.tier').classList.add('hasCarousel');
		});
		d.querySelectorAll('.carousel .content>table').forEach(function(el){
			el.closest('.carousel').classList.add('hasContentTable');
		});
	};

	addClickHandlers();

	var MutationObserver = window.MutationObserver || window.WebkitMutationObserver;

	var observer = new MutationObserver(function(mutationsList, observer) {

		mutationsList.forEach(function(mutation){
			try{
				if(mutation.type == 'childList') {
					addClickHandlers();

				}
			} catch(ex) {
				console.error(ex);
			}
		});
	});

	observer.observe(d.querySelector('#app'),{attributes:false,childList:true,subtree:true});


	window.addEventListener('scroll',debounce(function(e){
		let t=d.querySelector('html').scrollTop;
		if(t>99 && t < 200) {
			let hash=lastHash;
			// adjust scrollTop
			if(hash && hash in scrollPos) d.querySelector('html').scrollTop=scrollPos[hash];
		} else {
			lastScrollTop=d.querySelector('html').scrollTop;
		}
	}));


	window.addEventListener('hashchange',function(e){
	/*
		if(ignoreHashChange) {
		console.log('ignoreHashChange', ignoreHashChange)
			return;
		}*/
		console.log('HASHCHANGE',e.oldURL,e.newURL)
		let i=e.newURL.indexOf('#');
		if(i===-1 || i===(e.newURL.length-1)) {
			let b=d.querySelector('button.back');
			b?b.click():null;

			i=e.oldURL.indexOf('#');
			lastHash=e.oldURL.slice(i+1);
//console.log(lastHash,scrollPos[lastHash],e.oldURL,e.newURL)
			// adjust scrollTop
			if(lastHash && lastHash in scrollPos) d.querySelector('html').scrollTop=scrollPos[lastHash];
		} else if(lastInfoBtn) {
			lastInfoBtn.click();
		}
	});

	KChanges.initHasRun=true;
};

if(!KChanges.initHasRun) {
	document.addEventListener('DOMContentLoaded',function(){
		KChanges();
	});
}
