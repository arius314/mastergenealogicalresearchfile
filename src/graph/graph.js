import {capitalize} from "../helpers/formatting.js";
import {getRelationship} from "../helpers/relationships.js";
import {renderAll} from "../render/rendering.js";
import {renderAncestorsGrid} from "../render/sectionA-ancestors.js";
import {dispatch} from "../state/state.js";
export function toggleAncestor(ctx, id, fromId) {
    const path = ctx.state.ancestorPath;
    const existingIndex = path.indexOf(id);
    if (existingIndex !== -1) {
        // collapse
        ctx.state.ancestorPath = path.slice(0, existingIndex);
    } else {
        const baseIndex = path.indexOf(fromId);
        if (baseIndex === -1) {
            console.warn("Invalid fromId in toggleAncestor:", fromId);
            return; // 🔥 STOP instead of corrupting path
        }
        ctx.state.ancestorPath = path.slice(0, baseIndex + 1);
        ctx.state.ancestorPath.push(id);
    }
    renderAll(ctx);
}
export function toggleDescendant(ctx, id, fromId) {
    const path = ctx.state.descendantPath;
    const existingIndex = path.indexOf(id);
    if (existingIndex !== -1) {
        // collapse
        ctx.state.descendantPath = path.slice(0, existingIndex);
    } else {
        const baseIndex = path.indexOf(fromId);
        if (baseIndex === -1) {
            console.warn("Invalid fromId in toggleAncestor:", fromId);
            return; // 🔥 STOP instead of corrupting path
        }
        ctx.state.descendantPath = path.slice(0, baseIndex + 1);
        ctx.state.descendantPath.push(id);
    }
    renderAll(ctx);
}
function getParentChildRelationshipsForUnionChild(indices, union, childId) {
    const entry = union.children?.find(c => c.id === childId);
    if (!entry || !entry.parent_child) return [];
    return entry.parent_child.map(id => getRelationship(indices, id)).filter(Boolean);
}
export function getChildRelationshipLabel(ctx, union, childId) {
    const rels = getParentChildRelationshipsForUnionChild(ctx.indices, union, childId);
    if (rels.length === 0) return "";
    // hide labels for biological
    const nonBiological = rels.filter(r =>
        r.subtype && r.subtype !== "biological"
    );
    if (nonBiological.length === 0) {
        return "";
    }
    // deduplicate labels
    const labels = [...new Set(
        nonBiological.map(r =>
            capitalize(r.subtype)
        )
    )];
    return ` (${labels.join(", ")})`;
}
export function goToRoot(ctx) {
    const root = ctx.data.meta.root_person;
    dispatch(ctx, {type: "SELECT_PERSON", id: root});
    ctx.state.ancestorPath = [root];
    ctx.state.selectedAncestor = root;
    ctx.state.descendantPath = [root];
    ctx.state.currentId = root;
    renderAncestorsGrid(ctx);
}