// Application locations and protocols are data. Hosts resolve/override URLs and launch apps.
const dpaint = {
    application: 'dpaint.js', name: 'DPaint.js', url: 'https://www.stef.be/dpaint/',
    types: ['DPAINT', 'PNG', 'JPG', 'GIF', 'WEBP', 'BMP', 'PSD', 'IFF', 'ILBM', 'ANIM', 'ICON', 'PCX'],
    actions: ['view', 'edit'],
    transport: {
        kind: 'iframe',
        input: { kind: 'url', parameter: 'file', method: 'GET', filenameInUrl: true },
        output: { kind: 'url', parameter: 'putback', method: 'PUT', format: 'PNG', mime: 'image/png', preservesDocument: false },
    },
};
const documents = {
    application: 'documents', name: 'Documents', url: 'https://os5.app/editor/documents/',
    types: ['DOCX'], actions: ['edit'],
    transport: {
        kind: 'postMessage', protocol: 'web-file-handler-v1', module: 'https://os5.app/shared/transport.js',
        input: { kind: 'arraybuffer', message: 'open' },
        output: { kind: 'arraybuffer', request: 'save', message: 'save-data', format: 'DOCX',
            mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', preservesDocument: true },
    },
};
function freeze(value) {
    if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
    return value;
}
export const applications = freeze([dpaint, documents]);

export function recommend(detection, { available, applications: overrides = {}, action } = {}) {
    const type = typeof detection === 'string' ? detection : detection?.type;
    const allowed = available == null ? null : new Set(available);
    const result = [];
    for (const app of applications) {
        if (!app.types.includes(type) || (allowed && !allowed.has(app.application))) continue;
        const override = overrides[app.application];
        if (override === false) continue;
        for (const verb of app.actions) {
            if (action && action !== verb) continue;
            const transport = structuredClone(app.transport);
            if (override?.transport) Object.assign(transport, structuredClone(override.transport));
            result.push({ application: app.application, name: app.name, action: verb, url: override?.url || app.url, transport });
        }
    }
    return result;
}
