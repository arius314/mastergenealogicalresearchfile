// ============= SEARCHBAR RENDER ======================
export function search(indices, query) {
    query = query.toLowerCase();
    return {
        persons: [...indices.personsById.values()]
            .filter(p => p.display_name?.toLowerCase().includes(query)),
        documents: [...indices.documentsById.values()]
            .filter(d => d.title?.toLowerCase().includes(query)),
        fan_entities: [...indices.fanById.values()]
            .filter(f => f.name?.toLowerCase().includes(query))
    };
}