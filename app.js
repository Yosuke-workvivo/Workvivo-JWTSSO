////////////////////////////////////////////////////////////
// Workvivo JTW SSO demo sample
// 2025-03-15 written by Yosuke Sawamura
// yosuke.sawamura@zoom.us
//
// npm 11.0.0
// node v20.18.2
//
// To run this sample, please install node.js and npm, and then install the following packages:
//
//  npm install
//
// To run this sample, please execute the following command:
// 
//  node app.js  
//
////////////////////////////////////////////////////////////

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 8790;

// Create rotating write streams
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'logs'),
    size: '10M' // or rotate when size exceeds 10MB
});

// Custom morgan token for file path
morgan.token('filepath', (req) => {
    return req.url;
});

// Custom morgan token for formatted date
morgan.token('formatted-date', () => {
    return new Date().toISOString();
});

// Custom morgan token for route name
morgan.token('route-name', (req) => {
    if (req.route) {
        return req.route.path;
    }
    return 'unknown';
});

// Custom morgan token for request body
morgan.token('request-body', (req) => {
    return JSON.stringify(req.body);
});

// Middleware
// General request logging with detailed format
const logFormat = ':formatted-date :remote-addr - ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" route=:route-name body=:request-body';

app.use(morgan(logFormat, {
    stream: accessLogStream
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session middleware
app.use(session({
    secret: 'sample-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true if using https
}));

// Set up EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from public directory with logging
app.use('/', express.static(path.join(__dirname, 'public')));

// Routes with specific logging
app.get('/', (req, res) => {
    console.log(`[${new Date().toISOString()}] Accessing root route`);
    res.render('login');
});

app.get('/login', (req, res) => {
    console.log(`[${new Date().toISOString()}] Accessing login page`);
    res.render('login');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`[${new Date().toISOString()}] Login attempt for email: ${email}`);
    
    // Store email in session
    req.session.userEmail = email;
    
    res.json({
        success: true,
        message: 'Login successful'
    });
});

app.get('/welcome', (req, res) => {
    const email = req.session.userEmail;
    console.log(`[${new Date().toISOString()}] Accessing welcome page for user: ${email || 'unknown'}`);
    
    if (!email) {
        console.log(`[${new Date().toISOString()}] Unauthorized welcome page access - redirecting to login`);
        return res.redirect('/wvjwtsso/');
    }

    // Mobile detection using user-agent
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent);
    console.log(`[${new Date().toISOString()}] Device type: ${isMobile ? 'Mobile' : 'Desktop'}`);

    // Read the private key and JWKS with full path resolution
    const privateKeyPath = path.join(__dirname, process.env.JWT_PRIVATE_KEY_PATH);
    const jwksPath = path.join(__dirname, process.env.JWKS_PATH);
    
    console.log(`[${new Date().toISOString()}] Reading private key from: ${privateKeyPath}`);
    console.log(`[${new Date().toISOString()}] Reading JWKS from: ${jwksPath}`);
    
    const privateKey = fs.readFileSync(privateKeyPath);
    const jwks = JSON.parse(fs.readFileSync(jwksPath));
    const kid = jwks.keys[0].kid;

    // Current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Create payload
    const payload = {
        iss: process.env.JWT_ISS,
        sub: email,
        aud: process.env.JWT_AUD,
        iat: currentTime,
        nbf: currentTime,
        exp: currentTime + (60 * 60),
        email: email,
        disableState: true,
        organisation_id: parseInt(process.env.JWT_ORGANISATION_ID)
    };

    // Add mobile flag if request is from mobile device
    if (isMobile) {
        payload.mobile = true;
    }

    // Generate token with kid in header
    const token = jwt.sign(payload, privateKey, { 
        algorithm: 'RS256',
        header: {
            kid: kid
        }
    });

    // Render welcome page with token and base URL
    res.render('welcome', { 
        email: email,
        token: token,
        workvivoBaseUrl: process.env.WORKVIVO_BASE_URL,
        isMobile: isMobile
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running Workvio JWTSSO port at ${port}`);
});
