// SECTION F - PERSON DETAILS PANEL
import {getPerson} from "../helpers/persons.js";
import {getPartnerNames, getRelationship, getUnionsForPerson} from "../helpers/relationships.js";
import {dispatch, isSelected} from "../state/state.js";
export function renderPersonDetails(ctx) {
    const container = document.getElementById("personDetails");//section F HTML
    if (!ctx.state.selectedPerson) {
        container.innerHTML = "No person selected";
        return;
    }
    const subject = getPerson(ctx.indices, ctx.state.selectedPerson);
    container.innerHTML = "";
    // 🔹 Person
    const subjectDiv = document.createElement("div");
    subjectDiv.innerHTML = `<b>Individual:</b> ${subject.display_name}`;
    const subjBtn = document.createElement("button")
    subjBtn.textContent = "Set as Temporary Root";
    subjBtn.onclick = () => dispatch(ctx, {type: "SELECT_ANCESTOR", id: subject.id});
    subjectDiv.appendChild(subjBtn);
    container.appendChild(subjectDiv);
    // 🔹 Unions
    const uDiv = document.createElement("div");
    uDiv.innerHTML = `<br><b>Relationships:</b><br>`
    const rels = getUnionsForPerson(ctx.indices, ctx.state.selectedPerson);
    if (!rels.length) {uDiv.innerHTML += `(No relationships)<br>`;}
    container.appendChild(uDiv);
    rels
        .sort((a,b) => a.order - b.order)
        .forEach(rel => {
            const row = document.createElement("div");
            const partners = getPartnerNames(ctx.indices, rel);
            const nom = document.createElement("span");
            nom.textContent = partners + isSelected(ctx, "union", rel.id);
            const btn = document.createElement("button");
            btn.textContent = "Go to Linked";
            btn.onclick = () => dispatch(ctx, {type: "SELECT_UNION", id: rel.id});
            row.appendChild(nom);
            row.appendChild(btn);
            container.appendChild(row);
        });
    // 🔹 Events
    const eveDiv = document.createElement("div");
    const eveRefs = subject.events || [];
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
    })
    // 🔹 Documents
    const docDiv = document.createElement("div");
    const docRefs = subject.documents || [];
    const documents = docRefs.map(ref => {
        const id = typeof ref === "string" ? ref : ref.id;
        return ctx.indices.documentsById.get(id);
    }).filter(Boolean);
    if (documents.length > 0) {
        docDiv.innerHTML = `<br><b>Documents:</b><br>`;
        container.appendChild(docDiv);
    }
    documents.sort((a,b) => {
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
    // 🔹 FAN
    const fanRefs = subject.fan_club || [];
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
            name.textContent = fan.name + isSelected(ctx, "fan", fan.id);
            const btn = document.createElement("button");
            btn.textContent = "Go to Linked";
            btn.onclick = () => dispatch(ctx, {type: "SELECT_FAN", id: fan.id});
            row.appendChild(name);
            row.appendChild(btn);
            container.appendChild(row);
        });
    }
    // 🔹 Notes
    const noteRefs = subject.notes || [];
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