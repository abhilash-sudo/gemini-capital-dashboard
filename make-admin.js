// Run this once to promote a user to admin
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/stockapp');
const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }));
User.updateOne({ email: 'admin@example.com' }, { $set: { role: 'admin' } }).then(console.log).catch(console.error);