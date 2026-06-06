export function normalizeData(data) {
    // Fix persons
    data.persons.forEach(p => {
        if (!p.unions) p.unions = [];
        if (!p.fan_club) p.fan_club = [];
        if (!p.documents) p.documents = [];
    });
}
export function normalizeState(state) {
    // 🔹 Fix descendant path
    if (state.currentView === "person") {
        state.descendantPath = state.selectedAncestor
            ? [state.selectedAncestor]
            : [];
    }
    // 🔹 Safety: ensure ancestor path always contains selectedAncestor
    if (state.selectedAncestor && !state.ancestorPath.includes(state.selectedAncestor)) {
        state.ancestorPath = [state.selectedAncestor];
    }
}