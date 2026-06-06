function validatePersons(data) {
    const errors = [];
    const seenIds = new Set();
    data.persons.forEach(person => {
        // REQUIRED ID
        if (!person.id) {
            errors.push("Person missing ID");
            return;
        }
        // DUPLICATE IDS
        if (seenIds.has(person.id)) {
            errors.push(`Duplicate person ID ${person.id}`);
        }
        seenIds.add(person.id);
        // REQUIRED DISPLAY NAME
        if (!person.display_name) {
            errors.push(`Person ${person.id} missing display_name`);
        }
        // names MUST BE ARRAY
        if (person.names && !Array.isArray(person.names)) {
            errors.push(`Person ${person.id} names is not an array`);
        }
        // parent_child MUST BE ARRAY
        if (person.parent_child && !Array.isArray(person.parent_child)) {
            errors.push(`Person ${person.id} parent_child is not an array`);
        }
        // union MUST BE ARRAY
        if (person.union && !Array.isArray(person.union)) {
            errors.push(`Person ${person.id} union is not an array`);
        }
        // VALID SEX VALUES
        const validSexes = ["M", "F","U"];
        if (!person.sex) {errors.push(`Person ${person.id} has no sex`);}
        if (person.sex && !validSexes.includes(person.sex)) {errors.push(`Person ${person.id} invalid sex ${person.sex}`);}
        // VALID d_status VALUES
        const validDstatus = ["complete", "needmore", "deadend", "unknown"];
        if (!person.d_status?.state) {errors.push(`Person ${person.id} has no d_status`);}
        if (person.d_status?.state && !validDstatus.includes(person.d_status.state)) {errors.push(`Person ${person.id} has invalid d_status ${person.d_status.state}`);}
    });
    return errors;
}
function validateRelationships(data, indices) {
    const errors = [];
    const validTypes = ["union","parent_child"];
    indices.relationshipsById.forEach(rel => {
        if (!rel.id) {
            errors.push("Relationship missing ID");
        }
        if (!rel.type) {
            errors.push(`Relationship ${rel.id} missing type`);
        }
        if (rel.type && !validTypes.includes(rel.type)) {
            errors.push(`Relationship ${rel.id} invalid type ${rel.type}`);
        }
    });
    return errors;
}
function validateUnions(data, indices) {
    const errors = [];
    indices.relationshipsById.forEach(rel => {
        if (rel.type !== "union") return;
        if (!rel.partners || rel.partners.length < 1) {
            errors.push(`Union ${rel.id} has no partners`);
        }
        rel.partners?.forEach(pid => {
            const exists = indices.personsById.has(pid);
            if (!exists) {
                errors.push(`Union ${rel.id} missing partner ${pid}`);
            }
        });
    });
    return errors;
}
function validateParentChild(data, indices) {
    const errors = [];
    indices.personsById.forEach(person => {
        if (!person.parent_child) return;
        person.parent_child.forEach(relId => {
            const rel = indices.relationshipsById.get(relId);
            if (!rel) {
                errors.push(
                    `Person ${person.id} references missing relationship ${relId}`
                );
                return;
            }
            if (rel.type !== "parent_child") {
                errors.push(
                    `Relationship ${relId} is not parent_child`
                );
            }
            if (rel.child !== person.id) {
                errors.push(
                    `Relationship ${relId} child mismatch for person ${person.id}`
                );
            }
        });
    });
    return errors;
}
function validateDocuments(data) {
    const errors = [];
    const seenIds = new Set();
    data.documents.forEach(document => {
        // REQUIRED ID
        if (!document.id) {
            errors.push("Document missing ID");
            return;
        }
        // DUPLICATE IDS
        if (seenIds.has(document.id)) {errors.push(`Duplicate document ID ${document.id}`);}
        seenIds.add(document.id);
        // REQUIRED TITLE
        if (!document.title) {errors.push(`Document ${document.id} missing title`);}
        // REQUIRED DESCRIPTION
        if (!document.description) {errors.push(`Document ${document.id} missing description`);}
    })
    return errors;
}
function validateEvents(data) {
    const errors = [];
    const seenIds = new Set();
    data.events.forEach(event => {
        //REQUIRED ID
        if (!event.id) {
            errors.push("Document missing ID");
            return;
        }
        // DUPLICATE IDS
        if (seenIds.has(event.id)) {errors.push(`Duplicate document ID ${event.id}`);}
        seenIds.add(event.id);
        // REQUIRED DESCRIPTION
        if (!event.name) {errors.push(`Document ${event.id} missing name`);}
    })
    return errors;
}
function validateFans(data) {
    const errors = [];
    const seenIds = new Set();
    data.fan_entities.forEach(fan => {
        // REQUIRED ID
        if (!fan.id) {
            errors.push("FAN entity missing ID");
            return;
        }
        // DUPLICATE IDS
        if (seenIds.has(fan.id)) {errors.push(`Duplicate FAN ID ${fan.id}`);}
        seenIds.add(fan.id);
        // REQUIRED NAME
        if (!fan.name) {errors.push(`FAN ${fan.id} missing name`);}
    })
    return errors;
}
function validateNotes(data) {
    const errors = [];
    const seenIds = new Set();
    data.notes.forEach(note => {
        // REQUIRED ID
        if (!note.id) {
            errors.push("Note missind ID");
            return;
        }
        // DUPLICATE IDS
        if (seenIds.has(note.id)) {errors.push(`Duplicate note ID ${note.id}`);}
        seenIds.add(note.id);
        // Required text
        if (!note.text) {errors.push(`Note ${note.id} missing text`);}
    })
    return errors;
}
export function deepValidate(data, indices) {
    return [
        ...validatePersons(data),
        ...validateRelationships(data, indices),
        ...validateUnions(data, indices),
        ...validateParentChild(data, indices),
        ...validateEvents(data),
        ...validateDocuments(data),
        ...validateFans(data),
        ...validateNotes(data)
    ];
}