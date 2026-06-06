export function buildIndices(data) {
    const indices = {
        // ENTITY LOOKUPS
        meta: {rootPersonId: data.meta.root_person},
        personsById: new Map(),
        relationshipsById: new Map(),
        eventsById: new Map(),
        documentsById: new Map(),
        fanById: new Map(),
        notesById: new Map(),
        // GRAPH INDICES
        unionsByPersonId: new Map(),
        parentChildByChildId: new Map(),
        parentChildByParentId: new Map(),
        childrenByUnionId: new Map(),
        // RESEARCH PROGRESS INDICES
        personsByDstatus: {
            complete: new Map(),
            needmore: new Map(),
            deadend: new Map(),
            unknown: new Map()
        }
    };
    // =========================
    // ENTITY LOOKUPS
    // =========================
    data.persons.forEach(person => {indices.personsById.set(person.id, person);});
    data.relationships.forEach(rel => {indices.relationshipsById.set(rel.id, rel);});
    data.events.forEach(event => {indices.eventsById.set(event.id, event);});
    data.documents.forEach(document => {indices.documentsById.set(document.id, document);});
    data.fan_entities.forEach(fan => {indices.fanById.set(fan.id, fan);});
    data.notes.forEach(nt => {indices.notesById.set(nt.id, nt);});
    // =========================
    // GRAPH INDICES
    // =========================
    data.relationships.forEach(rel => {
        // UNIONS BY PERSON
        if (rel.type === "union") {
            rel.partners?.forEach(pid => {
                if (!indices.unionsByPersonId.has(pid)) {
                    indices.unionsByPersonId.set(pid, []);
                }
                indices.unionsByPersonId.get(pid).push(rel);
            });
            // CHILDREN BY UNION
            rel.children?.forEach(child => {
                if (!indices.childrenByUnionId.has(rel.id)) {
                    indices.childrenByUnionId.set(rel.id, []);
                }
                indices.childrenByUnionId.get(rel.id).push(child);
            });
        }
        // PARENT-CHILD INDEXES
        if (rel.type === "parent_child") {
            // CHILD -> RELATIONSHIPS
            if (!indices.parentChildByChildId.has(rel.child)) {
                indices.parentChildByChildId.set(rel.child, []);
            }
            indices.parentChildByChildId.get(rel.child).push(rel);
            // PARENT -> RELATIONSHIPS
            if (!indices.parentChildByParentId.has(rel.parent)) {
                indices.parentChildByParentId.set(rel.parent, []);
            }
            indices.parentChildByParentId.get(rel.parent).push(rel);
        }
    });
    // =========================
    // ENTITY LOOKUPS
    // =========================
    // PERSONS BY D_STATUS
    data.persons.filter(r => r.d_status.state === "complete").forEach(person => {indices.personsByDstatus.complete.set(person.id, person);});
    data.persons.filter(r => r.d_status.state === "needmore").forEach(person => {indices.personsByDstatus.needmore.set(person.id, person);});
    data.persons.filter(r => r.d_status.state === "deadend").forEach(person => {indices.personsByDstatus.deadend.set(person.id, person);});
    data.persons.filter(r => r.d_status.state === "unknown").forEach(person => {indices.personsByDstatus.unknown.set(person.id, person);});
    return indices;
}
export function getDocument(indices, id) {
    return indices.documentsById.get(id);
}
export function getEvent(indices, id) {
    return indices.eventsById.get(id);
}
export function getNote(indices, id) {
    return indices.notesById.get(id);
}