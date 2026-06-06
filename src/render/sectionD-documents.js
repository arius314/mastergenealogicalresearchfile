// SECTION D - DOCUMENT DETAILS PANEL
import {renderLinkedEntities} from "./shared.js";
import {getFan} from "../helpers/fan.js";
import {getPerson} from "../helpers/persons.js";
import {getRelationship, getPartnerNames} from "../helpers/relationships.js";
import {dispatch, isSelected} from "../state/state.js";
import {getEvent} from "../indices/indices.js";
export function renderDocumentPanel(ctx) {
    const container = document.getElementById("documentPanel");//Section D HTML
    container.innerHTML = "";
    if (!ctx.state.selectedDocument) {
        container.textContent = "No document selected";
        return;
    }
    const doc = ctx.indices.documentsById.get(ctx.state.selectedDocument);
    if (!doc) return;
    // Title
    const titDiv = document.createElement("div");
    titDiv.innerHTML = `<b>Title: </b>${doc.title}<br>`;
    container.appendChild(titDiv);
    // Linked persons
    if (doc.linked_persons?.length) {
        renderLinkedEntities(container, {
            title: "Linked Persons",
            items: doc.linked_persons,
            getLabel: (pid) => getPerson(ctx.indices, pid)?.display_name + isSelected(ctx, "person", pid) || "Unknown",
            onClick: (pid) => dispatch(ctx, {type: "SELECT_PERSON_FROM_GRAPH", id: pid})
        });
    }
    // Linked unions
    if (doc.linked_unions?.length) {
        renderLinkedEntities(container, {
            title: "Linked Family Groups",
            items: doc.linked_unions,
            getLabel: (fid) => getPartnerNames(ctx.indices, getRelationship(ctx.indices, fid)) + isSelected(ctx, "union", fid),
            onClick: (fid) => dispatch(ctx, {type: "SELECT_UNION", id: fid})
        });
    }
    // Linked events
    if (doc.linked_events?.length) {
        renderLinkedEntities(container, {
            title: "Linked Events",
            items: doc.linked_events,
            getLabel: (eid) => getEvent(ctx.indices, eid).name + isSelected(ctx, "event", eid),
            onClick: (eid) => dispatch(ctx, {type: "SELECT_EVENT", id: eid})
        });
    }
    // Linked FAN club
    if (doc.linked_fan?.length) {
        renderLinkedEntities(container, {
            title: "Linked FAN",
            items: doc.linked_fan,
            getLabel: (fid) => getFan(ctx.indices, fid).name + isSelected(ctx, "fan", fid),
            onClick: (fid) => dispatch(ctx, {type: "SELECT_FAN", id: fid})
        });
    }
    // Linked notes
    if (doc.linked_notes?.length) {
        renderLinkedEntities(container, {
            title: "Linked Notes",
            items: doc.linked_notes,
            getLabel: (nid) => getNote(ctx.indices, nid).display_name + isSelected(ctx, "note", nid),
            onClick: (nid) => dispatch(ctx, {type: "SELECT_NOTE", id: nid})
        });
    }
}