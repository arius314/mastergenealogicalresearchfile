import {getFan} from "../helpers/fan.js";
import {getPerson} from "../helpers/persons.js";
import {getRelationship, getPartnerNames} from "../helpers/relationships.js";
import {getDocument, getEvent} from "../indices/indices.js";
import {dispatch, isSelected} from "../state/state.js";
import {renderLinkedEntities} from "./shared.js";

// SECTION H - NOTE DETAILS PANEL
export function renderNotePanel(ctx) {
    const container = document.getElementById("notePanel");
    container.innerHTML = "";
    if (!ctx.state.selectedNote) {
        container.textContent = "No note selected";
        return;
    }
    const nt = ctx.indices.notesById.get(ctx.state.selectedNote);
    if (!nt) return;
    // 🔹 Content
    const title = document.createElement("div");
    title.innerHTML = `<b>Note: </b> ${nt.display_name}<br>`;
    container.appendChild(title);
    if (nt.text) {
        const txt = document.createElement("div");
        txt.innerHTML = `<br>${nt.text}`;
        container.appendChild(txt);
    }
    // 🔹 Linked persons
    if (nt.linked_persons?.length) {
        renderLinkedEntities(container, {
            title: "Linked Persons",
            items: nt.linked_persons,
            getLabel: (pid) => getPerson(ctx.indices, pid)?.display_name + isSelected(ctx, "person", pid) || "Unknown",
            onClick: (pid) => dispatch(ctx, {type: "SELECT_PERSON_FROM_GRAPH", id: pid})
        });
    }
    // 🔹 Linked unions
    if (nt.linked_unions?.length) {
        renderLinkedEntities(container, {
            title: "Linked Family Groups",
            items: nt.linked_unions,
            getLabel: (uid) => getPartnerNames(ctx.indices, getRelationship(ctx.indices, uid)) + isSelected(ctx, "union", uid),
            onClick: (uid) => dispatch(ctx, {type: "SELECT_UNION", id: uid})
        });
    }
    // 🔹 Linked events
    if (nt.linked_events?.length) {
        renderLinkedEntities(container, {
            title: "Linked Events",
            items: nt.linked_events,
            getLabel: (eid) => getEvent(ctx.indices, eid)?.name + isSelected(ctx, "event", eid),
            onClick: (eid) => dispatch(ctx, {type: "SELECT_EVENT", id: eid})
        });
    }
    // 🔹 Linked FAN
    if (nt.linked_fan?.length) {
        renderLinkedEntities(container, {
            title: "Linked FAN",
            items: nt.linked_fan,
            getLabel: (fid) => getFan(ctx.indices, fid)?.name + isSelected (ctx, "fan", fid),
            onClick: (fid) => dispatch(ctx, {type: "SELECT_FAN", id: fid})
        });
    }
    // 🔹 Linked documents
    if (nt.linked_documents?.length) {
        renderLinkedEntities(container, {
            title: "Linked Documents",
            items: nt.linked_documents,
            getLabel: (did) => getDocument(ctx.indices, did)?.title + isSelected(ctx, "document", did),
            onClick: (did) => dispatch(ctx, {type: "SELECT_DOCUMENT", id: did})
        });
    }
}