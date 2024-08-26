"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function splitFilterAndOptions(queryParams) {
    const filters = {};
    const options = {};
    for (const key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {
            if (key.startsWith('filter.')) {
                const filterKey = key.substring(7); // 'filter.' sonrası kısmı al
                filters[filterKey] = queryParams[key];
            }
            else if (key.startsWith('option.')) {
                const optionsKey = key.substring(7); // 'option.' sonrası kısmı al
                options[optionsKey] = queryParams[key];
            }
        }
    }
    return { filters, options };
}
exports.default = splitFilterAndOptions;
