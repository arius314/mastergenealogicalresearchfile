export function getPerson(data, id) {
    return data.persons.find(p => p.id === id);
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