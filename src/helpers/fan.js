export function getFan(data, id) {
    return data.fan_entities.find(f => f.id === id);
}