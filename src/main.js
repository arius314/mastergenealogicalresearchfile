//================= IMPORTS =============
import {buildIndices} from "./indices/indices.js";
import {normalizeData} from "./normalization/normalization.js";
import {renderAll, renderSearchResults} from "./render/rendering.js";
import {search} from "./search/search.js";
import {initState, initStateButtons} from "./state/state.js";
import {deepValidate} from "./validation/validators.js";
// ================ VARIABLES ===================
let data = null;
let indices = null;
let state = null;
let ctx = null;
const tooltip = document.getElementById("tooltip");
// ============= LOAD =======================
async function loadData() {
    try {
        document.getElementById("loading").style.display = "none";
        const response = await fetch("familydata.json");
        if (!response.ok) throw new Error("Failed to load familydata.json");
        data = await response.json();
        // 🔹 Normalize + validate
        normalizeData(data);
        indices = buildIndices(data);
        const errors = deepValidate(data, indices);
        console.log("VALIDATION RESULTS:");
        errors.forEach(e => console.warn(e));
        if (!errors.length) {console.log("No issues found ✅");}
        // 🔹 Initialize state AFTER data loads
        state = initState(data);
        const ctx = {data, indices, state};
        initStateButtons(ctx);
        // 🔹 First render
        renderAll(ctx); // ✅ ensures nav history is initialized
    } catch (err) {
        console.error("DATA LOAD ERROR:", err);
    }
    if (!data.meta?.root_person) {
        console.error("Missing root_person");
    }
    const rootExists = data.persons.some(p => p.id === data.meta.root_person);
    if (!rootExists) {console.error("Root person not found in persons");}
}
// ============ INIT ===============
loadData();
document.getElementById("searchBox").addEventListener("input", (e) => {
    if (!data && !indices && !state) return;
    const query = e.target.value.trim();
    if (!query) {
        document.getElementById("searchResults").innerHTML = "";
        return;
    }
    const results = search(indices, query);
    renderSearchResults({data, indices, state}, results);
});
document.getElementById("searchBox").value = "";
document.getElementById("searchResults").innerHTML = "";// Resets search results
