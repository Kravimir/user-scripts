// ==UserScript==
// @name         Replace URL Special Characters for Disqus
// @namespace    userscripts.org
// @version      0.5
// @description  To get around moderation filters for URLs on some blogs with comments powered by Disqus
// @match        https://www.disqus.com/*
// @match        https://disqus.com/*
// @icon         https://icons.duckduckgo.com/ip3/disqus.com.ico
// ==/UserScript==

var KChanges=(function(){

	var MutationObserver = window.MutationObserver || window.WebkitMutationObserver;

	var domains=[
		'cordcuttersnews.com',
		'www.cordcuttersnews.com'
	];

	// feel free to add characters to replace and to change the strings they are replaced with
	var lookup={
		':':'colon',
		'/':'slash',
		'.':'dot',
		'#':'[hash]'
	};

	var rv={
		init:function(e){

			console.log('### KChanges.init called. : USCD ',location.pathname,document.referrer);

			let d=document,
				refDomain=d.referrer.match(/https?\:\/\/([a-z0-9\.-]+)\//)[1];

			if(domains.indexOf(refDomain)===-1) {
				console.log('USCD domain not matched');
				return;
			}

			let urlRe=/(?:(?:https?|s?ftp):\/\/)([a-z0-9-]+\.)+[a-z]{2,24}\/\S+/i,
				specChars=/[\:\/\.\#]/g,
				addBtn;
/*
			d.body.addEventListener('click',function(e){
				let el=e.target.closest('.comment-footer__action[data-action="reply"]');
				if(el) {
					addBtn(null);
				}
			});*/

			// Create an observer instance linked to the callback function
			var observer = new MutationObserver(addBtn=function(mutationsList, observer) {
				try{
					let btnPars=d.querySelectorAll('.text-editor-container .post-actions .wysiwyg>div');

					btnPars.forEach(function(btnPar){

						console.log('USCD ',btnPar);

						if(!btnPar || btnPar.querySelector('.wysiwyg__item.kSpecialChars')) return;

						let btn1=btnPar.querySelector('.wysiwyg__item[data-tag="a"]'),
							btn2=d.createElement(btn1.nodeName);

						btn2.className=btn1.className+' kSpecialChars';
						btn2.classList.remove('hidden');

						btn2.innerHTML=btn1.innerHTML;

						btn2.setAttribute('aria-label',btn2.firstElementChild.title='replace spacial characters in URL');

						btn2.addEventListener('click',function(e){
							e.preventDefault();
							e.stopPropagation();
							let el=e.target.closest('.textarea-wrapper');

							el.querySelectorAll('.textarea>p').forEach(function(el){
								let temp=el.innerHTML;
								el.innerHTML=el.innerHTML.replace(urlRe,function(str){
									return str.replace(specChars,(char1)=>{return lookup[char1];});
								});
							});
						});

						btnPar.appendChild(btn2);

						btn1.style.display='none';

					});

				} catch(ex) {

				}
			});

			// Start observing the target node for configured mutations
			observer.observe(d.body,{attributes:false,childList:true,subtree:true});
		}
	};
	return rv;
})();

window.addEventListener('load',function(){
	KChanges.init({type:'load'});
});
