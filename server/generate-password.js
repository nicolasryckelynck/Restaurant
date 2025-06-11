const bcrypt = require('bcrypt');

async function generateHash() {
    const password = 'motdepasse';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password:', password);
    console.log('Generated hash:', hash);
}

generateHash(); 