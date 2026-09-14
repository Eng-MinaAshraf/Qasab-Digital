async function run() {
    try {
        const payload = {
            items: [
                {
                    id: "p1",
                    title: "قصب كلاسيك",
                    price: 20,
                    quantity: 1,
                    size: "وسط"
                }
            ],
            customer: {
                name: "Test Customer",
                phone: "01000000000",
                address: "Test Address"
            },
            paymentMethod: "paymob_card"
        };
        const res = await fetch("http://localhost:3000/api/payment/create", {
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
