// SECTION C - FAMILY GROUP DETAILS PANEL
import {getChildRelationshipLabel} from "../graph/graph.js";
import {getPerson} from "../helpers/persons.js";
import {getRelationship, getChildrenForUnion, getPartnerNames} from "../helpers/relationships.js";
import {dispatch, isSelected} from "../state/state.js";
export function renderFamilyDetails(ctx) {
    const container = document.getElementById("familyDetails");//Section C HTML
    if (!ctx.state.selectedUnion) {
        container.innerHTML = "No union selected";
        return;
    }
    const union = getRelationship(ctx.indices, ctx.state.selectedUnion);
    container.innerHTML = "";
    // 🔹 Parents
    const parents = getPartnerNames(ctx.indices, union);
    const parentDiv = document.createElement("div");
    parentDiv.innerHTML = `<b>Parents:</b> ${parents}<br><br>`;
    container.appendChild(parentDiv);
    // 🔹 Children
    const cDiv = document.createElement("div");
    cDiv.innerHTML = `<b>Children:</b><br>`;
    const kids = getChildrenForUnion(ctx.indices, union, ctx.state);
    if (!kids.length) {cDiv.innerHTML += "(No children)<br>";}
    container.appendChild(cDiv);
    kids
        .sort((a,b) => a.order - b.order)
        .forEach(child => {
            const c = getPerson(ctx.indices, child.id);
            const cRow = document.createElement("div");
            const name = document.createElement("span");
            const label = getChildRelationshipLabel(ctx, union, child.id);
            name.textContent = c.display_name + label + isSelected(ctx, "person", child.id);
            const cBtn = document.createElement("button");
            cBtn.textContent = "Go to Linked";
            cBtn.onclick = () => dispatch(ctx, {type: "SELECT_PERSON_FROM_GRAPH", id: child.id});
            cRow.appendChild(name);
            cRow.appendChild(cBtn);
            container.appendChild(cRow);
        });
    // 🔹 Events
    const eveDiv = document.createElement("div");
    const eveRefs = union.events || [];
    const events = eveRefs.map(ref => {
        const id = typeof ref === "string" ? ref : ref.id;
        return ctx.indices.eventsById.get(id);
    }).filter(Boolean);
    if (events.length > 0) {
        eveDiv.innerHTML = '<br><b>Events:</b><br>';
        container.appendChild(eveDiv);
    }
    events.sort((a,b) => {
        const orderA = eveRefs.find(r => (r.id || r) === a.id)?.order || 0;
        const orderB = eveRefs.find(r => (r.id || r) === b.id)?.order || 0;
        return orderA - orderB;
    });
    events.forEach(eve => {
        const row = document.createElement("div");
        const title = document.createElement("span");
        title.textContent = eve.name + isSelected(ctx, "event", eve.id);
        const btn = document.createElement("button");
        btn.textContent = "Go to Linked";
        btn.onclick = () => dispatch(ctx, {type: "SELECT_EVENT", id: eve.id});
        row.appendChild(title);
        row.appendChild(btn);
        container.appendChild(row);
    });
    // 🔹 Documents
    const docDiv = document.createElement("div");
    const docRefs = union.documents || [];
    const documents = docRefs.map(ref => {
        const id = typeof ref === "string" ? ref : ref.id;
        return ctx.indices.documentsById.get(id);
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
        title.textContent = doc.title + isSelected(ctx, "document", doc.id);
        const btn = document.createElement("button");
        btn.textContent = "Go to Linked";
        btn.onclick = () => dispatch(ctx, {type: "SELECT_DOCUMENT", id: doc.id});
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
            return ctx.indices.fanById.get(id);
        }).filter(Boolean);
        fans.sort((a, b) => {
            const orderA = fanRefs.find(r => (r.id || r) === a.id)?.order || 0;
            const orderB = fanRefs.find(r => (r.id || r) === b.id)?.order || 0;
            return orderA - orderB;
        });
        fans.forEach(fan => {
            const row = document.createElement("div");
            const name = document.createElement("span");
            name.textContent = fan.name;
            if (ctx.state.selectedFan === fan.id) {name.textContent += "✅"}
            const btn = document.createElement("button");
            btn.textContent = "Go to Linked";
            btn.onclick = () => dispatch(ctx, {type: "SELECT_FAN", id: fan.id});
            row.appendChild(name);
            row.appendChild(btn);
            container.appendChild(row);
        });
    }
     // 🔹 Notes
    const noteRefs = union.notes || [];
    if (noteRefs.length) {
        const notes = noteRefs.map(ref => {
            const id = typeof ref === "string" ? ref : ref.id;
            return ctx.indices.notesById.get(id);
        }).filter(Boolean);
        notes.sort((a, b) => {
            const orderA = noteRefs.find(r => (r.id || r) === a.id)?.order || 0;
            const orderB = noteRefs.find(r => (r.id || r) === b.id)?.order || 0;
            return orderA - orderB;
        });
        const notesDiv = document.createElement("div");
            notesDiv.innerHTML = `<br><b>Notes:</b><br>`;
            container.appendChild(notesDiv);
        notes.forEach(note => {
            const row = document.createElement("div");
            const name = document.createElement("span");
            name.textContent = note.display_name;
            if (ctx.state.selectedNote === note.id) {name.textContent += "✅"}
            const btn = document.createElement("button");
            btn.textContent = "Go to Linked";
            btn.onclick = () => dispatch(ctx, {type: "SELECT_NOTE", id: note.id});
            row.appendChild(name);
            row.appendChild(btn);
            container.appendChild(row);
        });
    }
}