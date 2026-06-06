import {getRelationship} from "./relationships.js";
export function getPerson(indices, id) {
    return indices.personsById.get(id);
}
export function getParents(indices, state, person) {
    if (!person.parent_child) return [];
    return person.parent_child
        .map(id => getRelationship(indices, id))
        .filter(rel => rel && rel.parent)
        .filter(rel => {
            if (state.showNonBiological) {
                return true;
            }
            return (
                !rel.subtype ||
                rel.subtype === "biological"
            );
        })
        .map(rel => ({
            id: rel.parent,
            subtype: rel.subtype || "biological",
            relationship: rel
        }));
}
export function sortParents(parents) {
    const priority = {
        biological_father: 1,
        biological_mother: 2,
        biological: 3,
        adoptive: 4,
        foster: 5,
        guardian: 6
    };
    return parents.sort((a, b) => {
        const aKey =
            a.relationship.role ||
            a.subtype;
        const bKey =
            b.relationship.role ||
            b.subtype;
        return (priority[aKey] || 99)
                - (priority[bKey] || 99);
    });
}
export function getStatusColor(person) {
    if (!person) return "black"; // 🔥 critical guard
    switch(person.d_status?.state) {
        case "deadend": return "gray";
        case "needmore": return "orange";
        case "complete": return "green";
        default: return "black";
    }
}