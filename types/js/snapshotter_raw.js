var browserNameForWorkarounds = 'chromium';

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function longestCommonSubstring(s1, s2) {
    const n = s1.length;
    const m = s2.length;
    let maxLen = 0;
    let endingIndex = 0;
    // Initialize a 2D array with zeros
    const dp = Array(n + 1)
        .fill(null)
        .map(() => Array(m + 1).fill(0));
    // Build the dp table
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                if (dp[i][j] > maxLen) {
                    maxLen = dp[i][j];
                    endingIndex = i;
                }
            }
        }
    }
    // Extract the longest common substring
    return s1.slice(endingIndex - maxLen, endingIndex);
}

function normalizeWhiteSpace(text) {
    return text.replace(/\s+/g, ' ').trim();
}

function getElementComputedStyle(element, pseudo) {
    return element.ownerDocument && element.ownerDocument.defaultView ? element.ownerDocument.defaultView.getComputedStyle(element, pseudo) : undefined;
}

const domUtils = {
    closestCrossShadow(element, css, scope) {
        while (element) {
            const closest = element.closest(css);
            if (scope && closest !== scope && closest?.contains(scope))
                return;
            if (closest)
                return closest;
            element = this.enclosingShadowHost(element);
        }
    },
    enclosingShadowHost(element) {
        while (element.parentElement)
            element = element.parentElement;
        return this.parentElementOrShadowHost(element);
    },
    parentElementOrShadowHost(element) {
        if (element.parentElement)
            return element.parentElement;
        if (!element.parentNode)
            return;
        if (element.parentNode.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */ && element.parentNode.host)
            return element.parentNode.host;
    },
    elementSafeTagName(element) {
        // Named inputs, e.g. <input name=tagName>, will be exposed as fields on the parent <form>
        // and override its properties.
        if (element instanceof HTMLFormElement)
            return 'FORM';
        // Elements from the svg namespace do not have uppercase tagName right away.
        return element.tagName.toUpperCase();
    },
    isVisibleTextNode(node) {
        // https://stackoverflow.com/questions/1461059/is-there-an-equivalent-to-getboundingclientrect-for-text-nodes
        const range = node.ownerDocument.createRange();
        range.selectNode(node);
        const rect = range.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    },
    isElementStyleVisibilityVisible(element, style) {
        style = style !== null && style !== void 0 ? style : getElementComputedStyle(element);
        if (!style)
            return true;
        // Element.checkVisibility checks for content-visibility and also looks at
        // styles up the flat tree including user-agent ShadowRoots, such as the
        // details element for example.
        // All the browser implement it, but WebKit has a bug which prevents us from using it:
        // https://bugs.webkit.org/show_bug.cgi?id=264733
        // @ts-ignore
        if (Element.prototype.checkVisibility && browserNameForWorkarounds !== 'webkit') {
            if (!element.checkVisibility())
                return false;
        } else {
            // Manual workaround for WebKit that does not have checkVisibility.
            const detailsOrSummary = element.closest('details,summary');
            if (detailsOrSummary !== element && (detailsOrSummary === null || detailsOrSummary === void 0 ? void 0 : detailsOrSummary.nodeName) === 'DETAILS' && !detailsOrSummary.open)
                return false;
        }
        if (style.visibility !== 'visible')
            return false;
        return true;
    },
    enclosingShadowRootOrDocument(element) {
        let node = element;
        while (node.parentNode)
            node = node.parentNode;
        if (node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */ || node.nodeType === 9 /* Node.DOCUMENT_NODE */)
            return node;
    },

}

