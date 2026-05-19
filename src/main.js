//================= HELPERS =============
import {getPerson, sortParents, getStatusColor} from "./helpers/persons.js";
import {getRelationship, getUnionsForPerson} from "./helpers/relationships.js";
import {getFan} from "./helpers/fan.js";
import {capitalize} from "./helpers/formatting.js";
// ================ DATA ===================
let data = null;
async function loadData() {
    try {
        document.getElementById("loading").style.display = "none";
        const response = await fetch("familydata.json");
        if (!response.ok) throw new Error("Failed to load familydata.json");
        data = await response.json();
        // 🔹 Normalize + validate
        normalizeData(data);
        deepValidate(data);
        // 🔹 Initialize state AFTER data loads
        initState();
        // 🔹 First render
        renderAll(); // ✅ ensures nav history is initialized
    } catch (err) {
        console.error("DATA LOAD ERROR:", err);
    }
    console.log("DATA LOADED:");
    console.log("Persons:", data.persons.length);
    console.log("Relationships:",data.relationships.length);
    console.log("Unions:", data.relationships.filter(r => r.type === "union").length);
    console.log("Parent-child:", data.relationships.filter(r => r.type === "parent_child").length);
    if (!data.meta?.root_person) {
        console.error("Missing root_person");
    }
    const rootExists = data.persons.some(p => p.id === data.meta.root_person);
    if (!rootExists) {console.error("Root person not found in persons");}
    validateRelationships();
}
// ============ STATE ===================
let state = null;
function initState() {
    const root = data.meta.root_person;
    state = {
        // 🔹 Three dynamic state paths
        ancestorPath: [root],
        descendantPath: [],
        navigationStack: [], // 🔥 clean start
        // 🔹 Four persistent selections
        selectedAncestor: root,// default root (Ahnentafel #1)
        selectedUnion: null,
        selectedDocument: null,
        selectedFan: null,
        // 🔹 These two are optional, but still useful for history labeling
        currentView: "person",// "person" | "union" | "document" | "fan"
        currentId: root,  // 🔥 IMPORTANT
        showNonBiological: false
    };
    // Fix the navigation buttons the first time, too
    const navContainer = document.getElementById("navButtons");
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear";
    clearBtn.onclick = () => (dispatch({type: "RESET"}));
    navContainer.appendChild(clearBtn);
    const gotoBtn = document.createElement("button");
    gotoBtn.textContent = "Go to Root";
    gotoBtn.onclick = () => (goToRoot());
    navContainer.appendChild(gotoBtn);
}
// ============ HELPERS =================

//import {getParents} from "./helpers/persons.js";

//import {getChildrenForUnion} from "./helpers/relationships.js";
//import {getOtherPartners} from "./helpers/relationships.js";
//import {getPartnerNames} from "./helpers/relationships.js";

function normalizeData(data) {
    // Fix persons
    data.persons.forEach(p => {
        if (!p.unions) p.unions = [];
        if (!p.fan_club) p.fan_club = [];
        if (!p.documents) p.documents = [];
    });
}
function deepValidate(data) {
    const errors = [];
    // 1. Validate person IDs
    const personIds = new Set(data.persons.map(p => p.id));
    // 2 Check unions
    data.relationships.forEach(rel => {
        if (rel.type === "union") {
            rel.partners?.forEach(pid => {
                if (!getPerson(data, pid)) {
                    errors.push(
                        `Union ${rel.id} has invalid partner ${pid}`
                    );
                }
            });
        }
    });
    console.log("VALIDATION RESULTS:");
    errors.forEach(e => console.warn(e));
    if (!errors.length) console.log("No issues found ✅");
}
function validateParentChildLinks() {
    data.persons.forEach(person => {
        if (!person.parent_child) return;
        person.parent_child.forEach(id => {
            const rel = getRelationship(data, id);
            if (!rel) {
                errors.push(
                    `Missing parent_child relationship ${id}`
                );
                return;
            }
            if (rel.child !== person.id) {
                errors.push(`Relationship ${id} does not point back to ${person.id}`);
            }
        });
    });
}
function validateUnionChildren(union) {
    if (!union.children) return;
    union.children.forEach(entry => {
        if (!getPerson(data, entry.id)) {
            console.warn(`Union ${union.id} missing child person ${entry.id}`);
        }
        if (!entry.parent_child) return;
        entry.parent_child.forEach(relId => {
            const rel = getRelationship(data, relId);
            if (!rel) {
                console.warn(
                    `Union ${union.id} missing relationship ${relId}`
                );
                return;
            }
            if (rel.child !== entry.id) {
                console.warn(
                    `Relationship ${rel.id} child mismatch`
                );
            }
        });
    });
}
function normalizeState() {
    // 🔹 Fix descendant path
    if (state.currentView === "person") {
        state.descendantPath = state.selectedAncestor
            ? [state.selectedAncestor]
            : [];
    }
    // 🔹 Safety: ensure ancestor path always contains selectedAncestor
    if (state.selectedAncestor && !state.ancestorPath.includes(state.selectedAncestor)) {
        state.ancestorPath = [state.selectedAncestor];
    }
}

