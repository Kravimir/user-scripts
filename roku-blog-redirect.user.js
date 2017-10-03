// ==UserScript==
// @name         Roku Blog Comments Redirect Fix
// @namespace    userscripts.org
// @version      0.1
// @description  Redirecting from blog-admin.roku.com to blog.roku.com
// @match        https://disq.us/url
// @grant       none
// ==/UserScript==

window.document.addEventListener('DOMContentLoaded',function(){

	if(location.search.indexOf('blog-admin.roku.com')!=-1)
		location.replace(location.href.replace(/blog-admin(\.roku\.com)/g,'blog$1'));

});
