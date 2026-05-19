export function getRelationship(data, id) {
    return data.relationships.find(r => r.id === id);
}
export function getUnionsForPerson(data, personId) {
    return data.relationships.filter(r =>
        r.type === "union" && r.partners?.includes(personId)
    );
}