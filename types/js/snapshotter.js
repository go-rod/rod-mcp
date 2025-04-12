var e="chromium";function t(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function i(e,t){const i=e.length,n=t.length;let r=0,s=0;const o=Array(i+1).fill(null).map((()=>Array(n+1).fill(0)));for(let a=1;a<=i;a++)for(let i=1;i<=n;i++)e[a-1]===t[i-1]&&(o[a][i]=o[a-1][i-1]+1,o[a][i]>r&&(r=o[a][i],s=a));return e.slice(s-r,s)}function n(e){return e.replace(/\s+/g," ").trim()}function r(e,t){return e.ownerDocument&&e.ownerDocument.defaultView?e.ownerDocument.defaultView.getComputedStyle(e,t):void 0}const s={closestCrossShadow(e,t,i){for(;e;){const n=e.closest(t);if(i&&n!==i&&n?.contains(i))return;if(n)return n;e=this.enclosingShadowHost(e)}},enclosingShadowHost(e){for(;e.parentElement;)e=e.parentElement;return this.parentElementOrShadowHost(e)},parentElementOrShadowHost:e=>e.parentElement?e.parentElement:e.parentNode&&11===e.parentNode.nodeType&&e.parentNode.host?e.parentNode.host:void 0,elementSafeTagName:e=>e instanceof HTMLFormElement?"FORM":e.tagName.toUpperCase(),isVisibleTextNode(e){const t=e.ownerDocument.createRange();t.selectNode(e);const i=t.getBoundingClientRect();return i.width>0&&i.height>0},isElementStyleVisibilityVisible(t,i){if(!(i=null!=i?i:r(t)))return!0;if(Element.prototype.checkVisibility&&"webkit"!==e){if(!t.checkVisibility())return!1}else{const e=t.closest("details,summary");if(e!==t&&"DETAILS"===(null==e?void 0:e.nodeName)&&!e.open)return!1}return"visible"===i.visibility},enclosingShadowRootOrDocument(e){let t=e;for(;t.parentNode;)t=t.parentNode;if(11===t.nodeType||9===t.nodeType)return t}},o={kAriaCheckedRoles:["checkbox","menuitemcheckbox","option","radio","menuitemradio","switch","treeitem"],kAriaDisabledRoles:["application","button","composite","gridcell","group","input","link","menuitem","menuitemcheckbox","menuitemradio","option","select","selectlist","textbox"],kAriaExpandedRoles:["application","button","checkbox","combobox","gridcell","link","listbox","menuitem","row","rowheader","tab","treeitem"],kAriaLevelRoles:["heading","listitem","row","treeitem"],kAriaPressedRoles:["button"],kAriaSelectedRoles:["gridcell","option","row","tab","rowheader","treeitem"],kAncestorPreventingLandmark:"article:not([role]), aside:not([role]), main:not([role]), nav:not([role]), section:not([role]), [role=article], [role=complementary], [role=main], [role=navigation], [role=region]",validatedRoles:["alert","alertdialog","application","article","banner","blockquote","button","caption","cell","checkbox","code","columnheader","combobox","complementary","contentinfo","definition","deletion","dialog","directory","document","emphasis","feed","figure","form","generic","grid","gridcell","group","heading","img","insertion","link","list","listbox","listitem","log","main","mark","marquee","math","meter","menu","menubar","menuitem","menuitemcheckbox","menuitemradio","navigation","none","note","option","paragraph","presentation","progressbar","radio","radiogroup","region","row","rowgroup","rowheader","scrollbar","search","searchbox","separator","slider","spinbutton","status","strong","subscript","superscript","switch","tab","table","tablist","tabpanel","term","textbox","time","timer","toolbar","tooltip","tree","treegrid","treeitem"],cachesCounter:0,kGlobalAriaAttributes:[["aria-atomic",void 0],["aria-busy",void 0],["aria-controls",void 0],["aria-current",void 0],["aria-describedby",void 0],["aria-details",void 0],["aria-dropeffect",void 0],["aria-flowto",void 0],["aria-grabbed",void 0],["aria-hidden",void 0],["aria-keyshortcuts",void 0],["aria-label",["caption","code","deletion","emphasis","generic","insertion","paragraph","presentation","strong","subscript","superscript"]],["aria-labelledby",["caption","code","deletion","emphasis","generic","insertion","paragraph","presentation","strong","subscript","superscript"]],["aria-live",void 0],["aria-owns",void 0],["aria-relevant",void 0],["aria-roledescription",["generic"]]],inputTypeToRole:{button:"button",checkbox:"checkbox",image:"button",number:"spinbutton",radio:"radio",range:"slider",reset:"button",submit:"button"},hasGlobalAriaAttribute(e,t){return this.kGlobalAriaAttributes.some((([i,n])=>!(null==n?void 0:n.includes(t||""))&&e.hasAttribute(i)))},kImplicitRoleByTagName:{A:e=>e.hasAttribute("href")?"link":null,AREA:e=>e.hasAttribute("href")?"link":null,ARTICLE:()=>"article",ASIDE:()=>"complementary",BLOCKQUOTE:()=>"blockquote",BUTTON:()=>"button",CAPTION:()=>"caption",CODE:()=>"code",DATALIST:()=>"listbox",DD:()=>"definition",DEL:()=>"deletion",DETAILS:()=>"group",DFN:()=>"term",DIALOG:()=>"dialog",DT:()=>"term",EM:()=>"emphasis",FIELDSET:()=>"group",FIGURE:()=>"figure",FOOTER:e=>s.closestCrossShadow(e,o.kAncestorPreventingLandmark)?null:"contentinfo",FORM:e=>o.hasExplicitAccessibleName(e)?"form":null,H1:()=>"heading",H2:()=>"heading",H3:()=>"heading",H4:()=>"heading",H5:()=>"heading",H6:()=>"heading",HEADER:e=>s.closestCrossShadow(e,o.kAncestorPreventingLandmark)?null:"banner",HR:()=>"separator",HTML:()=>"document",IMG:e=>""!==e.getAttribute("alt")||e.getAttribute("title")||o.hasGlobalAriaAttribute(e)||o.hasTabIndex(e)?"img":"presentation",INPUT:e=>{const t=e.type.toLowerCase();if("search"===t)return e.hasAttribute("list")?"combobox":"searchbox";if(["email","tel","text","url",""].includes(t)){const t=o.getIdRefs(e,e.getAttribute("list"))[0];return t&&"DATALIST"===s.elementSafeTagName(t)?"combobox":"textbox"}return"hidden"===t?null:o.inputTypeToRole[t]||"textbox"},INS:()=>"insertion",LI:()=>"listitem",MAIN:()=>"main",MARK:()=>"mark",MATH:()=>"math",MENU:()=>"list",METER:()=>"meter",NAV:()=>"navigation",OL:()=>"list",OPTGROUP:()=>"group",OPTION:()=>"option",OUTPUT:()=>"status",P:()=>"paragraph",PROGRESS:()=>"progressbar",SECTION:e=>o.hasExplicitAccessibleName(e)?"region":null,SELECT:e=>e.hasAttribute("multiple")||e.size>1?"listbox":"combobox",STRONG:()=>"strong",SUB:()=>"subscript",SUP:()=>"superscript",SVG:()=>"img",TABLE:()=>"table",TBODY:()=>"rowgroup",TD:e=>{const t=s.closestCrossShadow(e,"table"),i=t?o.getExplicitAriaRole(t):"";return"grid"===i||"treegrid"===i?"gridcell":"cell"},TEXTAREA:()=>"textbox",TFOOT:()=>"rowgroup",TH:e=>{if("col"===e.getAttribute("scope"))return"columnheader";if("row"===e.getAttribute("scope"))return"rowheader";const t=s.closestCrossShadow(e,"table"),i=t?o.getExplicitAriaRole(t):"";return"grid"===i||"treegrid"===i?"gridcell":"cell"},THEAD:()=>"rowgroup",TIME:()=>"time",TR:()=>"row",UL:()=>"list"},kPresentationInheritanceParents:{DD:["DL","DIV"],DIV:["DL"],DT:["DL","DIV"],LI:["OL","UL"],TBODY:["TABLE"],TD:["TR"],TFOOT:["TABLE"],TH:["TR"],THEAD:["TABLE"],TR:["THEAD","TBODY","TFOOT","TABLE"]},hasExplicitAccessibleName:e=>e.hasAttribute("aria-label")||e.hasAttribute("aria-labelledby"),hasTabIndex:e=>!Number.isNaN(Number(String(e.getAttribute("tabindex")))),beginAriaCaches(){++this.cachesCounter,this._cacheAccessibleName??=new Map,this._cacheAccessibleNameHidden??=new Map,this._cacheAccessibleDescription??=new Map,this._cacheAccessibleDescriptionHidden??=new Map,this._cacheAccessibleErrorMessage??=new Map,this._cacheIsHidden??=new Map,this._cachePseudoContentBefore??=new Map,this._cachePseudoContentAfter??=new Map},endAriaCaches(){--this.cachesCounter||(delete this._cacheAccessibleName,delete this._cacheAccessibleNameHidden,delete this._cacheAccessibleDescription,delete this._cacheAccessibleDescriptionHidden,delete this._cacheAccessibleErrorMessage,delete this._cacheIsHidden,delete this._cachePseudoContentBefore,delete this._cachePseudoContentAfter)},getPseudoContent(e,t){const i="::before"===t?this._cachePseudoContentBefore:this._cachePseudoContentAfter;if(i?.has(e))return i?.get(e)||"";const n=r(e,t),s=this.getPseudoContentImpl(e,n);return i&&i.set(e,s),s},getPseudoContentImpl(e,t){if(!t||"none"===t.display||"hidden"===t.visibility)return"";const i=t.content;let n;if("'"===i[0]&&"'"===i[i.length-1]||'"'===i[0]&&'"'===i[i.length-1])n=i.substring(1,i.length-1);else if(i.startsWith("attr(")&&i.endsWith(")")){const t=i.substring(5,i.length-1).trim();n=e.getAttribute(t)||""}if(void 0!==n){return"inline"!==(t.display||"inline")?" "+n+" ":n}return""},getExplicitAriaRole(e){return(e.getAttribute("role")||"").split(" ").map((e=>e.trim())).find((e=>this.validatedRoles.includes(e)))||null},getImplicitAriaRole(e){const t=this.kImplicitRoleByTagName[s.elementSafeTagName(e)]?.(e)||"";if(!t)return null;let i=e;for(;i;){const e=s.parentElementOrShadowHost(i),t=this.kPresentationInheritanceParents[s.elementSafeTagName(i)];if(!t||!e||!t.includes(s.elementSafeTagName(e)))break;const n=this.getExplicitAriaRole(e);if(("none"===n||"presentation"===n)&&!this.hasPresentationConflictResolution(e,n))return n;i=e}return t},hasPresentationConflictResolution(e,t){return this.hasGlobalAriaAttribute(e,t)||this.isFocusable(e)},isFocusable(e){return!this.isNativelyDisabled(e)&&(this.isNativelyFocusable(e)||this.hasTabIndex(e))},isNativelyFocusable(e){const t=s.elementSafeTagName(e);return!!["BUTTON","DETAILS","SELECT","TEXTAREA"].includes(t)||("A"===t||"AREA"===t?e.hasAttribute("href"):"INPUT"===t&&!e.hidden)},isNativelyDisabled(e){return["BUTTON","INPUT","SELECT","TEXTAREA","OPTION","OPTGROUP"].includes(e.tagName)&&(e.hasAttribute("disabled")||this.belongsToDisabledFieldSet(e))},belongsToDisabledFieldSet(e){const t=e?.closest("FIELDSET[DISABLED]");if(!t)return!1;const i=t.querySelector(":scope > LEGEND");return!i||!i.contains(e)},asFlatString:e=>e.split(" ").map((e=>e.replace(/\r\n/g,"\n").replace(/[\u200b\u00ad]/g,"").replace(/\s\s*/g," "))).join(" ").trim(),getAriaRole(e){const t=this.getExplicitAriaRole(e);if(!t)return this.getImplicitAriaRole(e);if("none"===t||"presentation"===t){const t=this.getImplicitAriaRole(e);if(this.hasPresentationConflictResolution(e,t))return t}return t},getElementAccessibleName(e,t){const i=t?this._cacheAccessibleNameHidden:this._cacheAccessibleName;let n=null==i?void 0:i.get(e);if(void 0===n){n="";["caption","code","definition","deletion","emphasis","generic","insertion","mark","paragraph","presentation","strong","subscript","suggestion","superscript","term","time"].includes(this.getAriaRole(e)||"")||(n=this.asFlatString(this.getTextAlternativeInternal(e,{includeHidden:t,visitedElements:new Set,embeddedInTargetElement:"self"}))),null==i||i.set(e,n)}return n},isElementIgnoredForAria:e=>["STYLE","SCRIPT","NOSCRIPT","TEMPLATE"].includes(s.elementSafeTagName(e)),isElementHiddenForAria(e){if(this.isElementIgnoredForAria(e))return!0;const t=r(e),i="SLOT"===e.nodeName;if("contents"===t?.display&&!i){for(let t=e.firstChild;t;t=t.nextSibling){if(1===t.nodeType&&!this.isElementHiddenForAria(t))return!1;if(3===t.nodeType&&s.isVisibleTextNode(t))return!1}return!0}return!("OPTION"===e.nodeName&&!!e.closest("select")||i||s.isElementStyleVisibilityVisible(e,t))||this.belongsToDisplayNoneOrAriaHiddenOrNonSlotted(e)},belongsToDisplayNoneOrAriaHiddenOrNonSlotted(e){let t=null===this._cacheIsHidden||void 0===this._cacheIsHidden?void 0:this._cacheIsHidden.get(e);if(void 0===t){if(t=!1,e.parentElement&&e.parentElement.shadowRoot&&!e.assignedSlot&&(t=!0),!t){const i=r(e);t=!i||"none"===i.display||!0===this.getAriaBoolean(e.getAttribute("aria-hidden"))}if(!t){const i=s.parentElementOrShadowHost(e);i&&(t=this.belongsToDisplayNoneOrAriaHiddenOrNonSlotted(i))}null===this._cacheIsHidden||void 0===this._cacheIsHidden||this._cacheIsHidden.set(e,t)}return t},getAriaBoolean:e=>null===e?void 0:"true"===e.toLowerCase(),getAriaLabelledByElements(e){const t=e.getAttribute("aria-labelledby");if(null===t)return null;const i=this.getIdRefs(e,t);return i.length?i:null},getIdRefs(e,t){if(!t)return[];const i=s.enclosingShadowRootOrDocument(e);if(!i)return[];try{const e=t.split(" ").filter((e=>!!e)),n=[];for(const t of e){const e=i.querySelector("#"+CSS.escape(t));e&&!n.includes(e)&&n.push(e)}return n}catch(e){return[]}},queryInAriaOwned(e,t){const i=[...e.querySelectorAll(t)];for(const n of this.getIdRefs(e,e.getAttribute("aria-owns")))n.matches(t)&&i.push(n),i.push(...n.querySelectorAll(t));return i},trimFlatString:e=>e.trim(),getAccessibleNameFromAssociatedLabels(e,t){return[...e].map((e=>this.getTextAlternativeInternal(e,Object.assign(Object.assign({},t),{embeddedInLabel:{element:e,hidden:this.isElementHiddenForAria(e)},embeddedInNativeTextAlternative:void 0,embeddedInLabelledBy:void 0,embeddedInDescribedBy:void 0,embeddedInTargetElement:void 0})))).filter((e=>!!e)).join(" ")},getTextAlternativeInternal(e,t){var i,n,r,o;if(t.visitedElements.has(e))return"";const a=Object.assign(Object.assign({},t),{embeddedInTargetElement:"self"===t.embeddedInTargetElement?"descendant":t.embeddedInTargetElement});if(!t.includeHidden){const s=!!((null===(i=t.embeddedInLabelledBy)||void 0===i?void 0:i.hidden)||(null===(n=t.embeddedInDescribedBy)||void 0===n?void 0:n.hidden)||(null===(r=t.embeddedInNativeTextAlternative)||void 0===r?void 0:r.hidden)||(null===(o=t.embeddedInLabel)||void 0===o?void 0:o.hidden));if(this.isElementIgnoredForAria(e)||!s&&this.isElementHiddenForAria(e))return t.visitedElements.add(e),""}const l=this.getAriaLabelledByElements(e);if(!t.embeddedInLabelledBy){const e=(l||[]).map((e=>this.getTextAlternativeInternal(e,Object.assign(Object.assign({},t),{embeddedInLabelledBy:{element:e,hidden:this.isElementHiddenForAria(e)},embeddedInDescribedBy:void 0,embeddedInTargetElement:void 0,embeddedInLabel:void 0,embeddedInNativeTextAlternative:void 0})))).join(" ");if(e)return e}const d=this.getAriaRole(e)||"",c=s.elementSafeTagName(e);if(t.embeddedInLabel||t.embeddedInLabelledBy||"descendant"===t.embeddedInTargetElement){const i=[...e.labels||[]].includes(e),n=(l||[]).includes(e);if(!i&&!n){if("textbox"===d)return t.visitedElements.add(e),"INPUT"===c||"TEXTAREA"===c?e.value:e.textContent||"";if(["combobox","listbox"].includes(d)){let i;if(t.visitedElements.add(e),"SELECT"===c)i=[...e.selectedOptions],!i.length&&e.options.length&&i.push(e.options[0]);else{const t="combobox"===d?this.queryInAriaOwned(e,"*").find((e=>"listbox"===this.getAriaRole(e))):e;i=t?this.queryInAriaOwned(t,'[aria-selected="true"]').filter((e=>"option"===this.getAriaRole(e))):[]}return i.length||"INPUT"!==c?i.map((e=>this.getTextAlternativeInternal(e,a))).join(" "):e.value}if(["progressbar","scrollbar","slider","spinbutton","meter"].includes(d))return t.visitedElements.add(e),e.hasAttribute("aria-valuetext")?e.getAttribute("aria-valuetext")||"":e.hasAttribute("aria-valuenow")?e.getAttribute("aria-valuenow")||"":e.getAttribute("value")||"";if(["menu"].includes(d))return t.visitedElements.add(e),""}}const u=e.getAttribute("aria-label")||"";if(this.trimFlatString(u))return t.visitedElements.add(e),u;if(!["presentation","none"].includes(d)){if("INPUT"===c&&["button","submit","reset"].includes(e.type)){t.visitedElements.add(e);const i=e.value||"";if(this.trimFlatString(i))return i;if("submit"===e.type)return"Submit";if("reset"===e.type)return"Reset";return e.getAttribute("title")||""}if("INPUT"===c&&"image"===e.type){t.visitedElements.add(e);const i=e.labels||[];if(i.length&&!t.embeddedInLabelledBy)return this.getAccessibleNameFromAssociatedLabels(i,t);const n=e.getAttribute("alt")||"";if(this.trimFlatString(n))return n;const r=e.getAttribute("title")||"";return this.trimFlatString(r)?r:"Submit"}if(!l&&"BUTTON"===c){t.visitedElements.add(e);const i=e.labels||[];if(i.length)return this.getAccessibleNameFromAssociatedLabels(i,t)}if(!l&&"OUTPUT"===c){t.visitedElements.add(e);const i=e.labels||[];return i.length?this.getAccessibleNameFromAssociatedLabels(i,t):e.getAttribute("title")||""}if(!l&&("TEXTAREA"===c||"SELECT"===c||"INPUT"===c)){t.visitedElements.add(e);const i=e.labels||[];if(i.length)return this.getAccessibleNameFromAssociatedLabels(i,t);const n="INPUT"===c&&["text","password","search","tel","email","url"].includes(e.type)||"TEXTAREA"===c,r=e.getAttribute("placeholder")||"",s=e.getAttribute("title")||"";return!n||s?s:r}if(!l&&"FIELDSET"===c){t.visitedElements.add(e);for(let t=e.firstElementChild;t;t=t.nextElementSibling)if("LEGEND"===s.elementSafeTagName(t))return this.getTextAlternativeInternal(t,Object.assign(Object.assign({},a),{embeddedInNativeTextAlternative:{element:t,hidden:this.isElementHiddenForAria(t)}}));return e.getAttribute("title")||""}if(!l&&"FIGURE"===c){t.visitedElements.add(e);for(let t=e.firstElementChild;t;t=t.nextElementSibling)if("FIGCAPTION"===s.elementSafeTagName(t))return this.getTextAlternativeInternal(t,Object.assign(Object.assign({},a),{embeddedInNativeTextAlternative:{element:t,hidden:this.isElementHiddenForAria(t)}}));return e.getAttribute("title")||""}if("IMG"===c){t.visitedElements.add(e);const i=e.getAttribute("alt")||"";if(this.trimFlatString(i))return i;return e.getAttribute("title")||""}if("TABLE"===c){t.visitedElements.add(e);for(let t=e.firstElementChild;t;t=t.nextElementSibling)if("CAPTION"===s.elementSafeTagName(t))return this.getTextAlternativeInternal(t,Object.assign(Object.assign({},a),{embeddedInNativeTextAlternative:{element:t,hidden:this.isElementHiddenForAria(t)}}));const i=e.getAttribute("summary")||"";if(i)return i}if("AREA"===c){t.visitedElements.add(e);const i=e.getAttribute("alt")||"";if(this.trimFlatString(i))return i;return e.getAttribute("title")||""}if("SVG"===c||e.ownerSVGElement){t.visitedElements.add(e);for(let t=e.firstElementChild;t;t=t.nextElementSibling)if("TITLE"===s.elementSafeTagName(t)&&t.ownerSVGElement)return this.getTextAlternativeInternal(t,Object.assign(Object.assign({},a),{embeddedInLabelledBy:{element:t,hidden:this.isElementHiddenForAria(t)}}))}if(e.ownerSVGElement&&"A"===c){const i=e.getAttribute("xlink:title")||"";if(this.trimFlatString(i))return t.visitedElements.add(e),i}}const h="SUMMARY"===c&&!["presentation","none"].includes(d);if(this.allowsNameFromContent(d,"descendant"===t.embeddedInTargetElement)||h||t.embeddedInLabelledBy||t.embeddedInDescribedBy||t.embeddedInLabel||t.embeddedInNativeTextAlternative){t.visitedElements.add(e);const i=this.innerAccumulatedElementText(e,a);if("self"===t.embeddedInTargetElement?this.trimFlatString(i):i)return i}if(!["presentation","none"].includes(d)||"IFRAME"===c){t.visitedElements.add(e);const i=e.getAttribute("title")||"";if(this.trimFlatString(i))return i}return t.visitedElements.add(e),""},innerAccumulatedElementText(e,t){const i=[],n=(e,n)=>{var s;if(!n||!e.assignedSlot)if(1===e.nodeType){const n=(null===(s=r(e))||void 0===s?void 0:s.display)||"inline";let o=this.getTextAlternativeInternal(e,t);"inline"===n&&"BR"!==e.nodeName||(o=" "+o+" "),i.push(o)}else 3===e.nodeType&&i.push(e.textContent||"")};i.push(this.getPseudoContent(e,"::before"));const s="SLOT"===e.nodeName?e.assignedNodes():[];if(s.length)for(const e of s)n(e,!1);else{for(let t=e.firstChild;t;t=t.nextSibling)n(t,!0);if(e.shadowRoot)for(let t=e.shadowRoot.firstChild;t;t=t.nextSibling)n(t,!0);for(const t of this.getIdRefs(e,e.getAttribute("aria-owns")))n(t,!0)}return i.push(this.getPseudoContent(e,"::after")),i.join("")},allowsNameFromContent(e,t){const i=["button","cell","checkbox","columnheader","gridcell","heading","link","menuitem","menuitemcheckbox","menuitemradio","option","radio","row","rowheader","switch","tab","tooltip","treeitem"].includes(e),n=t&&["","caption","code","contentinfo","definition","deletion","emphasis","insertion","list","listitem","mark","none","paragraph","presentation","region","row","rowgroup","section","strong","subscript","superscript","table","term","time"].includes(e);return i||n},_collectTextContent(e){let t="";const i=e=>{if(e.nodeType===Node.TEXT_NODE)t+=e.textContent;else if(e.nodeType===Node.ELEMENT_NODE&&"SCRIPT"!==e.nodeName&&"STYLE"!==e.nodeName)for(let t=e.firstChild;t;t=t.nextSibling)i(t)};return i(e),t.trim()},getAriaChecked(e){if(e.hasAttribute("aria-checked")){const t=e.getAttribute("aria-checked");return"true"===t||"mixed"===t&&"mixed"}return e instanceof HTMLInputElement&&"checkbox"===e.type||e instanceof HTMLInputElement&&"radio"===e.type?e.checked:void 0},getAriaDisabled:e=>e.hasAttribute("aria-disabled")?"true"===e.getAttribute("aria-disabled"):(e instanceof HTMLButtonElement||e instanceof HTMLInputElement||e instanceof HTMLSelectElement||e instanceof HTMLTextAreaElement||e instanceof HTMLOptGroupElement||e instanceof HTMLOptionElement||e instanceof HTMLFieldSetElement)&&e.disabled,getAriaExpanded(e){if(e.hasAttribute("aria-expanded"))return"true"===e.getAttribute("aria-expanded")},getAriaLevel(e){if(e.hasAttribute("aria-level")){const t=parseInt(e.getAttribute("aria-level"),10);if(!isNaN(t))return t}if("heading"===this.getAriaRole(e)){const t=e.nodeName.match(/^H(\d)$/);if(t)return parseInt(t[1],10)}},getAriaPressed(e){if(e.hasAttribute("aria-pressed")){const t=e.getAttribute("aria-pressed");return"true"===t||"mixed"===t&&"mixed"}},getAriaSelected:e=>e.hasAttribute("aria-selected")?"true"===e.getAttribute("aria-selected"):e instanceof HTMLOptionElement?e.selected:void 0};function a(e){return 0===e.length||(!!/^\s|\s$/.test(e)||(!!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/.test(e)||(!!/^-/.test(e)||(!!/[\n:](\s|$)/.test(e)||(!!/\s#/.test(e)||(!!/[\n\r]/.test(e)||(!!/^[&*\],?!>|@"'#%]/.test(e)||(!!/[{}`]/.test(e)||(!!/^\[/.test(e)||!(isNaN(Number(e))&&!["y","n","yes","no","true","false","on","off","null"].includes(e.toLowerCase())))))))))))}function l(e){return a(e)?"'"+e.replace(/'/g,"''")+"'":e}function d(e){return a(e)?'"'+e.replace(/[\\"\x00-\x1f\x7f-\x9f]/g,(e=>{switch(e){case"\\":return"\\\\";case'"':return'\\"';case"\b":return"\\b";case"\f":return"\\f";case"\n":return"\\n";case"\r":return"\\r";case"\t":return"\\t";default:return"\\x"+e.charCodeAt(0).toString(16).padStart(2,"0")}}))+'"':e}class c{constructor(){this._lastAriaSnapshot=void 0}generateAriaTree(e,t,i){const n=new Set,r={root:{role:"fragment",name:"",children:[],element:e,props:{}},elements:new Map,generation:t,ids:new Map},s=e=>{const t=r.elements.size+1;r.elements.set(t,e),r.ids.set(e,t)};s(e);const a=(t,r)=>{if(n.has(r))return;if(n.add(r),r.nodeType===Node.TEXT_NODE&&r.nodeValue){const e=r.nodeValue;return void("textbox"!==t.role&&e&&t.children.push(r.nodeValue||""))}if(r.nodeType!==Node.ELEMENT_NODE)return;const l=r;if(o.isElementHiddenForAria(l))return;const d=[];if(l.hasAttribute("aria-owns")){const t=l.getAttribute("aria-owns").split(/\s+/);for(const i of t){const t=e.ownerDocument.getElementById(i);t&&d.push(t)}}s(l);const c=this._toAriaNode(l,i);c&&t.children.push(c),this._processElement(c||t,l,d,a)};o.beginAriaCaches();try{a(r.root,e)}finally{o.endAriaCaches()}return this._normalizeStringChildren(r.root),r}queryAll(e){const t=e.match(/^s(\d+)e(\d+)$/);if(!t)return[];const[,i,n]=t;if(this._lastAriaSnapshot?.generation!==+i)return[];const r=this._lastAriaSnapshot?.elements?.get(+n);return r&&r.isConnected?[r]:[]}_toAriaNode(e,t){if(t&&"IFRAME"===e.nodeName)return{role:"iframe",name:"",children:[],props:{},element:e};const i=o.getAriaRole(e);if(!i||"presentation"===i||"none"===i)return null;const r={role:i,name:n(o.getElementAccessibleName(e,!1)||""),children:[],props:{},element:e};return o.kAriaCheckedRoles.includes(i)&&(r.checked=o.getAriaChecked(e)),o.kAriaDisabledRoles.includes(i)&&(r.disabled=o.getAriaDisabled(e)),o.kAriaExpandedRoles.includes(i)&&(r.expanded=o.getAriaExpanded(e)),o.kAriaLevelRoles.includes(i)&&(r.level=o.getAriaLevel(e)),o.kAriaPressedRoles.includes(i)&&(r.pressed=o.getAriaPressed(e)),o.kAriaSelectedRoles.includes(i)&&(r.selected=o.getAriaSelected(e)),(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)&&"checkbox"!==e.type&&"radio"!==e.type&&(r.children=[e.value]),r}_processElement(e,t,i=[],n){var s;const a="inline"!==((null===(s=r(t))||void 0===s?void 0:s.display)||"inline")||"BR"===t.nodeName?" ":"";a&&e.children.push(a),e.children.push(o.getPseudoContent(t,"::before"));const l="SLOT"===t.nodeName?t.assignedNodes():[];if(l.length)for(const t of l)n(e,t);else{for(let i=t.firstChild;i;i=i.nextSibling)i.assignedSlot||n(e,i);if(t.shadowRoot)for(let i=t.shadowRoot.firstChild;i;i=i.nextSibling)n(e,i)}for(const t of i)n(e,t);if(e.children.push(o.getPseudoContent(t,"::after")),a&&e.children.push(a),1===e.children.length&&e.name===e.children[0]&&(e.children=[]),"link"===e.role&&t.hasAttribute("href")){const i=t.getAttribute("href");e.props.url=i}}_normalizeStringChildren(e){const t=(e,t)=>{if(!e.length)return;const i=n(e.join(""));i&&t.push(i),e.length=0},i=e=>{const n=[],r=[];for(const s of e.children||[])"string"==typeof s?r.push(s):(t(r,n),i(s),n.push(s));t(r,n),e.children=n.length?n:[],1===e.children.length&&e.children[0]===e.name&&(e.children=[])};i(e)}_matchesText(e,t){return!t||!!e&&("string"==typeof t?e===t:!!e.match(new RegExp(t.pattern)))}_matchesTextNode(e,t){return this._matchesText(e,t.text)}_matchesName(e,t){return this._matchesText(e,t.name)}matchesAriaTree(e,t){const i=this.generateAriaTree(e,0,!1);return{matches:this._matchesNodeDeep(i.root,t,!1),received:{raw:this.renderAriaTree(i,{mode:"raw"}),regex:this.renderAriaTree(i,{mode:"regex"})}}}getAllByAria(e,t){const i=this.generateAriaTree(e,0,!1).root;return this._matchesNodeDeep(i,t,!0).map((e=>e.element))}_matchesNode(e,t,i){return"string"==typeof e&&"text"===t.kind?this._matchesTextNode(e,t):null!==e&&"object"==typeof e&&"role"===t.kind&&(("fragment"===t.role||t.role===e.role)&&((void 0===t.checked||t.checked===e.checked)&&((void 0===t.disabled||t.disabled===e.disabled)&&((void 0===t.expanded||t.expanded===e.expanded)&&((void 0===t.level||t.level===e.level)&&((void 0===t.pressed||t.pressed===e.pressed)&&((void 0===t.selected||t.selected===e.selected)&&(!!this._matchesName(e.name,t)&&(!!this._matchesText(e.props.url,t.props?.url)&&!!this._containsList(e.children||[],t.children||[],i))))))))))}_containsList(e,t,i){if(t.length>e.length)return!1;const n=e.slice(),r=t.slice();for(const e of r){let t=n.shift();for(;t&&!this._matchesNode(t,e,i+1);)t=n.shift();if(!t)return!1}return!0}_matchesNodeDeep(e,t,i){const n=[],r=(e,s)=>{if(this._matchesNode(e,t,0)){const t="string"==typeof e?s:e;return t&&n.push(t),!i}if("string"==typeof e)return!1;for(const t of e.children||[])if(r(t,e))return!0;return!1};return r(e,null),n}renderAriaTree(e,t={}){const i=[],n="regex"===t.mode?this._textContributesInfo.bind(this):()=>!0,r="regex"===t.mode?this._convertToBestGuessRegex.bind(this):e=>e,s=(o,a,c)=>{if("string"==typeof o){if(a&&!n(a,o))return;const e=d(r(o));return void(e&&i.push(c+"- text: "+e))}let u=o.role;if(o.name&&o.name.length<=900){const e=r(o.name);if(e){u+=" "+(e.startsWith("/")&&e.endsWith("/")?e:JSON.stringify(e))}}if("mixed"===o.checked&&(u+=" [checked=mixed]"),!0===o.checked&&(u+=" [checked]"),o.disabled&&(u+=" [disabled]"),o.expanded&&(u+=" [expanded]"),o.level&&(u+=` [level=${o.level}]`),"mixed"===o.pressed&&(u+=" [pressed=mixed]"),!0===o.pressed&&(u+=" [pressed]"),!0===o.selected&&(u+=" [selected]"),t.ref){const t=e.ids.get(o.element);t&&(u+=` [ref=s${e.generation}e${t}]`)}const h=c+"- "+l(u),m=!!Object.keys(o.props).length;if(o.children.length||m)if(1!==o.children.length||"string"!=typeof o.children[0]||m){i.push(h+":");for(const[e,t]of Object.entries(o.props))i.push(c+"  - /"+e+": "+d(t));for(const e of o.children||[])s(e,o,c+"  ")}else{const e=n(o,o.children[0])?r(o.children[0]):null;e?i.push(h+": "+d(e)):i.push(h)}else i.push(h)},o=e.root;if("fragment"===o.role)for(const e of o.children||[])s(e,o,"");else s(o,null,"");return i.join("\n")}_convertToBestGuessRegex(e){const i=[{regex:/\b[\d,.]+[bkmBKM]+\b/,replacement:"[\\d,.]+[bkmBKM]+"},{regex:/\b\d+[hmsp]+\b/,replacement:"\\d+[hmsp]+"},{regex:/\b[\d,.]+[hmsp]+\b/,replacement:"[\\d,.]+[hmsp]+"},{regex:/\b\d+,\d+\b/,replacement:"\\d+,\\d+"},{regex:/\b\d+\.\d{2,}\b/,replacement:"\\d+\\.\\d+"},{regex:/\b\d{2,}\.\d+\b/,replacement:"\\d+\\.\\d+"},{regex:/\b\d{2,}\b/,replacement:"\\d+"}];let n="",r=0;const s=new RegExp(i.map((e=>"("+e.regex.source+")")).join("|"),"g");return e.replace(s,((s,...o)=>{const a=o[o.length-2],l=o.slice(0,-2);n+=t(e.slice(r,a));for(let e=0;e<l.length;e++)if(l[e]){const{replacement:t}=i[e];n+=t;break}return r=a+s.length,s})),n?(n+=t(e.slice(r)),String(new RegExp(n))):e}_textContributesInfo(e,t){if(!t.length)return!1;if(!e.name)return!0;if(e.name.length>t.length)return!1;const n=t.length<=200&&e.name.length<=200?i(t,e.name):"";let r=t;for(;n&&r.includes(n);)r=r.replace(n,"");return r.trim().length/t.length>.1}ariaSnapshot(e,t){if(e.nodeType!==Node.ELEMENT_NODE)return;const i=(this._lastAriaSnapshot?.generation||0)+1;return this._lastAriaSnapshot=this.generateAriaTree(e,i,t?.ref??!1),this.renderAriaTree(this._lastAriaSnapshot,t)}}var snapshotEngine=new c;