// 集成 roleUtils
const roleUtils = {
    kAriaCheckedRoles: ['checkbox', 'menuitemcheckbox', 'option', 'radio', 'menuitemradio', 'switch', 'treeitem'],
    kAriaDisabledRoles: ['application', 'button', 'composite', 'gridcell', 'group', 'input', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'select', 'selectlist', 'textbox'],
    kAriaExpandedRoles: ['application', 'button', 'checkbox', 'combobox', 'gridcell', 'link', 'listbox', 'menuitem', 'row', 'rowheader', 'tab', 'treeitem'],
    kAriaLevelRoles: ['heading', 'listitem', 'row', 'treeitem'],
    kAriaPressedRoles: ['button'],
    kAriaSelectedRoles: ['gridcell', 'option', 'row', 'tab', 'rowheader', 'treeitem'],
    kAncestorPreventingLandmark: 'article:not([role]), aside:not([role]), main:not([role]), nav:not([role]), section:not([role]), [role=article], [role=complementary], [role=main], [role=navigation], [role=region]',
    validatedRoles: ['alert', 'alertdialog', 'application', 'article', 'banner', 'blockquote', 'button', 'caption', 'cell', 'checkbox', 'code', 'columnheader', 'combobox',
        'complementary', 'contentinfo', 'definition', 'deletion', 'dialog', 'directory', 'document', 'emphasis', 'feed', 'figure', 'form', 'generic', 'grid',
        'gridcell', 'group', 'heading', 'img', 'insertion', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'mark', 'marquee', 'math', 'meter', 'menu',
        'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option', 'paragraph', 'presentation', 'progressbar', 'radio', 'radiogroup',
        'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider',
        'spinbutton', 'status', 'strong', 'subscript', 'superscript', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox', 'time', 'timer',
        'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'],
    cachesCounter: 0,

    kGlobalAriaAttributes: [
        ['aria-atomic', undefined],
        ['aria-busy', undefined],
        ['aria-controls', undefined],
        ['aria-current', undefined],
        ['aria-describedby', undefined],
        ['aria-details', undefined],
        // Global use deprecated in ARIA 1.2
        // ['aria-disabled', undefined],
        ['aria-dropeffect', undefined],
        // Global use deprecated in ARIA 1.2
        // ['aria-errormessage', undefined],
        ['aria-flowto', undefined],
        ['aria-grabbed', undefined],
        // Global use deprecated in ARIA 1.2
        // ['aria-haspopup', undefined],
        ['aria-hidden', undefined],
        // Global use deprecated in ARIA 1.2
        // ['aria-invalid', undefined],
        ['aria-keyshortcuts', undefined],
        ['aria-label', ['caption', 'code', 'deletion', 'emphasis', 'generic', 'insertion', 'paragraph', 'presentation', 'strong', 'subscript', 'superscript']],
        ['aria-labelledby', ['caption', 'code', 'deletion', 'emphasis', 'generic', 'insertion', 'paragraph', 'presentation', 'strong', 'subscript', 'superscript']],
        ['aria-live', undefined],
        ['aria-owns', undefined],
        ['aria-relevant', undefined],
        ['aria-roledescription', ['generic']],
    ],
    inputTypeToRole: {
        'button': 'button',
        'checkbox': 'checkbox',
        'image': 'button',
        'number': 'spinbutton',
        'radio': 'radio',
        'range': 'slider',
        'reset': 'button',
        'submit': 'button',
    },

    hasGlobalAriaAttribute(element, forRole) {
        return this.kGlobalAriaAttributes.some(([attr, prohibited]) => {
            return !(prohibited === null || prohibited === void 0 ? void 0 : prohibited.includes(forRole || '')) && element.hasAttribute(attr);
        });
    },

    kImplicitRoleByTagName: {
        'A': (e) => {
            return e.hasAttribute('href') ? 'link' : null;
        },
        'AREA': (e) => {
            return e.hasAttribute('href') ? 'link' : null;
        },
        'ARTICLE': () => 'article',
        'ASIDE': () => 'complementary',
        'BLOCKQUOTE': () => 'blockquote',
        'BUTTON': () => 'button',
        'CAPTION': () => 'caption',
        'CODE': () => 'code',
        'DATALIST': () => 'listbox',
        'DD': () => 'definition',
        'DEL': () => 'deletion',
        'DETAILS': () => 'group',
        'DFN': () => 'term',
        'DIALOG': () => 'dialog',
        'DT': () => 'term',
        'EM': () => 'emphasis',
        'FIELDSET': () => 'group',
        'FIGURE': () => 'figure',
        'FOOTER': (e) => domUtils.closestCrossShadow(e, roleUtils.kAncestorPreventingLandmark) ? null : 'contentinfo',
        'FORM': (e) => roleUtils.hasExplicitAccessibleName(e) ? 'form' : null,
        'H1': () => 'heading',
        'H2': () => 'heading',
        'H3': () => 'heading',
        'H4': () => 'heading',
        'H5': () => 'heading',
        'H6': () => 'heading',
        'HEADER': (e) => domUtils.closestCrossShadow(e, roleUtils.kAncestorPreventingLandmark) ? null : 'banner',
        'HR': () => 'separator',
        'HTML': () => 'document',
        'IMG': (e) => (e.getAttribute('alt') === '') && !e.getAttribute('title') && !roleUtils.hasGlobalAriaAttribute(e) && !roleUtils.hasTabIndex(e) ? 'presentation' : 'img',
        'INPUT': (e) => {
            const type = e.type.toLowerCase();
            if (type === 'search')
                return e.hasAttribute('list') ? 'combobox' : 'searchbox';
            if (['email', 'tel', 'text', 'url', ''].includes(type)) {
                const list = roleUtils.getIdRefs(e, e.getAttribute('list'))[0];
                return (list && domUtils.elementSafeTagName(list) === 'DATALIST') ? 'combobox' : 'textbox';
            }
            if (type === 'hidden')
                return null;
            return roleUtils.inputTypeToRole[type] || 'textbox';
        },
        'INS': () => 'insertion',
        'LI': () => 'listitem',
        'MAIN': () => 'main',
        'MARK': () => 'mark',
        'MATH': () => 'math',
        'MENU': () => 'list',
        'METER': () => 'meter',
        'NAV': () => 'navigation',
        'OL': () => 'list',
        'OPTGROUP': () => 'group',
        'OPTION': () => 'option',
        'OUTPUT': () => 'status',
        'P': () => 'paragraph',
        'PROGRESS': () => 'progressbar',
        'SECTION': (e) => roleUtils.hasExplicitAccessibleName(e) ? 'region' : null,
        'SELECT': (e) => e.hasAttribute('multiple') || e.size > 1 ? 'listbox' : 'combobox',
        'STRONG': () => 'strong',
        'SUB': () => 'subscript',
        'SUP': () => 'superscript',
        'SVG': () => 'img',
        'TABLE': () => 'table',
        'TBODY': () => 'rowgroup',
        'TD': (e) => {
            const table = domUtils.closestCrossShadow(e, 'table');
            const role = table ? roleUtils.getExplicitAriaRole(table) : '';
            return (role === 'grid' || role === 'treegrid') ? 'gridcell' : 'cell';
        },
        'TEXTAREA': () => 'textbox',
        'TFOOT': () => 'rowgroup',
        'TH': (e) => {
            if (e.getAttribute('scope') === 'col')
                return 'columnheader';
            if (e.getAttribute('scope') === 'row')
                return 'rowheader';
            const table = domUtils.closestCrossShadow(e, 'table');
            const role = table ? roleUtils.getExplicitAriaRole(table) : '';
            return (role === 'grid' || role === 'treegrid') ? 'gridcell' : 'cell';
        },
        'THEAD': () => 'rowgroup',
        'TIME': () => 'time',
        'TR': () => 'row',
        'UL': () => 'list',
    },
    kPresentationInheritanceParents: {
        'DD': ['DL', 'DIV'],
        'DIV': ['DL'],
        'DT': ['DL', 'DIV'],
        'LI': ['OL', 'UL'],
        'TBODY': ['TABLE'],
        'TD': ['TR'],
        'TFOOT': ['TABLE'],
        'TH': ['TR'],
        'THEAD': ['TABLE'],
        'TR': ['THEAD', 'TBODY', 'TFOOT', 'TABLE'],
    },

    hasExplicitAccessibleName(e) {
        return e.hasAttribute('aria-label') || e.hasAttribute('aria-labelledby');
    },
    hasTabIndex(element) {
        return !Number.isNaN(Number(String(element.getAttribute('tabindex'))));
    },


    beginAriaCaches() {
        ++this.cachesCounter;
        this._cacheAccessibleName ??= new Map();
        this._cacheAccessibleNameHidden ??= new Map();
        this._cacheAccessibleDescription ??= new Map();
        this._cacheAccessibleDescriptionHidden ??= new Map();
        this._cacheAccessibleErrorMessage ??= new Map();
        this._cacheIsHidden ??= new Map();
        this._cachePseudoContentBefore ??= new Map();
        this._cachePseudoContentAfter ??= new Map();
    },


    endAriaCaches() {
        if (!--this.cachesCounter) {
            delete this._cacheAccessibleName;
            delete this._cacheAccessibleNameHidden;
            delete this._cacheAccessibleDescription;
            delete this._cacheAccessibleDescriptionHidden;
            delete this._cacheAccessibleErrorMessage;
            delete this._cacheIsHidden;
            delete this._cachePseudoContentBefore;
            delete this._cachePseudoContentAfter;
        }
    },


    getPseudoContent(element, pseudo) {
        const cache = pseudo === '::before' ? this._cachePseudoContentBefore : this._cachePseudoContentAfter;
        if (cache?.has(element))
            return cache?.get(element) || '';
        const pseudoStyle = getElementComputedStyle(element, pseudo);
        const content = this.getPseudoContentImpl(element, pseudoStyle);
        if (cache)
            cache.set(element, content);
        return content;
    },
    getPseudoContentImpl(element, pseudoStyle) {
        // Note: all browsers ignore display:none and visibility:hidden pseudos.
        if (!pseudoStyle || pseudoStyle.display === 'none' || pseudoStyle.visibility === 'hidden')
            return '';
        const content = pseudoStyle.content;
        let resolvedContent;
        if ((content[0] === '\'' && content[content.length - 1] === '\'') ||
            (content[0] === '"' && content[content.length - 1] === '"')) {
            resolvedContent = content.substring(1, content.length - 1);
        } else if (content.startsWith('attr(') && content.endsWith(')')) {
            // Firefox does not resolve attribute accessors in content.
            const attrName = content.substring('attr('.length, content.length - 1).trim();
            resolvedContent = element.getAttribute(attrName) || '';
        }
        if (resolvedContent !== undefined) {
            // SPEC DIFFERENCE.
            // Spec says "CSS textual content, without a space", but we account for display
            // to pass "name_file-label-inline-block-styles-manual.html"
            const display = pseudoStyle.display || 'inline';
            if (display !== 'inline')
                return ' ' + resolvedContent + ' ';
            return resolvedContent;
        }
        return '';
    },

    getExplicitAriaRole(element) {
        const roles = (element.getAttribute('role') || '').split(' ').map(role => role.trim());
        return roles.find(role => this.validatedRoles.includes(role)) || null;
    },
    getImplicitAriaRole(element) {
        const implicitRole = this.kImplicitRoleByTagName[domUtils.elementSafeTagName(element)]?.(element) || '';
        if (!implicitRole)
            return null;
        let ancestor = element;
        while (ancestor) {
            const parent = domUtils.parentElementOrShadowHost(ancestor);
            const parents = this.kPresentationInheritanceParents[domUtils.elementSafeTagName(ancestor)];
            if (!parents || !parent || !parents.includes(domUtils.elementSafeTagName(parent)))
                break;
            const parentExplicitRole = this.getExplicitAriaRole(parent);
            if ((parentExplicitRole === 'none' || parentExplicitRole === 'presentation') && !this.hasPresentationConflictResolution(parent, parentExplicitRole))
                return parentExplicitRole;
            ancestor = parent;
        }
        return implicitRole;
    },

    hasPresentationConflictResolution(element, role) {
        return this.hasGlobalAriaAttribute(element, role) || this.isFocusable(element);
    },
    isFocusable(element) {
        // TODO:
        // - "inert" attribute makes the whole substree not focusable
        // - when dialog is open on the page - everything but the dialog is not focusable
        return !this.isNativelyDisabled(element) && (this.isNativelyFocusable(element) || this.hasTabIndex(element));
    },
    isNativelyFocusable(element) {
        const tagName = domUtils.elementSafeTagName(element);
        if (['BUTTON', 'DETAILS', 'SELECT', 'TEXTAREA'].includes(tagName))
            return true;
        if (tagName === 'A' || tagName === 'AREA')
            return element.hasAttribute('href');
        if (tagName === 'INPUT')
            return !element.hidden;
        return false;
    },

    isNativelyDisabled(element) {
        // https://www.w3.org/TR/html-aam-1.0/#html-attribute-state-and-property-mappings
        const isNativeFormControl = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'OPTION', 'OPTGROUP'].includes(element.tagName);
        return isNativeFormControl && (element.hasAttribute('disabled') || this.belongsToDisabledFieldSet(element));
    },
    belongsToDisabledFieldSet(element) {
        const fieldSetElement = element?.closest('FIELDSET[DISABLED]');
        if (!fieldSetElement)
            return false;
        const legendElement = fieldSetElement.querySelector(':scope > LEGEND');
        return !legendElement || !legendElement.contains(element);
    },

    asFlatString(s) {
        // "Flat string" at https://w3c.github.io/accname/#terminology
        // Note that non-breaking spaces are preserved.
        return s.split('\u00A0').map(chunk => chunk.replace(/\r\n/g, '\n').replace(/[\u200b\u00ad]/g, '').replace(/\s\s*/g, ' ')).join('\u00A0').trim();
    },

    getAriaRole(element) {
        const explicitRole = this.getExplicitAriaRole(element);
        if (!explicitRole)
            return this.getImplicitAriaRole(element);
        if (explicitRole === 'none' || explicitRole === 'presentation') {
            const implicitRole = this.getImplicitAriaRole(element);
            if (this.hasPresentationConflictResolution(element, implicitRole))
                return implicitRole;
        }
        return explicitRole;
    },

    getElementAccessibleName(element, includeHidden) {
        const cache = (includeHidden ? this._cacheAccessibleNameHidden : this._cacheAccessibleName);
        let accessibleName = cache === null || cache === void 0 ? void 0 : cache.get(element);
        if (accessibleName === undefined) {
            // https://w3c.github.io/accname/#computation-steps
            accessibleName = '';
            // step 1.
            // https://w3c.github.io/aria/#namefromprohibited
            const elementProhibitsNaming = ['caption', 'code', 'definition', 'deletion', 'emphasis', 'generic', 'insertion', 'mark', 'paragraph', 'presentation', 'strong', 'subscript', 'suggestion', 'superscript', 'term', 'time'].includes(this.getAriaRole(element) || '');
            if (!elementProhibitsNaming) {
                // step 2.
                accessibleName = this.asFlatString(this.getTextAlternativeInternal(element, {
                    includeHidden,
                    visitedElements: new Set(),
                    embeddedInTargetElement: 'self',
                }));
            }
            cache === null || cache === void 0 ? void 0 : cache.set(element, accessibleName);
        }
        return accessibleName;
    },

    isElementIgnoredForAria(element) {
        return ['STYLE', 'SCRIPT', 'NOSCRIPT', 'TEMPLATE'].includes(domUtils.elementSafeTagName(element));
    },

    isElementHiddenForAria(element) {
        if (this.isElementIgnoredForAria(element))
            return true;
        const style = getElementComputedStyle(element);
        const isSlot = element.nodeName === 'SLOT';
        if (style?.display === 'contents' && !isSlot) {
            // display:contents is not rendered itself, but its child nodes are.
            for (let child = element.firstChild; child; child = child.nextSibling) {
                if (child.nodeType === 1 /* Node.ELEMENT_NODE */ && !this.isElementHiddenForAria(child))
                    return false;
                if (child.nodeType === 3 /* Node.TEXT_NODE */ && domUtils.isVisibleTextNode(child))
                    return false;
            }
            return true;
        }
        // Note: <option> inside <select> are not affected by visibility or content-visibility.
        // Same goes for <slot>.
        const isOptionInsideSelect = element.nodeName === 'OPTION' && !!element.closest('select');
        if (!isOptionInsideSelect && !isSlot && !domUtils.isElementStyleVisibilityVisible(element, style))
            return true;
        return this.belongsToDisplayNoneOrAriaHiddenOrNonSlotted(element);
    },

    belongsToDisplayNoneOrAriaHiddenOrNonSlotted(element) {
        let hidden = this._cacheIsHidden === null || this._cacheIsHidden === void 0 ? void 0 : this._cacheIsHidden.get(element);
        if (hidden === undefined) {
            hidden = false;
            // When parent has a shadow root, all light dom children must be assigned to a slot,
            // otherwise they are not rendered and considered hidden for aria.
            // Note: we can remove this logic once WebKit supports `Element.checkVisibility`.
            if (element.parentElement && element.parentElement.shadowRoot && !element.assignedSlot)
                hidden = true;
            // display:none and aria-hidden=true are considered hidden for aria.
            if (!hidden) {
                const style = getElementComputedStyle(element);
                hidden = !style || style.display === 'none' || this.getAriaBoolean(element.getAttribute('aria-hidden')) === true;
            }
            // Check recursively.
            if (!hidden) {
                const parent = domUtils.parentElementOrShadowHost(element);
                if (parent)
                    hidden = this.belongsToDisplayNoneOrAriaHiddenOrNonSlotted(parent);
            }
            this._cacheIsHidden === null || this._cacheIsHidden === void 0 ? void 0 : this._cacheIsHidden.set(element, hidden);
        }
        return hidden;
    },

    getAriaBoolean(attr) {
        return attr === null ? undefined : attr.toLowerCase() === 'true';
    },

    getAriaLabelledByElements(element) {
        const ref = element.getAttribute('aria-labelledby');
        if (ref === null)
            return null;
        const refs = this.getIdRefs(element, ref);
        // step 2b:
        // "if the current node has an aria-labelledby attribute that contains at least one valid IDREF"
        // Therefore, if none of the refs match an element, we consider aria-labelledby to be missing.
        return refs.length ? refs : null;
    },
    getIdRefs(element, ref) {
        if (!ref)
            return [];
        const root = domUtils.enclosingShadowRootOrDocument(element);
        if (!root)
            return [];
        try {
            const ids = ref.split(' ').filter(id => !!id);
            const result = [];
            for (const id of ids) {
                // https://www.w3.org/TR/wai-aria-1.2/#mapping_additional_relations_error_processing
                // "If more than one element has the same ID, the user agent SHOULD use the first element found with the given ID"
                const firstElement = root.querySelector('#' + CSS.escape(id));
                if (firstElement && !result.includes(firstElement))
                    result.push(firstElement);
            }
            return result;
        } catch (e) {
            return [];
        }
    },

    queryInAriaOwned(element, selector) {
        const result = [...element.querySelectorAll(selector)];
        for (const owned of this.getIdRefs(element, element.getAttribute('aria-owns'))) {
            if (owned.matches(selector))
                result.push(owned);
            result.push(...owned.querySelectorAll(selector));
        }
        return result;
    },
    trimFlatString(s) {
        // "Flat string" at https://w3c.github.io/accname/#terminology
        return s.trim();
    },

    getAccessibleNameFromAssociatedLabels(labels, options) {
        return [...labels].map(label => this.getTextAlternativeInternal(label, Object.assign(Object.assign({}, options), {
            embeddedInLabel: {
                element: label,
                hidden: this.isElementHiddenForAria(label)
            },
            embeddedInNativeTextAlternative: undefined,
            embeddedInLabelledBy: undefined,
            embeddedInDescribedBy: undefined,
            embeddedInTargetElement: undefined
        }))).filter(accessibleName => !!accessibleName).join(' ');
    },


    getTextAlternativeInternal(element, options) {
        var _a, _b, _c, _d;
        if (options.visitedElements.has(element))
            return '';
        const childOptions = Object.assign(Object.assign({}, options), {embeddedInTargetElement: options.embeddedInTargetElement === 'self' ? 'descendant' : options.embeddedInTargetElement});
        // step 2a. Hidden Not Referenced: If the current node is hidden and is:
        // Not part of an aria-labelledby or aria-describedby traversal, where the node directly referenced by that relation was hidden.
        // Nor part of a native host language text alternative element (e.g. label in HTML) or attribute traversal, where the root of that traversal was hidden.
        if (!options.includeHidden) {
            const isEmbeddedInHiddenReferenceTraversal = !!((_a = options.embeddedInLabelledBy) === null || _a === void 0 ? void 0 : _a.hidden) ||
                !!((_b = options.embeddedInDescribedBy) === null || _b === void 0 ? void 0 : _b.hidden) ||
                !!((_c = options.embeddedInNativeTextAlternative) === null || _c === void 0 ? void 0 : _c.hidden) ||
                !!((_d = options.embeddedInLabel) === null || _d === void 0 ? void 0 : _d.hidden);
            if (this.isElementIgnoredForAria(element) ||
                (!isEmbeddedInHiddenReferenceTraversal && this.isElementHiddenForAria(element))) {
                options.visitedElements.add(element);
                return '';
            }
        }
        const labelledBy = this.getAriaLabelledByElements(element);
        // step 2b. LabelledBy:
        // Otherwise, if the current node has an aria-labelledby attribute that contains
        // at least one valid IDREF, and the current node is not already part of an ongoing
        // aria-labelledby or aria-describedby traversal, process its IDREFs in the order they occur...
        if (!options.embeddedInLabelledBy) {
            const accessibleName = (labelledBy || []).map(ref => this.getTextAlternativeInternal(ref, Object.assign(Object.assign({}, options), {
                embeddedInLabelledBy: {
                    element: ref,
                    hidden: this.isElementHiddenForAria(ref)
                },
                embeddedInDescribedBy: undefined,
                embeddedInTargetElement: undefined,
                embeddedInLabel: undefined,
                embeddedInNativeTextAlternative: undefined
            }))).join(' ');
            if (accessibleName)
                return accessibleName;
        }
        const role = this.getAriaRole(element) || '';
        const tagName = domUtils.elementSafeTagName(element);
        // step 2c:
        //   if the current node is a control embedded within the label (e.g. any element directly referenced by aria-labelledby) for another widget...
        //
        // also step 2d "skip to rule Embedded Control" section:
        //   If traversal of the current node is due to recursion and the current node is an embedded control...
        // Note this is not strictly by the spec, because spec only applies this logic when "aria-label" is present.
        // However, browsers and and wpt test name_heading-combobox-focusable-alternative-manual.html follow this behavior,
        // and there is an issue filed for this: https://github.com/w3c/accname/issues/64
        if (!!options.embeddedInLabel || !!options.embeddedInLabelledBy || options.embeddedInTargetElement === 'descendant') {
            const isOwnLabel = [...element.labels || []].includes(element);
            const isOwnLabelledBy = (labelledBy || []).includes(element);
            if (!isOwnLabel && !isOwnLabelledBy) {
                if (role === 'textbox') {
                    options.visitedElements.add(element);
                    if (tagName === 'INPUT' || tagName === 'TEXTAREA')
                        return element.value;
                    return element.textContent || '';
                }
                if (['combobox', 'listbox'].includes(role)) {
                    options.visitedElements.add(element);
                    let selectedOptions;
                    if (tagName === 'SELECT') {
                        selectedOptions = [...element.selectedOptions];
                        if (!selectedOptions.length && element.options.length)
                            selectedOptions.push(element.options[0]);
                    } else {
                        const listbox = role === 'combobox' ? this.queryInAriaOwned(element, '*').find(e => this.getAriaRole(e) === 'listbox') : element;
                        selectedOptions = listbox ? this.queryInAriaOwned(listbox, '[aria-selected="true"]').filter(e => this.getAriaRole(e) === 'option') : [];
                    }
                    if (!selectedOptions.length && tagName === 'INPUT') {
                        // SPEC DIFFERENCE:
                        // This fallback is not explicitly mentioned in the spec, but all browsers and
                        // wpt test name_heading-combobox-focusable-alternative-manual.html do this.
                        return element.value;
                    }
                    return selectedOptions.map(option => this.getTextAlternativeInternal(option, childOptions)).join(' ');
                }
                if (['progressbar', 'scrollbar', 'slider', 'spinbutton', 'meter'].includes(role)) {
                    options.visitedElements.add(element);
                    if (element.hasAttribute('aria-valuetext'))
                        return element.getAttribute('aria-valuetext') || '';
                    if (element.hasAttribute('aria-valuenow'))
                        return element.getAttribute('aria-valuenow') || '';
                    return element.getAttribute('value') || '';
                }
                if (['menu'].includes(role)) {
                    // https://github.com/w3c/accname/issues/67#issuecomment-553196887
                    options.visitedElements.add(element);
                    return '';
                }
            }
        }
        // step 2d.
        const ariaLabel = element.getAttribute('aria-label') || '';
        if (this.trimFlatString(ariaLabel)) {
            options.visitedElements.add(element);
            return ariaLabel;
        }
        // step 2e.
        if (!['presentation', 'none'].includes(role)) {
            // https://w3c.github.io/html-aam/#input-type-button-input-type-submit-and-input-type-reset-accessible-name-computation
            //
            // SPEC DIFFERENCE.
            // Spec says to ignore this when aria-labelledby is defined.
            // WebKit follows the spec, while Chromium and Firefox do not.
            // We align with Chromium and Firefox here.
            if (tagName === 'INPUT' && ['button', 'submit', 'reset'].includes(element.type)) {
                options.visitedElements.add(element);
                const value = element.value || '';
                if (this.trimFlatString(value))
                    return value;
                if (element.type === 'submit')
                    return 'Submit';
                if (element.type === 'reset')
                    return 'Reset';
                const title = element.getAttribute('title') || '';
                return title;
            }
            // https://w3c.github.io/html-aam/#input-type-image-accessible-name-computation
            //
            // SPEC DIFFERENCE.
            // Spec says to ignore this when aria-labelledby is defined, but all browsers take it into account.
            if (tagName === 'INPUT' && element.type === 'image') {
                options.visitedElements.add(element);
                const labels = element.labels || [];
                if (labels.length && !options.embeddedInLabelledBy)
                    return this.getAccessibleNameFromAssociatedLabels(labels, options);
                const alt = element.getAttribute('alt') || '';
                if (this.trimFlatString(alt))
                    return alt;
                const title = element.getAttribute('title') || '';
                if (this.trimFlatString(title))
                    return title;
                // SPEC DIFFERENCE.
                // Spec says return localized "Submit Query", but browsers and axe-core insist on "Submit".
                return 'Submit';
            }
            // https://w3c.github.io/html-aam/#button-element-accessible-name-computation
            if (!labelledBy && tagName === 'BUTTON') {
                options.visitedElements.add(element);
                const labels = element.labels || [];
                if (labels.length)
                    return this.getAccessibleNameFromAssociatedLabels(labels, options);
                // From here, fallthrough to step 2f.
            }
            // https://w3c.github.io/html-aam/#output-element-accessible-name-computation
            if (!labelledBy && tagName === 'OUTPUT') {
                options.visitedElements.add(element);
                const labels = element.labels || [];
                if (labels.length)
                    return this.getAccessibleNameFromAssociatedLabels(labels, options);
                return element.getAttribute('title') || '';
            }
            // https://w3c.github.io/html-aam/#input-type-text-input-type-password-input-type-number-input-type-search-input-type-tel-input-type-email-input-type-url-and-textarea-element-accessible-name-computation
            // https://w3c.github.io/html-aam/#other-form-elements-accessible-name-computation
            // For "other form elements", we count select and any other input.
            //
            // Note: WebKit does not follow the spec and uses placeholder when aria-labelledby is present.
            if (!labelledBy && (tagName === 'TEXTAREA' || tagName === 'SELECT' || tagName === 'INPUT')) {
                options.visitedElements.add(element);
                const labels = element.labels || [];
                if (labels.length)
                    return this.getAccessibleNameFromAssociatedLabels(labels, options);
                const usePlaceholder = (tagName === 'INPUT' && ['text', 'password', 'search', 'tel', 'email', 'url'].includes(element.type)) || tagName === 'TEXTAREA';
                const placeholder = element.getAttribute('placeholder') || '';
                const title = element.getAttribute('title') || '';
                if (!usePlaceholder || title)
                    return title;
                return placeholder;
            }
            // https://w3c.github.io/html-aam/#fieldset-and-legend-elements
            if (!labelledBy && tagName === 'FIELDSET') {
                options.visitedElements.add(element);
                for (let child = element.firstElementChild; child; child = child.nextElementSibling) {
                    if (domUtils.elementSafeTagName(child) === 'LEGEND') {
                        return this.getTextAlternativeInternal(child, Object.assign(Object.assign({}, childOptions), {
                            embeddedInNativeTextAlternative: {
                                element: child,
                                hidden: this.isElementHiddenForAria(child)
                            }
                        }));
                    }
                }
                const title = element.getAttribute('title') || '';
                return title;
            }
            // https://w3c.github.io/html-aam/#figure-and-figcaption-elements
            if (!labelledBy && tagName === 'FIGURE') {
                options.visitedElements.add(element);
                for (let child = element.firstElementChild; child; child = child.nextElementSibling) {
                    if (domUtils.elementSafeTagName(child) === 'FIGCAPTION') {
                        return this.getTextAlternativeInternal(child, Object.assign(Object.assign({}, childOptions), {
                            embeddedInNativeTextAlternative: {
                                element: child,
                                hidden: this.isElementHiddenForAria(child)
                            }
                        }));
                    }
                }
                const title = element.getAttribute('title') || '';
                return title;
            }
            // https://w3c.github.io/html-aam/#img-element
            //
            // SPEC DIFFERENCE.
            // Spec says to ignore this when aria-labelledby is defined, but all browsers take it into account.
            if (tagName === 'IMG') {
                options.visitedElements.add(element);
                const alt = element.getAttribute('alt') || '';
                if (this.trimFlatString(alt))
                    return alt;
                const title = element.getAttribute('title') || '';
                return title;
            }
            // https://w3c.github.io/html-aam/#table-element
            if (tagName === 'TABLE') {
                options.visitedElements.add(element);
                for (let child = element.firstElementChild; child; child = child.nextElementSibling) {
                    if (domUtils.elementSafeTagName(child) === 'CAPTION') {
                        return this.getTextAlternativeInternal(child, Object.assign(Object.assign({}, childOptions), {
                            embeddedInNativeTextAlternative: {
                                element: child,
                                hidden: this.isElementHiddenForAria(child)
                            }
                        }));
                    }
                }
                // SPEC DIFFERENCE.
                // Spec does not say a word about <table summary="...">, but all browsers actually support it.
                const summary = element.getAttribute('summary') || '';
                if (summary)
                    return summary;
                // SPEC DIFFERENCE.
                // Spec says "if the table element has a title attribute, then use that attribute".
                // We ignore title to pass "name_from_content-manual.html".
            }
            // https://w3c.github.io/html-aam/#area-element
            if (tagName === 'AREA') {
                options.visitedElements.add(element);
                const alt = element.getAttribute('alt') || '';
                if (this.trimFlatString(alt))
                    return alt;
                const title = element.getAttribute('title') || '';
                return title;
            }
            // https://www.w3.org/TR/svg-aam-1.0/#mapping_additional_nd
            if (tagName === 'SVG' || element.ownerSVGElement) {
                options.visitedElements.add(element);
                for (let child = element.firstElementChild; child; child = child.nextElementSibling) {
                    if (domUtils.elementSafeTagName(child) === 'TITLE' && child.ownerSVGElement) {
                        return this.getTextAlternativeInternal(child, Object.assign(Object.assign({}, childOptions), {
                            embeddedInLabelledBy: {
                                element: child,
                                hidden: this.isElementHiddenForAria(child)
                            }
                        }));
                    }
                }
            }
            if (element.ownerSVGElement && tagName === 'A') {
                const title = element.getAttribute('xlink:title') || '';
                if (this.trimFlatString(title)) {
                    options.visitedElements.add(element);
                    return title;
                }
            }
        }
        // See https://w3c.github.io/html-aam/#summary-element-accessible-name-computation for "summary"-specific check.
        const shouldNameFromContentForSummary = tagName === 'SUMMARY' && !['presentation', 'none'].includes(role);
        // step 2f + step 2h.
        if (this.allowsNameFromContent(role, options.embeddedInTargetElement === 'descendant') ||
            shouldNameFromContentForSummary ||
            !!options.embeddedInLabelledBy || !!options.embeddedInDescribedBy ||
            !!options.embeddedInLabel || !!options.embeddedInNativeTextAlternative) {
            options.visitedElements.add(element);
            const accessibleName = this.innerAccumulatedElementText(element, childOptions);
            // Spec says "Return the accumulated text if it is not the empty string". However, that is not really
            // compatible with the real browser behavior and wpt tests, where an element with empty contents will fallback to the title.
            // So we follow the spec everywhere except for the target element itself. This can probably be improved.
            const maybeTrimmedAccessibleName = options.embeddedInTargetElement === 'self' ? this.trimFlatString(accessibleName) : accessibleName;
            if (maybeTrimmedAccessibleName)
                return accessibleName;
        }
        // step 2i.
        if (!['presentation', 'none'].includes(role) || tagName === 'IFRAME') {
            options.visitedElements.add(element);
            const title = element.getAttribute('title') || '';
            if (this.trimFlatString(title))
                return title;
        }
        options.visitedElements.add(element);
        return '';
    },

    innerAccumulatedElementText(element, options) {
        const tokens = [];
        const visit = (node, skipSlotted) => {
            var _a;
            if (skipSlotted && node.assignedSlot)
                return;
            if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                const display = ((_a = getElementComputedStyle(node)) === null || _a === void 0 ? void 0 : _a.display) || 'inline';
                let token = this.getTextAlternativeInternal(node, options);
                // SPEC DIFFERENCE.
                // Spec says "append the result to the accumulated text", assuming "with space".
                // However, multiple tests insist that inline elements do not add a space.
                // Additionally, <br> insists on a space anyway, see "name_file-label-inline-block-elements-manual.html"
                if (display !== 'inline' || node.nodeName === 'BR')
                    token = ' ' + token + ' ';
                tokens.push(token);
            } else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                // step 2g.
                tokens.push(node.textContent || '');
            }
        };
        tokens.push(this.getPseudoContent(element, '::before'));
        const assignedNodes = element.nodeName === 'SLOT' ? element.assignedNodes() : [];
        if (assignedNodes.length) {
            for (const child of assignedNodes)
                visit(child, false);
        } else {
            for (let child = element.firstChild; child; child = child.nextSibling)
                visit(child, true);
            if (element.shadowRoot) {
                for (let child = element.shadowRoot.firstChild; child; child = child.nextSibling)
                    visit(child, true);
            }
            for (const owned of this.getIdRefs(element, element.getAttribute('aria-owns')))
                visit(owned, true);
        }
        tokens.push(this.getPseudoContent(element, '::after'));
        return tokens.join('');
    },

    allowsNameFromContent(role, targetDescendant) {
        // SPEC: https://w3c.github.io/aria/#namefromcontent
        //
        // Note: there is a spec proposal https://github.com/w3c/aria/issues/1821 that
        // is roughly aligned with what Chrome/Firefox do, and we follow that.
        //
        // See chromium implementation here:
        // https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/modules/accessibility/ax_object.cc;l=6338;drc=3decef66bc4c08b142a19db9628e9efe68973e64;bpv=0;bpt=1
        const alwaysAllowsNameFromContent = ['button', 'cell', 'checkbox', 'columnheader', 'gridcell', 'heading', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'radio', 'row', 'rowheader', 'switch', 'tab', 'tooltip', 'treeitem'].includes(role);
        const descendantAllowsNameFromContent = targetDescendant && ['', 'caption', 'code', 'contentinfo', 'definition', 'deletion', 'emphasis', 'insertion', 'list', 'listitem', 'mark', 'none', 'paragraph', 'presentation', 'region', 'row', 'rowgroup', 'section', 'strong', 'subscript', 'superscript', 'table', 'term', 'time'].includes(role);
        return alwaysAllowsNameFromContent || descendantAllowsNameFromContent;
    },


    _collectTextContent(element) {
        let text = '';
        const walk = node => {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
                    for (let child = node.firstChild; child; child = child.nextSibling)
                        walk(child);
                }
            }
        };
        walk(element);
        return text.trim();
    },

    getAriaChecked(element) {
        if (element.hasAttribute('aria-checked')) {
            const checked = element.getAttribute('aria-checked');
            if (checked === 'true') return true;
            if (checked === 'mixed') return 'mixed';
            return false;
        }
        if (element instanceof HTMLInputElement && element.type === 'checkbox')
            return element.checked;
        if (element instanceof HTMLInputElement && element.type === 'radio')
            return element.checked;
        return undefined;
    },

    getAriaDisabled(element) {
        if (element.hasAttribute('aria-disabled'))
            return element.getAttribute('aria-disabled') === 'true';
        if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement ||
            element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement ||
            element instanceof HTMLOptGroupElement || element instanceof HTMLOptionElement ||
            element instanceof HTMLFieldSetElement)
            return element.disabled;
        return false;
    },

    getAriaExpanded(element) {
        if (element.hasAttribute('aria-expanded'))
            return element.getAttribute('aria-expanded') === 'true';
        return undefined;
    },

    getAriaLevel(element) {
        if (element.hasAttribute('aria-level')) {
            const level = parseInt(element.getAttribute('aria-level'), 10);
            if (!isNaN(level))
                return level;
        }
        const role = this.getAriaRole(element);
        if (role === 'heading') {
            const match = element.nodeName.match(/^H(\d)$/);
            if (match)
                return parseInt(match[1], 10);
        }
        return undefined;
    },

    getAriaPressed(element) {
        if (element.hasAttribute('aria-pressed')) {
            const pressed = element.getAttribute('aria-pressed');
            if (pressed === 'true') return true;
            if (pressed === 'mixed') return 'mixed';
            return false;
        }
        return undefined;
    },

    getAriaSelected(element) {
        if (element.hasAttribute('aria-selected'))
            return element.getAttribute('aria-selected') === 'true';
        if (element instanceof HTMLOptionElement)
            return element.selected;
        return undefined;
    }
};