function getParents(person) {
    if (!person.parent_child) return [];
    return person.parent_child
        .map(id => getRelationship(data, id))
        .filter(rel => rel && rel.parent)
        .filter(rel => {
            if (state.showNonBiological) {
                return true;
            }
            return (
                !rel.subtype ||
                rel.subtype === "biological"
            );
        })
        .map(rel => ({
            id: rel.parent,
            subtype: rel.subtype || "biological",
            relationship: rel
        }));
}
function getChildrenForUnion(union) {
    if (!union.children) return [];
    return union.children
        .filter(entry => {
            // no metadata → assume biological
            if (!entry.parent_child) return true;
            const rels = entry.parent_child
                .map(id => getRelationship(data, id))
                .filter(Boolean);
            if (state.showNonBiological) {
                return true;
            }
            // biological-only mode
            return rels.some(r =>
                !r.subtype ||
                r.subtype === "biological"
            );
        })
        .sort((a,b) => a.order - b.order)
        .map(entry => getPerson(data, entry.id))
        .filter(Boolean);
}
function getOtherPartners(union, personId) {
    return union.partners.filter(p => p !== personId);
}
function getPartnerNames(union) {
    if (!union.partners || union.partners.length === 0) {
        return "(parents unknown)";
    }
    return union.partners
        .map(id => {
            const p = getPerson(data, id);
            return p ? p.display_name : "(unknown)";
        })
        .join(" + ");
}
function getSelectedUnion() {//transitional
    if (!state.selectedUnion) return null;
    const rel = getRelationship(data, state.selectedUnion);
    if (!rel || rel.type !== "union") {
        return null;
    }
    return rel;
}

function getParentChildRelationshipsForUnionChild(union, childId) {
    const entry = union.children?.find(c => c.id === childId);
    if (!entry || !entry.parent_child) return [];
    return entry.parent_child
        .map(id => getRelationship(data, id))
        .filter(Boolean);
}
function getChildRelationshipLabel(union, childId) {
    const rels = getParentChildRelationshipsForUnionChild(union, childId);
    if (rels.length === 0) return "";
    // hide labels for biological
    const nonBiological = rels.filter(r =>
        r.subtype && r.subtype !== "biological"
    );
    if (nonBiological.length === 0) {
        return "";
    }
    // deduplicate labels
    const labels = [...new Set(
        nonBiological.map(r =>
            capitalize(r.subtype)
        )
    )];
    return ` (${labels.join(", ")})`;
}
function validateRelationships() {
    const errors = [];
    data.relationships.forEach(r => {
        if (r.type === "union") {
            if (!r.partners || r.partners.length < 1) {
                errors.push(`Union ${r.id} has no participants`);
            }
        }
        if (r.type === "parent_child") {
            if (!r.parent || !r.child) {
                errors.push(`Parent-child ${r.id} incomplete`);
            }
        }
    });
    errors.forEach(e => console.warn(e));
}
function toggleAncestor(id, fromId) {
    const path = state.ancestorPath;
    const existingIndex = path.indexOf(id);
    if (existingIndex !== -1) {
        // collapse
        state.ancestorPath = path.slice(0, existingIndex);
    } else {
        const baseIndex = path.indexOf(fromId);
        if (baseIndex === -1) {
            console.warn("Invalid fromId in toggleAncestor:", fromId);
            return; // 🔥 STOP instead of corrupting path
        }
        state.ancestorPath = path.slice(0, baseIndex + 1);
        state.ancestorPath.push(id);
    }
    renderAll();
}
function toggleDescendant(id, fromId) {
    //debugState("BEFORE toggleDescendant");
    const path = state.descendantPath;
    const existingIndex = path.indexOf(id);
    if (existingIndex !== -1) {
        // collapse
        state.descendantPath = path.slice(0, existingIndex);
    } else {
        const baseIndex = path.indexOf(fromId);
        if (baseIndex === -1) {
            console.warn("Invalid fromId in toggleAncestor:", fromId);
            return; // 🔥 STOP instead of corrupting path
        }
        state.descendantPath = path.slice(0, baseIndex + 1);
        state.descendantPath.push(id);
    }
    //debugState("AFTER toggleDescendant");
    renderAll();
}

