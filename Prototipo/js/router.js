/* ==========================================================
   ROUTER — simple hash-based routing
   ========================================================== */
const Router = (() => {
    const routes = [];

    function add(pattern, handler) {
        // pattern like '/funcionarios/:id'
        const paramNames = [];
        const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, (m) => {
            paramNames.push(m.slice(1));
            return '([^/]+)';
        }) + '$');
        routes.push({ regex, paramNames, handler });
    }

    function resolve(hash) {
        const full = (hash || '#/inicio').replace(/^#/, '') || '/inicio';
        const [path, queryStr] = full.split('?');
        const query = {};
        if (queryStr) queryStr.split('&').forEach(pair => {
            const [k, v] = pair.split('=');
            if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
        for (const r of routes) {
            const match = path.match(r.regex);
            if (match) {
                const params = {};
                r.paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
                return { handler: r.handler, params, query, path };
            }
        }
        return null;
    }

    function navigate(hash) { window.location.hash = hash; }

    return { add, resolve, navigate };
})();
