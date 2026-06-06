// SECTION B - DESCENDANT SELECTION
import {createColumn, createHeader} from "./shared.js";
import {toggleDescendant, getChildRelationshipLabel} from "../graph/graph.js";
import {getPerson, getStatusColor} from "../helpers/persons.js";
import {getUnionsForPerson, getOtherPartners, getChildrenForUnion} from "../helpers/relationships.js";
import {dispatch} from "../state/state.js";
export function renderFamilies(ctx) {
    const container = document.getElementById("familyGrid");
    if (!ctx.state.navigationStack.length) {//THE USE OF navigationStack IN THIS LINE IS NOT A MISTAKE. It's a proxy for "Has the user initiated traversal yet?". Using (!state.selectedAncestor) instead would mean "No ancestor selected" was never displayed, as selectedAncestor is never null.
        container.innerHTML = "No ancestor selected";
        return;
    }
    container.innerHTML = "";
    ctx.state.descendantPath.forEach((personId, index) => {
        const person = getPerson(ctx.indices, personId);
        if (!person) return;
        const column = createColumn(index === ctx.state.descendantPath.length - 1);
        const header = createHeader(person);
        column.appendChild(header);
        const unions = getUnionsForPerson(ctx.indices, personId);
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
                .map(pid => getPerson(ctx.indices, pid)?.display_name || "(unknown)");
            const label = document.createElement("div");
            label.innerHTML = `<b>${person.display_name} + ${others.join(" + ") || "(unknown)"}</b>`;
            block.appendChild(label);
            // 🔹 SHOW BUTTON (fixed now)
            const showBtn = document.createElement("button");
            showBtn.textContent = "Show Family Group Details";
            showBtn.onclick = () => {dispatch(ctx, {type: "SELECT_UNION", id: union.id});}; // temp reuse
            block.appendChild(showBtn);
            // 🔹 Children
            const children = getChildrenForUnion(ctx.indices, union, ctx.state);
            if (!children.length) {
                const noKids = document.createElement("div");
                noKids.textContent = "(No children)";
                noKids.style.marginLeft = "10px";
                block.appendChild(noKids);
            }
            children.forEach(child => {
                const childDiv = document.createElement("div");
                childDiv.style.marginLeft = "10px";
                const label = getChildRelationshipLabel(ctx, union, child.id);
                childDiv.textContent = child.display_name + label;
                childDiv.style.color = getStatusColor(child);
                // GOTO button
                const sBtn = document.createElement("button");
                sBtn.textContent = "D";
                sBtn.onclick = () => {dispatch(ctx, {type: "SELECT_PERSON_FROM_GRAPH", id: child.id});};
                childDiv.appendChild(sBtn);
                // 🔥 FIX: expansion tied to UNION + CHILD combo
                const key = child.id;
                const isExpanded = ctx.state.descendantPath.includes(key);
                if (getUnionsForPerson(ctx.indices, key, ctx.state).length > 0) {
                    const btn = document.createElement("button");
                    btn.textContent = isExpanded ? "C" : "X";
                    btn.onclick = () => {toggleDescendant(ctx, key, personId);};
                    childDiv.appendChild(btn);
                }
                block.appendChild(childDiv);
            });
            column.appendChild(block);
        });
        container.appendChild(column);
    });
}