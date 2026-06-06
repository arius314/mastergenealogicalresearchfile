function showTooltip(event, person) {
    tooltip.style.display = "block";
    tooltip.innerHTML = `<b>${person.display_name}</b>`;
    const padding = 10;
    let x = event.pageX + padding;
    let y = event.pageY + padding;
    const tooltipRect = tooltip.getBoundingClientRect();
    const maxX = window.innerWidth - tooltipRect.width - padding;
    const maxY = window.innerHeight - tooltipRect.height - padding;
    if (x > maxX) x = maxX;
    if (y > maxY) y = maxY;
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
}
function hideTooltip() {
    tooltip.style.display = "none";
}
export function attachTooltip(el, person) {
    el.onmouseover = (e) => showTooltip(e, person);
    el.onmousemove = (e) => showTooltip(e, person);
    el.onmouseout = hideTooltip;
}