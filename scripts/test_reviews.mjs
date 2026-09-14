async function run() {
    try {
        const payload = {
            productSlug: "qasab-classic",
            name: "Test Reviewer",
            rating: 5,
            comment: "This is a great product!",
            size: "وسط"
        };
        const res = await fetch("http://localhost:3000/api/reviews", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response:`, text);
    } catch(e) {
        console.error(e);
    }
}
run();
