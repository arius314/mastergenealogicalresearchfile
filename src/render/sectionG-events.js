import {renderLinkedEntities} from "./shared.js";
import {getPerson} from "../helpers/persons.js";
import {getRelationship, getPartnerNames} from "../helpers/relationships.js";
import {isSelected, dispatch} from "../state/state.js";
// SECTION G - EVENT DETAILS PAGE
export function renderEventPanel(ctx) {
    const container = document.getElementById("eventPanel");
    container.innerHTML = "";
    if (!ctx.state.selectedEvent) {
        container.textContent = "No event selected";
        return;
    }
    const eve = ctx.indices.eventsById.get(ctx.state.selectedEvent);
    if (!eve) return;
    // 🔹 What Event Was
    const title = document.createElement("div");
    title.innerHTML = `<b>${eve.name}</b><br>`;
    container.appendChild(title)
    if (eve.description) {
        const descDiv = document.createElement("div");
        descDiv.innerHTML = `<b>Description:</b> ${eve.description}<br>`;
        container.appendChild(descDiv);
    }
    // 🔹 Linked persons
    if (eve.linked_persons?.length) {
        renderLinkedEntities(container, {
            title: "Linked Persons",
            items: eve.linked_persons,
            getLabel: (pid) => getPerson(ctx.indices, pid)?.display_name + isSelected(ctx, "person", pid) || "Unknown",
            onClick: (pid) => dispatch(ctx, {type: "SELECT_PERSON_FROM_GRAPH", id: pid})
        });
    }
    // 🔹 Linked unions
    if (eve.linked_unions?.length) {
        renderLinkedEntities(container, {
            title: "Linked Family Groups",
            items: eve.linked_unions,
            getLabel: (uid) => getPartnerNames(ctx.indices, getRelationship(ctx.indices, uid)) + isSelected(ctx, "union", uid),
            onClick: (uid) => dispatch(ctx, {type: "SELECT_UNION", id: uid})
        });
    }
    // 🔹 Linked documents
    if (eve.linked_documents?.length) {
        renderLinkedEntities(container, {
            title: "Linked Documents",
            items: eve.linked_documents,
            getLabel: (did) => ctx.indices.documentsById.get(did)?.title + isSelected(ctx, "document", did),
            onClick: (did) => dispatch(ctx, {type: "SELECT_DOCUMENT", id: did})
        });
    }
    // 🔹 Linked FAN
    if (eve.linked_fan?.length) {
        renderLinkedEntities(container, {
            title: "Linked FAN",
            items: eve.linked_fan,
            getLabel: (fid) => ctx.indices.fanById.get(fid)?.title + isSelected(ctx, "document", fid),
            onClick: (fid) => dispatch(ctx, {type: "SELECT_FAN", id: fid})
        });
    }
    // 🔹 Linked notes*/
    if (eve.linked_notes?.length) {
        renderLinkedEntities(container, {
            title: "Linked Notes",
            items: eve.linked_notes,
            getLabel: (nid) => ctx.indices.notesById.get(nid)?.display_name + isSelected(ctx, "note", nid),
            onClick: (nid) => dispatch(ctx, {type: "SELECT_NOTE", id: nid})
        });
    }
}