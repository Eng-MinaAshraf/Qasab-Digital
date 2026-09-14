async function run() {
    console.log("=== Localhost API Tests ===");
    const routes = [
        '/',
        '/api/orders',
        '/api/reviews',
        '/api/payment/response',
        '/api/payment/create',
        '/api/admin/orders'
    ];
    
    for (const r of routes) {
        try {
            const res = await fetch("http://localhost:3000" + r);
            const text = await res.text();
            console.log(`GET ${r} -> Status: ${res.status} | Body length: ${text.length}`);
            if (res.status !== 200) {
                console.log(`  Preview: ${text.slice(0, 200)}...`);
            }
        } catch (e) {
            console.error(`GET ${r} -> Failed: ${e.message}`);
        }
    }
}
run();