function createColumn(isActive) {
    const col = document.createElement("div");
    col.className = "column";
    if (isActive) {
        col.style.backgroundColor = "#e6f0ff";
        col.style.border = "2px solid #4a90e2";
    }
    return col;
}
function createHeader(person) {
    const header = document.createElement("div");
    header.textContent = person.display_name;
    header.style.fontWeight = "bold";
    header.style.color = getStatusColor(person);
    attachTooltip(header, person);
    return header;
}
function createCollapsible(title, contentHTML) {
    const container = document.createElement("div");
    const header = document.createElement("div");
    header.textContent = "▶ " + title;
    header.style.cursor = "pointer";
    header.style.fontWeight = "bold";
    const content = document.createElement("div");
    content.style.display = "none";
    content.innerHTML = contentHTML;
    header.onclick = () => {
        const isOpen = content.style.display === "block";
        content.style.display = isOpen ? "none" : "block";
        header.textContent = (isOpen ? "▶ " : "▼ ") + title;
    };
    container.appendChild(header);
    container.appendChild(content);
    return container;
}
function dispatch(action, options = {}) {// centralize history handling - push to navigation stack (centralized)
    const { skipHistory = false } = options;
    const MAX_STACK = 75;
    if (
        !skipHistory &&
        state.currentView &&
        state.currentId
    ) {
        state.navigationStack.push(structuredClone(state));
        if (state.navigationStack.length > MAX_STACK) {
            state.navigationStack.shift();
        }
    }
    reducer(state, action);
    renderAll();
}
function reducer(state, action) {
    switch (action.type) {
        case "SELECT_PERSON": {// No clearing union/family group or document unless intentional
            state.currentView = "person";
            state.currentId = action.id;
            state.selectedAncestor = action.id;
            // ✅ Only reset descendantPath if we're actually navigating fresh
            if (state.descendantPath.length === 0 || state.descendantPath[0] !== action.id) {
                state.descendantPath = [state.selectedAncestor];
            }
            return;
        }
        case "SELECT_UNION": {// Doesn't touch descendantPath or selectedAncestor
            state.currentView = "union";
            state.currentId = action.id;
            state.selectedUnion = action.id;
            //state.selectedDocument = null;// May reconsider with a condition?
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
        case "RESET": {
            const root = data.meta.root_person;
            state.ancestorPath = [root];
            state.descendantPath = []; // ✅ keeps UI consistent
            state.navigationStack = []; // 🔥 clean start
            state.selectedAncestor = null;
            state.selectedUnion = null;
            state.selectedDocument = null;
            state.selectedFan = null;
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
function goBack() {//Section D button
    const prev = state.navigationStack.pop();
    if (!prev) return;
    //debugState("BEFORE BACK");
    Object.assign(state, prev);
    normalizeState();
    //debugState("AFTER BACK");
    renderAll();
}
function renderAll() {
    if (!data || !state) {//safety as async function
        console.warn("Render skipped: data/state not ready");
        return;
    }
    updateNonBioButton();
    renderAncestorsGrid();
    renderFamilies();
    renderFamilyDetails();
    renderDocumentPanel();
    renderFanPanel();
    renderNavHistory();
    renderDebugPanel();
}
function renderLinkedEntities(container, options) {
    const {
        title,
        items,
        getLabel,
        onClick
    } = options;
    if (!items || !items.length) return;
    const header = document.createElement("div");
    header.innerHTML = `<br><b>${title}:</b>`;
    container.appendChild(header);
    items.forEach(item => {
        const row = document.createElement("div");
        const label = document.createElement("span");
        label.textContent = getLabel(item);
        const btn = document.createElement("button");
        btn.textContent = "Go";
        btn.onclick = () => onClick(item);
        row.appendChild(label);
        row.appendChild(btn);
        container.appendChild(row);
    });
}
// ============ DEBUGGING ==============
function renderDebugPanel() {
    const dbg = document.getElementById("debugPanel");
    if (!dbg) return;
    dbg.textContent = JSON.stringify({
        currentView: state.currentView,
        currentId: state.currentId,
        selectedAncestor: state.selectedAncestor,
        selectedUnion: state.selectedUnion,
        selectedDocument: state.selectedDocument,
        selectedFan: state.selectedFan,
        ancestorPath: state.ancestorPath,
        descendantPath: state.descendantPath,
        navStack: state.navigationStack.length,
        showNonBiological: state.showNonBiological
    }, null, 2);
}
function debugState(label = "") {
    console.group("STATE DEBUG:", label);
    console.log("currentView:", state.currentView);
    console.log("currentId:", state.currentId);
    console.log("selectedAncestor:", state.selectedAncestor);
    console.log("selectedUnion:", state.selectedUnion);
    console.log("selectedDocument:", state.selectedDocument);
    console.log("selectedFan:", state.selectedFan);
    console.log("ancestorPath:", JSON.stringify(state.ancestorPath));
    console.log("descendantPath:", JSON.stringify(state.descendantPath));
    console.log("navStack length:", state.navigationStack.length);
    console.log("showNonBiological:", state.showNonBiological);
    console.groupEnd();
}
// ============= TOOLTIP LOCIG ===============
const tooltip = document.getElementById("tooltip");
function showTooltip(event, person) {
    tooltip.style.display = "block";
    tooltip.innerHTML = `<b>${person.display_name}</b>`;
    const padding = 10;
    let x = event.pageX + padding;
    let y = event.pageY + padding;
    const tooltipRect = tooltip.getBoundingClientRect();
    const maxX = window.innerWidth - tooltipRect.width - padding;
    const maxY = window.innerHeight - tooltipRect.height - padding;
    if (x > maxX) x = maxX;
    if (y > maxY) y = maxY;
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
}
function hideTooltip() {
    tooltip.style.display = "none";
}
function attachTooltip(el, person) {
    el.onmouseover = (e) => showTooltip(e, person);
    el.onmousemove = (e) => showTooltip(e, person);
    el.onmouseout = hideTooltip;
}
// ============= SEARCHBAR RENDER ======================
function search(query) {
    query = query.toLowerCase();
    return {
        persons: data.persons.filter(p =>
            p.display_name.toLowerCase().includes(query)
        ),
        documents: data.documents.filter(d =>
            d.title.toLowerCase().includes(query)
        )
    };
}
function renderSearchResults(results) {
    const container = document.getElementById("searchResults");
    container.innerHTML = "";
    // Persons
    if (results.persons.length) {
        const header = document.createElement("div");
        header.innerHTML = "<b>People:</b>";
        container.appendChild(header);
        results.persons.forEach(p => {
            const row = document.createElement("div");
            row.textContent = `${p.display_name} (${p.id})`;
            const btn = document.createElement("button");
            btn.textContent = "Go";
            btn.onclick = () => {
                state.ancestorPath = [p.id];
                dispatch({type: "SELECT_PERSON", id: p.id});
                container.innerHTML = "";
            };
            row.appendChild(btn);
            container.appendChild(row);
        });
    }
    // Documents
    if (results.documents.length) {
        const header = document.createElement("div");
        header.innerHTML = "<br><b>Documents:</b>";
        container.appendChild(header);
        results.documents.forEach(d => {
            const row = document.createElement("div");
            row.textContent = d.title;
            const btn = document.createElement("button");
            btn.textContent = "Go";
            btn.onclick = () => {
                dispatch({type: "SELECT_DOCUMENT", id: d.id});
                container.innerHTML = "";
            };
            row.appendChild(btn);
            container.appendChild(row);
        });
    }
}
function updateNonBioButton() {
    const btn = document.getElementById("toggleNonBioBtn");
    btn.textContent = state.showNonBiological
        ? "Hide non-biological parents/children"
        : "Show non-biological parents/children";
    btn.onclick = () => {
        dispatch(
            {type: "TOGGLE_NON_BIO"},
            {skipHistory: true}
        );
    };
}
// ============= RENDER SECTION A (ANCESTOR SELECT) ============
function renderAncestorsGrid() {
    const container = document.getElementById("ancestorGrid");
    //
    container.innerHTML = "";
    state.ancestorPath.forEach((personId, index) => {
        const person = getPerson(data, personId);
        const column = createColumn(index === state.ancestorPath.length - 1);
        const header = createHeader(person);
        header.style.marginBottom = "6px";
        header.style.borderBottom = "1px solid #BBBBBB";
        header.style.paddingBottom = "6px";
        // Select button
        const selectBtn = document.createElement("button");
        selectBtn.textContent = "Select";
        selectBtn.onclick = () => (dispatch({type: "SELECT_PERSON", id: person.id}));
        header.appendChild(selectBtn);
        // highlight lineage
        if (state.ancestorPath.includes(person.id)) {header.style.backgroundColor = "#eef4ff";}
        // highlight active column
        if (index === state.ancestorPath.length - 1) {
            column.style.backgroundColor = "#e6f0ff";
            column.style.border = "2px solid #4a90e2";
        }
        if (person.id === state.selectedAncestor) {header.style.outline = "2px solid #2ecc71";}
        column.appendChild(header);
        // 🔹 Parents
        const parents = sortParents(getParents(person));
        parents.forEach(p => {
            if (!p.id) return;
            const parent = getPerson(data, p.id);
            if (!parent) {
                console.warn("Missing parent:", p.id, "for", personId);
                return;
            }
            const parentDiv = document.createElement("div");
            parentDiv.style.marginTop = "6px";
            parentDiv.style.color = getStatusColor(parent);
            let label = "";
            switch (p.relationship.role) {
                case "biological_father":
                    label = "Father";
                    break;
                case "biological_mother":
                    label = "Mother";
                    break;
                default:
                    label = capitalize(p.subtype);
            }
            const labelSpan = document.createElement("span");
            labelSpan.textContent =`${label}: ${parent.display_name}`;
            parentDiv.appendChild(labelSpan);
            attachTooltip(parentDiv, parent);// tooltip
            // highlight lineage
            if (state.ancestorPath.includes(parent.id)) {parentDiv.style.backgroundColor = "#e4e4ff";}
            // expand button
            const expandBtn = document.createElement("button");
            const isExpanded = state.ancestorPath[index + 1] === parent.id;
            expandBtn.textContent = isExpanded ? "Collapse" : "Expand";
            expandBtn.onclick = () => {toggleAncestor(parent.id, personId);};
            parentDiv.appendChild(expandBtn);
            column.appendChild(parentDiv);
        });
        container.appendChild(column);
    });
}
// ============ RENDER SECTION B (DESCENDANT SELECT) =============
function renderFamilies() {
    const container = document.getElementById("familyGrid");
    if (!state.navigationStack.length) {//THE USE OF navigationStack IN THIS LINE IS NOT A MISTAKE. It's a proxy for "Has the user initiated traversal yet?". Using (!state.selectedAncestor) instead would mean "No ancestor selected" was never displayed, as selectedAncestor is never null.
        container.innerHTML = "No ancestor selected";
        return;
    }
    container.innerHTML = "";
    state.descendantPath.forEach((personId, index) => {
        const person = getPerson(data, personId);
        if (!person) return;
        const column = createColumn(index === state.descendantPath.length - 1);
        const header = createHeader(person);
        column.appendChild(header);
        const unions = getUnionsForPerson(data, personId);
        if (!unions.length) {
            const noUnion = document.createElement("div");
        noUnion.textContent = "(No unions)";
            column.appendChild(noUnion);
            container.appendChild(column);
            return;
        }
        unions.forEach(union => {
            const block = document.createElement("div");
            block.style.marginTop = "8px";
            block.style.borderTop = "1px solid #ccc";
            block.style.paddingTop = "6px";
            // 🔹 Partner label
            const others = getOtherPartners(union, personId)
                .map(pid => getPerson(data, pid)?.display_name || "(unknown)");
            const label = document.createElement("div");
            label.innerHTML = `<b>${person.display_name} + ${others.join(" + ") || "(unknown)"}</b>`;
            block.appendChild(label);
            // 🔹 SHOW BUTTON (fixed now)
            const showBtn = document.createElement("button");
            showBtn.textContent = "Show";
            showBtn.onclick = () => {
                dispatch({ type: "SELECT_UNION", id: union.id }); // temp reuse
            };
            block.appendChild(showBtn);
            // 🔹 Children
            const children = getChildrenForUnion(union);
            if (!children.length) {
                const noKids = document.createElement("div");
                noKids.textContent = "(No children)";
                noKids.style.marginLeft = "10px";
                block.appendChild(noKids);
            }
            children.forEach(child => {
                const childDiv = document.createElement("div");
                childDiv.style.marginLeft = "10px";
                const label = getChildRelationshipLabel(union, child.id);
                childDiv.textContent = child.display_name + label;
                childDiv.style.color = getStatusColor(child);
                // 🔥 FIX: expansion tied to UNION + CHILD combo
                const key = child.id;
                const isExpanded = state.descendantPath.includes(key);
                if (getUnionsForPerson(data, key).length > 0) {
                    const btn = document.createElement("button");
                    btn.textContent = isExpanded ? "Collapse" : "Expand";
                    btn.onclick = () => {
                        toggleDescendant(key, personId);
                    };
                    childDiv.appendChild(btn);
                }
                block.appendChild(childDiv);
            });
            column.appendChild(block);
        });
        container.appendChild(column);
    });
}
// ============ RENDER SECTION C (FAMILY GROUP DETAILS) ===========
function renderFamilyDetails() {
    const container = document.getElementById("familyDetails");//Section C HTML
    if (!state.selectedUnion) {
        container.innerHTML = "No union selected";
        return;
    }
    const union = getSelectedUnion();//transitional
    container.innerHTML = "";
    // 🔹 Parents
    const parents = getPartnerNames(union);
    const parentDiv = document.createElement("div");
    parentDiv.innerHTML = `<b>Parents:</b> ${parents}<br><br>`;
    container.appendChild(parentDiv);
    // 🔹 Children
    const cDiv = document.createElement("div");
    cDiv.innerHTML = `<b>Children:</b><br>`;
    const kids = getChildrenForUnion(union);
    if (!kids.length) {cDiv.innerHTML += "(No children)<br>";}
    container.appendChild(cDiv);
    kids
        .sort((a,b) => a.order - b.order)
        .forEach(child => {
            const c = getPerson(data, child.id);
            const cRow = document.createElement("div");
            const label = getChildRelationshipLabel(union, child.id);
            const cname = c.display_name + label;
            cRow.innerHTML = `${cname}<br>`;
            container.appendChild(cRow);
        });
    // 🔹 Documents
    const docDiv = document.createElement("div");
    const docRefs = union.documents || [];
    const documents = docRefs.map(ref => {
        const id = typeof ref === "string" ? ref : ref.id;
        return data.documents.find(d => d.id === id);
    }).filter(Boolean);
    if (documents.length > 0) {
        docDiv.innerHTML = `<br><b>Documents:</b><br>`;
        container.appendChild(docDiv);
    }
    documents.sort((a, b) => {
        const orderA = docRefs.find(r => (r.id || r) === a.id)?.order || 0;
        const orderB = docRefs.find(r => (r.id || r) === b.id)?.order || 0;
        return orderA - orderB;
    });
    documents.forEach(doc => {
        const row = document.createElement("div");
        const title = document.createElement("span");
        title.textContent = doc.title;
        if (state.selectedDocument === doc.id) {
            row.style.backgroundColor = "#e6f0ff";
            row.style.border = "2px solid #4a90e2";
        }
        const btn = document.createElement("button");
        btn.textContent = "Show Linked";
        btn.onclick = () => dispatch({ type: "SELECT_DOCUMENT", id: doc.id});
        row.appendChild(title);
        row.appendChild(btn);
        container.appendChild(row);
    });
    // 🔹 FAN Club
    const fanRefs = union.fan_club || [];
    if (fanRefs.length) {
        const fanDiv = document.createElement("div");
        fanDiv.innerHTML = `<br><b>FAN Club:</b><br>`;
        container.appendChild(fanDiv);
        const fans = fanRefs.map(ref => {
            const id = typeof ref === "string" ? ref : ref.id;
            return data.fan_entities.find(f => f.id === id);
        }).filter(Boolean);
        fans.sort((a, b) => {
            const orderA = fanRefs.find(r => (r.id || r) === a.id)?.order || 0;
            const orderB = fanRefs.find(r => (r.id || r) === b.id)?.order || 0;
            return orderA - orderB;
        });
        fans.forEach(fan => {
            const row = document.createElement("div");
            if (state.selectedFan === fan.id) {
                row.style.backgroundColor = "#8a6add";
                row.style.border = "2px solid #4a90e2";
            }
            const name = document.createElement("span");
            name.textContent = fan.name;
            const btn = document.createElement("button");
            btn.textContent = "Show Linked";
            btn.onclick = () => dispatch({ type: "SELECT_FAN", id: fan.id });
            row.appendChild(name);
            row.appendChild(btn);
            container.appendChild(row);
        });
    }
    //
    const spaceDiv = document.createElement("div");
    spaceDiv.innerHTML = `<br>`;
    container.appendChild(spaceDiv);
    // 🔹 Notes
    const noteRefs = union.notes || [];
    const notes = noteRefs.map(ref => {
        const id = typeof ref === "string" ? ref : ref.id;
        return data.notes.find(n => n.id === id);
    }).filter(Boolean);
    notes.sort((a, b) => {
        const orderA = noteRefs.find(r => (r.id || r) === a.id)?.order || 0;
        const orderB = noteRefs.find(r => (r.id || r) === b.id)?.order || 0;
        return orderA - orderB;
    });
    const noteHTML = notes.length ? notes.map(n => `- ${n.text}`).join("<br>") : "No notes";
    container.appendChild(createCollapsible("Notes:", noteHTML));
}
// =========== RENDER SECTION D (DOCUMENT) ============
function renderDocumentPanel() {
    const container = document.getElementById("documentPanel");//Section D HTML
    container.innerHTML = "";
    if (!state.selectedDocument) {
        container.textContent = "No document selected";
        return;
    }
    const doc = data.documents.find(d => d.id === state.selectedDocument);
    if (!doc) return;
    // Title
    const titDiv = document.createElement("div");
    titDiv.innerHTML = `<b>Title: </b>${doc.title}<br>`;
    container.appendChild(titDiv);
    if (doc.linked_persons?.length) {
        renderLinkedEntities(container, {
            title: "Linked Persons",
            items: doc.linked_persons,
            getLabel: (pid) => getPerson(data, pid)?.display_name || "Unknown",
            onClick: (pid) => dispatch({type: "SELECT_PERSON", id: pid})
        });
    }
    // Linked unions
    if (doc.linked_unions?.length) {
        renderLinkedEntities(container, {
            title: "Linked Family Groups",
            items: doc.linked_unions,
            getLabel: (fid) => getPartnerNames(getRelationship(data, fid)),
            onClick: (fid) => dispatch({type: "SELECT_UNION", id: fid})
        });
    }
    // Linked FAN club
    if (doc.linked_FAN?.length) {
        renderLinkedEntities(container, {
            title: "Linked FAN",
            items: doc.linked_FAN,
            getLabel: (fid) => getFan(data, fid)?.name || "FAN",
            onClick: (fid) => dispatch({ type: "SELECT_FAN", id: fid })
        });
    }
}
// =========== RENDER SECTION E (FAN CLUB) ============
function renderFanPanel() {
    const container = document.getElementById("fanPanel");
    container.innerHTML = "";
    if (!state.selectedFan) {
        container.textContent = "No FAN entity selected";
        return;
    }
    const fan = data.fan_entities.find(f => f.id === state.selectedFan);
    if (!fan) return;
    // 🔹 Name + type
    const title = document.createElement("div");
    title.innerHTML = `<b>${fan.name}:</b> (${fan.type})<br><br>`;
    container.appendChild(title);
    // 🔹 Notes (if present)
    if (fan.notes) {
        const notes = document.createElement("div");
        notes.innerHTML = `<b>Notes:</b><br>${fan.notes}<br>`;
        container.appendChild(notes);
    }
    // 🔹 Linked persons
    if (fan.linked_persons?.length) {
        renderLinkedEntities(container, {
            title: "Linked Persons",
            items: fan.linked_persons,
            getLabel: (pid) => getPerson(data, pid)?.display_name || "Unknown",
            onClick: (pid) => dispatch({ type: "SELECT_PERSON", id: pid })
        });
    }
    // 🔹 Linked unions
    if (fan.linked_unions?.length) {
        renderLinkedEntities(container, {
            title: "Linked Family Groups",
            items: fan.linked_unions,
            getLabel: (fid) => getPartnerNames(getRelationship(data, fid)),
            onClick: (fid) => dispatch({ type: "SELECT_UNION", id: fid})
        });
    }
    // 🔹 Linked documents
    if (fan.linked_documents?.length) {
        renderLinkedEntities(container, {
            title: "Linked Documents",
            items: fan.linked_documents,
            getLabel: (did) => data.documents.find(d => d.id === did)?.title,
            onClick: (did) => dispatch({ type: "SELECT_DOCUMENT", id: did})
        });
    }
}
// =========== SHOW NAVIGATION STACK ==============
function renderNavHistory() {
    const container = document.getElementById("navHistory");
    container.innerHTML = "";
    const fullHistory = [
        ...state.navigationStack,
        structuredClone(state)
    ].filter(s => s.currentId); // ✅ FILTER OUT BAD STATES
    if (fullHistory.length === 0) {container.textContent = "No navigation history";}
    if (state.navigationStack.length > 0) {//Back/undo button
        const backBtn = document.createElement("button");
        backBtn.textContent = "← Back";
        backBtn.onclick = goBack;
        backBtn.style.marginRight = "10px";
        container.appendChild(backBtn);
    }
    fullHistory.forEach((snap, index) => {
        const label = document.createElement("span");
        label.style.fontWeight = (index === fullHistory.length - 1) ? "bold" : "normal";
        let text = "";
        if (snap.currentView === "person") {
            if (!snap.currentId) return; // skip bad entry
            text = getPerson(data, snap.currentId)?.display_name || "(unknown person)";
        } else if (snap.currentView === "union") {
            const un = getRelationship(data, snap.currentId);
            text = un ? (getPartnerNames(un) || "Union") : "Union";
        } else if (snap.currentView === "document") {
            text = data.documents.find(d => d.id === snap.currentId)?.title || "Document";
        } else if (snap.currentView === "fan") {
            text = getFan(data, snap.currentId)?.name || "FAN";
        }
        label.textContent = text;
        label.style.cursor = "pointer";
        label.style.marginRight = "8px";
        label.style.textDecoration = "underline";
        label.onclick = () => {
            Object.assign(state, structuredClone(snap));
            renderAll();
        };
        container.appendChild(label);
        if (index < fullHistory.length - 1) {
            const arrow = document.createElement("span");
            arrow.textContent = " → ";
            container.appendChild(arrow);
        }
    });
}
// =========== NAVIGATION: GOTO ROOT ==============
function goToRoot() {
    const root = data.meta.root_person;
    dispatch({type: "SELECT_PERSON", id: root});
    state.ancestorPath = [root];
    state.selectedAncestor = root;
    state.descendantPath = [root];
    state.currentId = root;
    renderAncestorsGrid();
}
// ============ INIT ===============
loadData();
document.getElementById("searchBox").addEventListener("input", (e) => {
    const query = e.target.value.trim();
    if (!query) {
        document.getElementById("searchResults").innerHTML = "";
        return;
    }
    const results = search(query);
    renderSearchResults(results);
});
document.getElementById("searchBox").value = "";
document.getElementById("searchResults").innerHTML = "";// Resets search results
