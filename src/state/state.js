import {goToRoot} from "../graph/graph.js";
import {normalizeState} from "../normalization/normalization.js";
import {renderAll} from "../render/rendering.js";
export function initState(data) {
    const root = data.meta.root_person;
    return{
        // 🔹 Three dynamic state paths
        ancestorPath: [root],
        descendantPath: [],
        navigationStack: [], // 🔥 clean start
        // 🔹 Four persistent selections
        selectedAncestor: root,// default root (Ahnentafel #1)
        selectedPerson: null,// for section F
        selectedUnion: null,
        selectedEvent: null,
        selectedDocument: null,
        selectedFan: null,
        selectedNote: null,
        // 🔹 These two are optional, but still useful for history labeling
        currentView: "person",// "person" | "union" | "document" | "fan"
        currentId: root,  // 🔥 IMPORTANT
        showNonBiological: false
    };
}
export function initStateButtons(ctx) {
    const navContainer = document.getElementById("navButtons");
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear";
    clearBtn.onclick = () => (dispatch(ctx, {type: "RESET", root: ctx.data.meta.root_person}));
    navContainer.appendChild(clearBtn);
    const gotoBtn = document.createElement("button");
    gotoBtn.textContent = "Go to Root";
    gotoBtn.onclick = () => (goToRoot(ctx));
    navContainer.appendChild(gotoBtn);
}
function reducer(state, action) {
    switch (action.type) {
        case "SELECT_ANCESTOR": {// Used only when setting ancestor from section F - does change ancestorPath
            state.currentView = "person";
            state.currentId = action.id;
            state.selectedAncestor = action.id;
            state.ancestorPath = [action.id];
            if (state.descendantPath.length === 0 || state.descendantPath[0] !== action.id) {
                state.descendantPath = [state.selectedAncestor];
            }// ✅ Only reset descendantPath if we're actually navigating fresh
            return;
        }
        case "SELECT_PERSON": {// No clearing union/family group or document unless intentional
            state.currentView = "person";
            state.currentId = action.id;
            state.selectedAncestor = action.id;
            state.selectedPerson = action.id;
            // ✅ Only reset descendantPath if we're actually navigating fresh
            if (state.descendantPath.length === 0 || state.descendantPath[0] !== action.id) {
                state.descendantPath = [state.selectedAncestor];
            }
            return;
        }
        case "SELECT_PERSON_FROM_GRAPH": {
            state.currentView = "person";
            state.currentId = action.id;
            state.selectedPerson = action.id;
            // selectedAncestor and descendantPath do not change with this one
            return;
        }
        case "SELECT_UNION": {// Doesn't touch descendantPath or selectedAncestor
            state.currentView = "union";
            state.currentId = action.id;
            state.selectedUnion = action.id;
            //state.selectedDocument = null;// May reconsider with a condition?
            return;
        }
        case "SELECT_EVENT": {
            state.currenntView = "event";
            state.currentID = action.id;
            state.selectedEvent = action.id;
            return;
        }
        case "SELECT_DOCUMENT": {//No clearing selectedUnion
            state.currentView = "document";
            state.currentId = action.id;
            state.selectedDocument = action.id;
            return;
        }
        case "SELECT_FAN": {
            state.selectedFan = action.id;
            state.currentView = "fan";
            state.currentId = action.id;
            return;
        }
        case "SELECT_NOTE": {
            state.currentView = "note";
            state.currentId = action.id;
            state.selectedNote = action.id;
            return;
        }
        case "RESET": {
            const root = action.root;
            state.ancestorPath = [root];
            state.descendantPath = []; // ✅ keeps UI consistent
            state.navigationStack = []; // 🔥 clean start
            state.selectedAncestor = root;
            state.selectedPerson = null;
            state.selectedUnion = null;
            state.selectedEvent = null;
            state.selectedDocument = null;
            state.selectedFan = null;
            state.selectedNote = null;
            state.currentView = "person";
            state.currentId = root;
            state.showNonBiological = false;
            // Restore UI behaviour
            document.getElementById("searchBox").value = "";
            document.getElementById("searchResults").innerHTML = "";
            return;
        }
        case "TOGGLE_NON_BIO": {
            state.showNonBiological = !state.showNonBiological;
            return;
        }
    }
}
export function dispatch(ctx, action, options = {}) {// centralize history handling - push to navigation stack (centralized)
    const {skipHistory = false} = options;
    const MAX_STACK = 75;
    if (!skipHistory && ctx.state.currentView && ctx.state.currentId
    ) {
        ctx.state.navigationStack.push(structuredClone(ctx.state));
        if (ctx.state.navigationStack.length > MAX_STACK) {
            ctx.state.navigationStack.shift();
        }
    }
    reducer(ctx.state, action);
    renderAll(ctx);
}
export function goBack(ctx) {//Nav history button
    const prev = ctx.state.navigationStack.pop();
    if (!prev) return;
    Object.assign(ctx.state, prev);
    normalizeState(ctx.state);
    renderAll(ctx);
}
export function isSelected(ctx, type, id) {
    let tst = "";
    switch (type) {
        case "person": {
            if (ctx.state.selectedPerson === id) {tst = " ✅";}
        }
        case "union": {
            if (ctx.state.selectedUnion === id) {tst = " ✅"}
        }
        case "event": {
            if (ctx.state.selectedEvent === id) {tst = " ✅";}
        }
        case "fan": {
            if (ctx.state.selectedFan === id) {tst = " ✅";}
        }
        case "document": {
            if (ctx.state.selectedDocument === id) {tst = " ✅";}
        }
        case "note": {
            if (ctx.state.select3edNote === id) {tst = " ✅";}
        }
    }
    return tst;
}