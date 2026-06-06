import {getPerson} from "./persons.js";

export function getRelationship(indices, id) {
    return indices.relationshipsById.get(id);
}
export function getUnionsForPerson(indices, personId) {
    return indices.unionsByPersonId.get(personId) || [];
}
export function getChildrenForUnion(indices, union, state) {
    const children = indices.childrenByUnionId.get(union.id) || [];
    return children
        .filter(entry => {
            if (state.showNonBiological) {return true;}
            if (!entry.parent_child?.length) {return true;}
            const rels = entry.parent_child
                .map(id => indices.relationshipsById.get(id))
                .filter(Boolean);
            return rels.some(rel => !rel.subtype || rel.subtype === "biological");
        })
        .sort((a, b) => a.order - b.order)
        .map(entry => indices.personsById.get(entry.id))
        .filter(Boolean);
}
export function getOtherPartners(union, personId) {
    return union.partners.filter(p => p !== personId);
}
export function getPartnerNames(indices, union) {
    if (!union.partners || union.partners.length === 0) {
        return "(parents unknown)";
    }
    return union.partners
        .map(id => {
            const p = getPerson(indices, id);
            return p ? p.display_name : "(unknown)";
        })
        .join(" + ");
}