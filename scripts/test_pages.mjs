async function run() {
    console.log("=== Testing Pages ===");
    const pages = [
        '/',
        '/checkout',
        '/admin',
        '/login',
        '/menu/qasab-classic',
        '/api/auth/session' // this is auth endpoint
    ];
    for (const page of pages) {
        try {
            const res = await fetch("http://localhost:3000" + page);
            console.log(`GET ${page} -> Status: ${res.status}`);
            if (res.status === 500) {
                const text = await res.text();
                console.log(`  ERROR 500 CONTENT:`, text.slice(0, 300));
            }
        } catch (e) {
            console.log(`GET ${page} -> Failed:`, e.message);
        }
    }
}
run();
