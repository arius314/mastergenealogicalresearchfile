import {getStatusColor} from "../helpers/persons.js";
import {attachTooltip} from "../ui/tooltip.js";
export function createHeader(person) {
    const header = document.createElement("div");
    header.textContent = person.display_name;
    header.style.fontWeight = "bold";
    header.style.color = getStatusColor(person);
    attachTooltip(header, person);
    return header;
}
export function createColumn(isActive) {
    const col = document.createElement("div");
    col.className = "column";
    if (isActive) {
        col.style.backgroundColor = "#e6f0ff";
        col.style.border = "2px solid #4a90e2";
    }
    return col;
}
export function renderLinkedEntities(container, options) {
    const {
        title,
        items,
        getLabel,
        onClick
    } = options;
    if (!items || !items.length) return;
    const header = document.createElement("div");
    header.innerHTML = `<br><b>${title}:</b>`;
    container.appendChild(header);
    items.forEach(item => {
        const row = document.createElement("div");
        const label = document.createElement("span");
        label.textContent = getLabel(item);
        const btn = document.createElement("button");
        btn.textContent = "Go";
        btn.onclick = () => onClick(item);
        row.appendChild(label);
        row.appendChild(btn);
        container.appendChild(row);
    });
}