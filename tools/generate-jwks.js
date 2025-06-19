/////////////////////////////////////////////////////////////////////////////////////////////////
// March 22, 2025
// yosuke.sawamura@zoom.us
// Workvivo One Time Passcode demo 
// Node.js script to generate jwks.json from public key
//
// Note: You'll need to install node-jose first:
// # npm install node-jose
// then run the script
// # node generate-jwks.js
//
// This script will generate jwks.json from the public key.
// copy jwks.json  jwtRS256.key  jwtRS256.key.pub on to the same directory as server.js
//
/////////////////////////////////////////////////////////////////////////////////////////////////

const fs = require('fs');
const crypto = require('crypto');
const jose = require('node-jose');

async function generateJWKS() {
    try {
        // Read the public key
        const publicKey = fs.readFileSync('jwtRS256.key.pub');
        
        // Create a keystore
        const keystore = jose.JWK.createKeyStore();
        
        // Import the public key into the keystore
        await keystore.add(publicKey, 'pem', {
            use: 'sig',
            alg: 'RS256',
            kid: crypto.randomBytes(16).toString('hex') // Generate a random key ID
        });

        // Export the keystore as JWKS
        const jwks = keystore.toJSON();

        // Write to jwks.json
        fs.writeFileSync('jwks.json', JSON.stringify(jwks, null, 4));
        
        console.log('Generated jwks.json successfully');
    } catch (error) {
        console.error('Error generating JWKS:', error);
    }
}


// Generate key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// Write the keys to files
fs.writeFileSync('jwtRS256.key', privateKey);
fs.writeFileSync('jwtRS256.key.pub', publicKey);

console.log('Key pair generated successfully!'); 

// Generate JWKSs
generateJWKS();
