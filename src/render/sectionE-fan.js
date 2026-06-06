import {renderLinkedEntities} from "./shared.js";
import {getPerson} from "../helpers/persons.js";
import {getRelationship, getPartnerNames} from "../helpers/relationships.js";
import {dispatch, isSelected} from "../state/state.js";
import { getEvent } from "../indices/indices.js";
// SECTION E - FAN DETAILS PANEL
export function renderFanPanel(ctx) {
    const container = document.getElementById("fanPanel");
    container.innerHTML = "";
    if (!ctx.state.selectedFan) {
        container.textContent = "No FAN entity selected";
        return;
    }
    const fan = ctx.indices.fanById.get(ctx.state.selectedFan);
    if (!fan) return;
    // 🔹 Name + type
    const title = document.createElement("div");
    title.innerHTML = `<b>${fan.name}</b> (${fan.type})<br><br>`;
    container.appendChild(title);
    // 🔹 Type comments (if present)
    if (fan.type_comments) {
        const comments = document.createElement("div");
        comments.innerHTML = `<b>Comments:</b><br>${fan.type_comments}<br>`;
        container.appendChild(comments);
    }
    // 🔹 Linked persons
    if (fan.linked_persons?.length) {
        renderLinkedEntities(container, {
            title: "Linked Persons",
            items: fan.linked_persons,
            getLabel: (pid) => getPerson(ctx.indices, pid)?.display_name + isSelected(ctx, "person", pid) || "Unknown",
            onClick: (pid) => dispatch(ctx, {type: "SELECT_PERSON_FROM_GRAPH", id: pid})
        });
    }
    // 🔹 Linked unions
    if (fan.linked_unions?.length) {
        renderLinkedEntities(container, {
            title: "Linked Family Groups",
            items: fan.linked_unions,
            getLabel: (fid) => getPartnerNames(ctx.indices, getRelationship(ctx.indices, fid)) + isSelected(ctx, "union", fid),
            onClick: (fid) => dispatch(ctx, {type: "SELECT_UNION", id: fid})
        });
    }
    // 🔹 Linked evnets
    if (fan.linked_events?.length) {
        renderLinkedEntities(container, {
            title: "Linked Events",
            items: fan.linked_events,
            getLabel: (eid) => getEvent(ctx.indices, eid).name + isSelected(ctx, "event", eid),
            onClick: (eid) => dispatch (ctx, {type: "SELECT_EVENT", id: eid})
        });
    }
    // 🔹 Linked documents
    if (fan.linked_documents?.length) {
        renderLinkedEntities(container, {
            title: "Linked Documents",
            items: fan.linked_documents,
            getLabel: (did) => ctx.indices.documentsById.get(did)?.title + isSelected(ctx, "document", did),
            onClick: (did) => dispatch(ctx, {type: "SELECT_DOCUMENT", id: did})
        });
    }
    // 🔹 Linked notes
    if (fan.linked_notes?.length) {
        renderLinkedEntities(container, {
            title: "Linked Notes",
            items: fan.linked_notes,
            getLabel: (nid) => ctx.indices.notesById.get(nid)?.display_name + isSelected(ctx, "note", nid),
            onClick: (nid) => dispatch(ctx, {type: "SELECT_NOTE", id: nid})
        });
    }
}