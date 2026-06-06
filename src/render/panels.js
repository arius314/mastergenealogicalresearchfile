import {getPerson} from "../helpers/persons.js";
import {getRelationship, getPartnerNames} from "../helpers/relationships.js";
import {getFan} from "../helpers/fan.js";
import {goBack} from "../state/state.js";
// DEBUG PANEL
export function renderDebugPanel(ctx) {
    const dbg = document.getElementById("debugPanel");
    if (!dbg) return;
    dbg.textContent = JSON.stringify({
        currentView: ctx.state.currentView,
        currentId: ctx.state.currentId,
        selectedAncestor: ctx.state.selectedAncestor,
        selectedPerson: ctx.state.selectedPerson,
        selectedUnion: ctx.state.selectedUnion,
        selectedEvent: ctx.state.selectedEvent,
        selectedDocument: ctx.state.selectedDocument,
        selectedFan: ctx.state.selectedFan,
        selectedNote: ctx.state.selectedNote,
        ancestorPath: ctx.state.ancestorPath,
        descendantPath: ctx.state.descendantPath,
        navStack: ctx.state.navigationStack.length,
        showNonBiological: ctx.state.showNonBiological
    }, null, 2);
}
// NAVIGATION STACK
export function renderNavHistory(ctx) {
    const container = document.getElementById("navHistory");
    container.innerHTML = "";
    const fullHistory = [
        ...ctx.state.navigationStack,
        structuredClone(ctx.state)
    ].filter(s => s.currentId); // ✅ FILTER OUT BAD STATES
    if (fullHistory.length === 0) {container.textContent = "No navigation history";}
    if (ctx.state.navigationStack.length > 0) {//Back/undo button
        const backBtn = document.createElement("button");
        backBtn.textContent = "← Back";
        backBtn.onclick = () => goBack(ctx);
        backBtn.style.marginRight = "10px";
        container.appendChild(backBtn);
    }
    fullHistory.forEach((snap, index) => {
        const label = document.createElement("span");
        label.style.fontWeight = (index === fullHistory.length - 1) ? "bold" : "normal";
        let text = "";
        if (snap.currentView === "person") {
            if (!snap.currentId) return; // skip bad entry
            text = getPerson(ctx.indices, snap.currentId)?.display_name || "(unknown person)";
        } else if (snap.currentView === "union") {
            const un = getRelationship(ctx.indices, snap.currentId);
            text = un ? (getPartnerNames(ctx.indices, un) || "Union") : "Union";
        } else if (snap.currentView === "document") {
            text = ctx.indices.documentsById.get(snap.currentId)?.title || "Document";
        } else if (snap.currentView === "fan") {
            text = getFan(ctx.indices, snap.currentId)?.name || "FAN";
        }
        label.textContent = text;
        label.style.cursor = "pointer";
        label.style.marginRight = "8px";
        label.style.textDecoration = "underline";
        label.onclick = () => {
            Object.assign(state, structuredClone(snap));
            renderAll(ctx);
        };
        container.appendChild(label);
        if (index < fullHistory.length - 1) {
            const arrow = document.createElement("span");
            arrow.textContent = " → ";
            container.appendChild(arrow);
        }
    });
}