import {renderDebugPanel, renderNavHistory} from "./panels.js";
import {renderAncestorsGrid} from "./sectionA-ancestors.js";
import {renderFamilies} from "./sectionB-families.js";
import {renderFamilyDetails} from "./sectionC-familydetails.js";
import {renderDocumentPanel} from "./sectionD-documents.js";
import {renderFanPanel} from "./sectionE-fan.js";
import {renderPersonDetails} from "./sectionF-persondetails.js";
import {renderEventPanel} from "./sectionG-events.js";
import {renderNotePanel} from "./sectionH-notes.js";
import {dispatch} from "../state/state.js";
export function renderAll(ctx) {
    if (!ctx.data || !ctx.state) {//safety as async function
        console.warn("Render skipped: data/state not ready");
        return;
    }
    updateNonBioButton(ctx);
    renderAncestorsGrid(ctx);
    renderFamilies(ctx);
    renderFamilyDetails(ctx);
    renderDocumentPanel(ctx);
    renderFanPanel(ctx);
    renderPersonDetails(ctx);
    renderEventPanel(ctx);
    renderNavHistory(ctx);
    renderDebugPanel(ctx);
    renderNotePanel(ctx);
}
export function renderSearchResults(ctx, results) {
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
                ctx.state.ancestorPath = [p.id];
                dispatch(ctx, {type: "SELECT_PERSON", id: p.id});
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
                dispatch(ctx, {type: "SELECT_DOCUMENT", id: d.id});
                container.innerHTML = "";
            };
            row.appendChild(btn);
            container.appendChild(row);
        });
    }
    // FAN
    if (results.fan_entities.length) {
        const header = document.createElement("div");
        header.innerHTML = "<br><b>FAN:</b>";
        container.appendChild(header);
        results.fan_entities.forEach(f => {
            const row = document.createElement("div");
            row.textContent = f.name;
            const btn = document.createElement("button");
            btn.textContent = "Go";
            btn.onclick = () => {
                dispatch(ctx, {type: "SELECT_FAN", id: f.id});
                container.innerHTML = "";
            };
            row.appendChild(btn);
            container.appendChild(row);
        });
    }
}
function updateNonBioButton(ctx) {
    const btn = document.getElementById("toggleNonBioBtn");
    btn.textContent = ctx.state.showNonBiological
        ? "Hide non-biological parents/children"
        : "Show non-biological parents/children";
    btn.onclick = () => {dispatch(ctx, {type: "TOGGLE_NON_BIO"}, {skipHistory: true});};
}