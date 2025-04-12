package js

import _ "embed"

//go:embed snapshotter.js
var InjectedSnapShot string

const AriaSnapshot = "(node, opts) => {return snapshotEngine.ariaSnapshot(node,opts);}"

const queryEleByAria = `(selector) => {
    return snapshotEngine.queryAll(selector);
}`
