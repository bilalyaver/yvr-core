interface QueryParams {
    [key: string]: string;
}

interface FilterAndOptions {
    filters: Record<string, any>;
    options: Record<string, any>;
}

function splitFilterAndOptions(queryParams: QueryParams): FilterAndOptions {
    const filters: Record<string, any> = {};
    const options: Record<string, any> = {};

    for (const key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {
            if (key.startsWith('filter.')) {
                const filterKey = key.substring(7); // 'filter.' sonrası kısmı al
                filters[filterKey] = queryParams[key];
            } else if (key.startsWith('option.')) {
                const optionsKey = key.substring(7); // 'option.' sonrası kısmı al
                options[optionsKey] = queryParams[key];
            }
        }
    }

    return { filters, options };
}

export default splitFilterAndOptions;