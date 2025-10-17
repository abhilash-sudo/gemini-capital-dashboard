const fetch = require('node-fetch');

fetch('http://localhost:5000/api/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Test announcement', type: 'info' })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);