// 集成 yaml 函数

function yamlStringNeedsQuotes(str) {
    if (str.length === 0)
        return true;
    // Strings with leading or trailing whitespace need quotes
    if (/^\s|\s$/.test(str))
        return true;
    // Strings containing control characters need quotes
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/.test(str))
        return true;
    // Strings starting with '-' need quotes
    if (/^-/.test(str))
        return true;
    // Strings containing ':' or '\n' followed by a space or at the end need quotes
    if (/[\n:](\s|$)/.test(str))
        return true;
    // Strings containing '#' preceded by a space need quotes (comment indicator)
    if (/\s#/.test(str))
        return true;
    // Strings that contain line breaks need quotes
    if (/[\n\r]/.test(str))
        return true;
    // Strings starting with indicator characters or quotes need quotes
    if (/^[&*\],?!>|@"'#%]/.test(str))
        return true;
    // Strings containing special characters that could cause ambiguity
    if (/[{}`]/.test(str))
        return true;
    // YAML array starts with [
    if (/^\[/.test(str))
        return true;
    // Non-string types recognized by YAML
    if (!isNaN(Number(str)) || ['y', 'n', 'yes', 'no', 'true', 'false', 'on', 'off', 'null'].includes(str.toLowerCase()))
        return true;
    return false;
}

function yamlEscapeKeyIfNeeded(str) {
    if (!yamlStringNeedsQuotes(str))
        return str;
    return `'` + str.replace(/'/g, `''`) + `'`;
}

function yamlEscapeValueIfNeeded(str) {
    if (!yamlStringNeedsQuotes(str))
        return str;
    return '"' + str.replace(/[\\"\x00-\x1f\x7f-\x9f]/g, c => {
        switch (c) {
            case '\\':
                return '\\\\';
            case '"':
                return '\\"';
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            default:
                const code = c.charCodeAt(0);
                return '\\x' + code.toString(16).padStart(2, '0');
        }
    }) + '"';
}

class SnapshotEngine {
    constructor() {
        this._lastAriaSnapshot = undefined;
    }

    generateAriaTree(rootElement, generation, includeIframe) {
        const visited = new Set();

        const snapshot = {
            root: {role: 'fragment', name: '', children: [], element: rootElement, props: {}},
            elements: new Map(),
            generation,
            ids: new Map(),
        };

        const addElement = (element) => {
            const id = snapshot.elements.size + 1;
            snapshot.elements.set(id, element);
            snapshot.ids.set(element, id);
        };

        addElement(rootElement);

        const visit = (ariaNode, node) => {
            if (visited.has(node))
                return;
            visited.add(node);

            if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
                const text = node.nodeValue;
                // <textarea>AAA</textarea> should not report AAA as a child of the textarea.
                if (ariaNode.role !== 'textbox' && text)
                    ariaNode.children.push(node.nodeValue || '');
                return;
            }

            if (node.nodeType !== Node.ELEMENT_NODE)
                return;

            const element = node;
            if (roleUtils.isElementHiddenForAria(element))
                return;

            const ariaChildren = [];
            if (element.hasAttribute('aria-owns')) {
                const ids = element.getAttribute('aria-owns').split(/\s+/);
                for (const id of ids) {
                    const ownedElement = rootElement.ownerDocument.getElementById(id);
                    if (ownedElement)
                        ariaChildren.push(ownedElement);
                }
            }

            addElement(element);
            const childAriaNode = this._toAriaNode(element, includeIframe);
            if (childAriaNode)
                ariaNode.children.push(childAriaNode);
            this._processElement(childAriaNode || ariaNode, element, ariaChildren, visit);
        };

        roleUtils.beginAriaCaches();
        try {
            visit(snapshot.root, rootElement);
        } finally {
            roleUtils.endAriaCaches();
        }

        this._normalizeStringChildren(snapshot.root);
        return snapshot;
    }

    queryAll(selector) {
        const match = selector.match(/^s(\d+)e(\d+)$/);
        if (!match)
            return [];
        const [, generation, eleId] = match;
        if (this._lastAriaSnapshot?.generation !== +generation)
            return [];

        const queryRes = this._lastAriaSnapshot?.elements?.get(+eleId);

        return queryRes && queryRes.isConnected ? [queryRes][0] : null;
    }


    _toAriaNode(element, includeIframe) {
        if (includeIframe && element.nodeName === 'IFRAME')
            return {role: 'iframe', name: '', children: [], props: {}, element};

        const role = roleUtils.getAriaRole(element);
        if (!role || role === 'presentation' || role === 'none')
            return null;

        const name = normalizeWhiteSpace(roleUtils.getElementAccessibleName(element, false) || '');
        const result = {role, name, children: [], props: {}, element};

        if (roleUtils.kAriaCheckedRoles.includes(role))
            result.checked = roleUtils.getAriaChecked(element);

        if (roleUtils.kAriaDisabledRoles.includes(role))
            result.disabled = roleUtils.getAriaDisabled(element);

        if (roleUtils.kAriaExpandedRoles.includes(role))
            result.expanded = roleUtils.getAriaExpanded(element);

        if (roleUtils.kAriaLevelRoles.includes(role))
            result.level = roleUtils.getAriaLevel(element);

        if (roleUtils.kAriaPressedRoles.includes(role))
            result.pressed = roleUtils.getAriaPressed(element);

        if (roleUtils.kAriaSelectedRoles.includes(role))
            result.selected = roleUtils.getAriaSelected(element);

        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            if (element.type !== 'checkbox' && element.type !== 'radio')
                result.children = [element.value];
        }

        return result;
    }


    _processElement(ariaNode, element, ariaChildren = [], visit) {
        var _a;
        // Surround every element with spaces for the sake of concatenated text nodes.
        const display = ((_a = getElementComputedStyle(element)) === null || _a === void 0 ? void 0 : _a.display) || 'inline';
        const treatAsBlock = (display !== 'inline' || element.nodeName === 'BR') ? ' ' : '';
        if (treatAsBlock)
            ariaNode.children.push(treatAsBlock);
        ariaNode.children.push(roleUtils.getPseudoContent(element, '::before'));
        const assignedNodes = element.nodeName === 'SLOT' ? element.assignedNodes() : [];
        if (assignedNodes.length) {
            for (const child of assignedNodes)
                visit(ariaNode, child);
        } else {
            for (let child = element.firstChild; child; child = child.nextSibling) {
                if (!child.assignedSlot)
                    visit(ariaNode, child);
            }
            if (element.shadowRoot) {
                for (let child = element.shadowRoot.firstChild; child; child = child.nextSibling)
                    visit(ariaNode, child);
            }
        }
        for (const child of ariaChildren)
            visit(ariaNode, child);
        ariaNode.children.push(roleUtils.getPseudoContent(element, '::after'));
        if (treatAsBlock)
            ariaNode.children.push(treatAsBlock);
        if (ariaNode.children.length === 1 && ariaNode.name === ariaNode.children[0])
            ariaNode.children = [];
        if (ariaNode.role === 'link' && element.hasAttribute('href')) {
            const href = element.getAttribute('href');
            ariaNode.props['url'] = href;
        }
    }

    _normalizeStringChildren(rootA11yNode) {
        const flushChildren = (buffer, normalizedChildren) => {
            if (!buffer.length)
                return;
            const text = normalizeWhiteSpace(buffer.join(''));
            if (text)
                normalizedChildren.push(text);
            buffer.length = 0;
        };

        const visit = (ariaNode) => {
            const normalizedChildren = [];
            const buffer = [];
            for (const child of ariaNode.children || []) {
                if (typeof child === 'string') {
                    buffer.push(child);
                } else {
                    flushChildren(buffer, normalizedChildren);
                    visit(child);
                    normalizedChildren.push(child);
                }
            }
            flushChildren(buffer, normalizedChildren);
            ariaNode.children = normalizedChildren.length ? normalizedChildren : [];
            if (ariaNode.children.length === 1 && ariaNode.children[0] === ariaNode.name)
                ariaNode.children = [];
        };
        visit(rootA11yNode);
    }

    _matchesText(text, template) {
        if (!template)
            return true;
        if (!text)
            return false;
        if (typeof template === 'string')
            return text === template;
        return !!text.match(new RegExp(template.pattern));
    }

    _matchesTextNode(text, template) {
        return this._matchesText(text, template.text);
    }

    _matchesName(text, template) {
        return this._matchesText(text, template.name);
    }

    matchesAriaTree(rootElement, template) {
        const snapshot = this.generateAriaTree(rootElement, 0, false);
        const matches = this._matchesNodeDeep(snapshot.root, template, false);
        return {
            matches,
            received: {
                raw: this.renderAriaTree(snapshot, {mode: 'raw'}),
                regex: this.renderAriaTree(snapshot, {mode: 'regex'}),
            }
        };
    }

    getAllByAria(rootElement, template) {
        const root = this.generateAriaTree(rootElement, 0, false).root;
        const matches = this._matchesNodeDeep(root, template, true);
        return matches.map(n => n.element);
    }

    _matchesNode(node, template, depth) {
        if (typeof node === 'string' && template.kind === 'text')
            return this._matchesTextNode(node, template);

        if (node !== null && typeof node === 'object' && template.kind === 'role') {
            if (template.role !== 'fragment' && template.role !== node.role)
                return false;
            if (template.checked !== undefined && template.checked !== node.checked)
                return false;
            if (template.disabled !== undefined && template.disabled !== node.disabled)
                return false;
            if (template.expanded !== undefined && template.expanded !== node.expanded)
                return false;
            if (template.level !== undefined && template.level !== node.level)
                return false;
            if (template.pressed !== undefined && template.pressed !== node.pressed)
                return false;
            if (template.selected !== undefined && template.selected !== node.selected)
                return false;
            if (!this._matchesName(node.name, template))
                return false;
            if (!this._matchesText(node.props.url, template.props?.url))
                return false;
            if (!this._containsList(node.children || [], template.children || [], depth))
                return false;
            return true;
        }
        return false;
    }

    _containsList(children, template, depth) {
        if (template.length > children.length)
            return false;
        const cc = children.slice();
        const tt = template.slice();
        for (const t of tt) {
            let c = cc.shift();
            while (c) {
                if (this._matchesNode(c, t, depth + 1))
                    break;
                c = cc.shift();
            }
            if (!c)
                return false;
        }
        return true;
    }

    _matchesNodeDeep(root, template, collectAll) {
        const results = [];
        const visit = (node, parent) => {
            if (this._matchesNode(node, template, 0)) {
                const result = typeof node === 'string' ? parent : node;
                if (result)
                    results.push(result);
                return !collectAll;
            }
            if (typeof node === 'string')
                return false;
            for (const child of node.children || []) {
                if (visit(child, node))
                    return true;
            }
            return false;
        };
        visit(root, null);
        return results;
    }

    renderAriaTree(ariaSnapshot, options = {}) {
        const lines = [];
        const includeText = options.mode === 'regex' ? this._textContributesInfo.bind(this) : () => true;
        const renderString = options.mode === 'regex' ? this._convertToBestGuessRegex.bind(this) : (str) => str;
        const visit = (ariaNode, parentAriaNode, indent) => {
            if (typeof ariaNode === 'string') {
                if (parentAriaNode && !includeText(parentAriaNode, ariaNode))
                    return;
                const text = yamlEscapeValueIfNeeded(renderString(ariaNode));
                if (text)
                    lines.push(indent + '- text: ' + text);
                return;
            }

            let key = ariaNode.role;
            // Yaml has a limit of 1024 characters per key, and we leave some space for role and attributes.
            if (ariaNode.name && ariaNode.name.length <= 900) {
                const name = renderString(ariaNode.name);
                if (name) {
                    const stringifiedName = name.startsWith('/') && name.endsWith('/') ? name : JSON.stringify(name);
                    key += ' ' + stringifiedName;
                }
            }
            if (ariaNode.checked === 'mixed')
                key += ` [checked=mixed]`;
            if (ariaNode.checked === true)
                key += ` [checked]`;
            if (ariaNode.disabled)
                key += ` [disabled]`;
            if (ariaNode.expanded)
                key += ` [expanded]`;
            if (ariaNode.level)
                key += ` [level=${ariaNode.level}]`;
            if (ariaNode.pressed === 'mixed')
                key += ` [pressed=mixed]`;
            if (ariaNode.pressed === true)
                key += ` [pressed]`;
            if (ariaNode.selected === true)
                key += ` [selected]`;
            if (options.ref) {
                const id = ariaSnapshot.ids.get(ariaNode.element);
                if (id)
                    key += ` [ref=s${ariaSnapshot.generation}e${id}]`;
            }

            const escapedKey = indent + '- ' + yamlEscapeKeyIfNeeded(key);
            const hasProps = !!Object.keys(ariaNode.props).length;
            if (!ariaNode.children.length && !hasProps) {
                lines.push(escapedKey);
            } else if (ariaNode.children.length === 1 && typeof ariaNode.children[0] === 'string' && !hasProps) {
                const text = includeText(ariaNode, ariaNode.children[0]) ? renderString(ariaNode.children[0]) : null;
                if (text)
                    lines.push(escapedKey + ': ' + yamlEscapeValueIfNeeded(text));
                else
                    lines.push(escapedKey);
            } else {
                lines.push(escapedKey + ':');
                for (const [name, value] of Object.entries(ariaNode.props))
                    lines.push(indent + '  - /' + name + ': ' + yamlEscapeValueIfNeeded(value));
                for (const child of ariaNode.children || [])
                    visit(child, ariaNode, indent + '  ');
            }
        };

        const ariaNode = ariaSnapshot.root;
        if (ariaNode.role === 'fragment') {
            // Render fragment.
            for (const child of ariaNode.children || [])
                visit(child, ariaNode, '');
        } else {
            visit(ariaNode, null, '');
        }
        return lines.join('\n');
    }

    _convertToBestGuessRegex(text) {
        const dynamicContent = [
            // 2mb
            {regex: /\b[\d,.]+[bkmBKM]+\b/, replacement: '[\\d,.]+[bkmBKM]+'},
            // 2ms, 20s
            {regex: /\b\d+[hmsp]+\b/, replacement: '\\d+[hmsp]+'},
            {regex: /\b[\d,.]+[hmsp]+\b/, replacement: '[\\d,.]+[hmsp]+'},
            // Do not replace single digits with regex by default.
            // 2+ digits: [Issue 22, 22.3, 2.33, 2,333]
            {regex: /\b\d+,\d+\b/, replacement: '\\d+,\\d+'},
            {regex: /\b\d+\.\d{2,}\b/, replacement: '\\d+\\.\\d+'},
            {regex: /\b\d{2,}\.\d+\b/, replacement: '\\d+\\.\\d+'},
            {regex: /\b\d{2,}\b/, replacement: '\\d+'},
        ];

        let pattern = '';
        let lastIndex = 0;

        const combinedRegex = new RegExp(dynamicContent.map(r => '(' + r.regex.source + ')').join('|'), 'g');
        text.replace(combinedRegex, (match, ...args) => {
            const offset = args[args.length - 2];
            const groups = args.slice(0, -2);
            pattern += escapeRegExp(text.slice(lastIndex, offset));
            for (let i = 0; i < groups.length; i++) {
                if (groups[i]) {
                    const {replacement} = dynamicContent[i];
                    pattern += replacement;
                    break;
                }
            }
            lastIndex = offset + match.length;
            return match;
        });
        if (!pattern)
            return text;

        pattern += escapeRegExp(text.slice(lastIndex));
        return String(new RegExp(pattern));
    }

    _textContributesInfo(node, text) {
        if (!text.length)
            return false;

        if (!node.name)
            return true;

        if (node.name.length > text.length)
            return false;

        // Figure out if text adds any value. "longestCommonSubstring" is expensive, so limit strings length.
        const substr = (text.length <= 200 && node.name.length <= 200) ? longestCommonSubstring(text, node.name) : '';
        let filtered = text;
        while (substr && filtered.includes(substr))
            filtered = filtered.replace(substr, '');
        return filtered.trim().length / text.length > 0.1;
    }

    ariaSnapshot(node, options) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
            console.log('ariaSnapshot only works on elements.')
            return;
        }
        console.log(node, options)

        const generation = (this._lastAriaSnapshot?.generation || 0) + 1;
        this._lastAriaSnapshot = this.generateAriaTree(node, generation, options?.ref ?? false);
        return this.renderAriaTree(this._lastAriaSnapshot, options);
    }
}


var snapshotEngine = new SnapshotEngine();