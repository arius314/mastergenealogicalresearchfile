// SECTION A - ANCESTOR SELECTION
import {createColumn, createHeader} from "./shared.js";
import {toggleAncestor} from "../graph/graph.js";
import {getPerson, getParents, sortParents, getStatusColor} from "../helpers/persons.js";
import {capitalize} from "../helpers/formatting.js";
import {dispatch} from "../state/state.js";
import {attachTooltip} from "../ui/tooltip.js";
export function renderAncestorsGrid(ctx) {
    const container = document.getElementById("ancestorGrid");
    //
    container.innerHTML = "";
    ctx.state.ancestorPath.forEach((personId, index) => {
        const person = getPerson(ctx.indices, personId);
        const column = createColumn(index === ctx.state.ancestorPath.length - 1);
        const header = createHeader(person);
        header.style.marginBottom = "6px";
        header.style.borderBottom = "1px solid #BBBBBB";
        header.style.paddingBottom = "6px";
        // Select button
        const selectBtn = document.createElement("button");
        selectBtn.textContent = "Select";
        selectBtn.onclick = () => (dispatch(ctx, {type: "SELECT_PERSON", id: person.id}));
        header.appendChild(selectBtn);
        // highlight lineage
        if (ctx.state.ancestorPath.includes(person.id)) {header.style.backgroundColor = "#eef4ff";}
        // highlight active column
        if (index === ctx.state.ancestorPath.length - 1) {
            column.style.backgroundColor = "#e6f0ff";
            column.style.border = "2px solid #4a90e2";
        }
        if (person.id === ctx.state.selectedAncestor) {header.style.outline = "2px solid #2ecc71";}
        column.appendChild(header);
        // 🔹 Parents
        const parents = sortParents(getParents(ctx.indices, ctx.state, person));
        parents.forEach(p => {
            if (!p.id) return;
            const parent = getPerson(ctx.indices, p.id);
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
            if (ctx.state.ancestorPath.includes(parent.id)) {parentDiv.style.backgroundColor = "#e4e4ff";}
            // expand button
            const expandBtn = document.createElement("button");
            const isExpanded = ctx.state.ancestorPath[index + 1] === parent.id;
            expandBtn.textContent = isExpanded ? "Collapse" : "Expand";
            expandBtn.onclick = () => {toggleAncestor(ctx, parent.id, personId);};
            parentDiv.appendChild(expandBtn);
            column.appendChild(parentDiv);
        });
        container.appendChild(column);
    });
}