/**
 * Отложенные фоновые картинки. Фон, заданный в CSS (сцены главной, промо-карточки, заявка на банкет…),
 * браузер качает сразу, как только блок есть на странице, даже если до него ещё несколько экранов, —
 * и эти картинки отнимают канал у первого экрана. У блоков с атрибутом data-bg фон включается,
 * когда до блока остаётся около экрана прокрутки (globals.css → [data-bg]).
 *
 * Скрипт стоит первым в <body> и выполняется до разбора остальной страницы: блоки замечает
 * MutationObserver по мере появления (и при переходах по сайту). Без JavaScript атрибут
 * data-lazy-bg у <html> не ставится, и фоны грузятся как обычно.
 */
const script = `(function(){
if(!("IntersectionObserver" in window)||!("MutationObserver" in window))return;
var d=document.documentElement;d.setAttribute("data-lazy-bg","");
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.setAttribute("data-bg-ready","");io.unobserve(e.target);}});},{rootMargin:"100% 0px"});
var seen=function(n){if(n.nodeType!==1)return;if(n.hasAttribute("data-bg"))io.observe(n);var l=n.querySelectorAll("[data-bg]");for(var i=0;i<l.length;i++)io.observe(l[i]);};
new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(seen);});}).observe(d,{childList:true,subtree:true});
})();`;

export function LazyBackgrounds() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
