# Workvivo JWT SSO Demo

A Node.js web application demonstrating JWT (JSON Web Token) Single Sign-On (SSO) integration with Workvivo. This project provides a complete implementation for authenticating users and generating JWT tokens for seamless login to Workvivo.

## Features

- **JWT SSO Authentication**: Secure token-based authentication for Workvivo
- **Mobile & Desktop Support**: Automatic device detection and appropriate handling
- **Key Management**: RSA key pair generation and JWKS (JSON Web Key Set) creation
- **Session Management**: Express session handling for user state
- **Comprehensive Logging**: Detailed request logging with rotation
- **Modern UI**: Clean, responsive web interface

## Prerequisites

- Node.js v20.18.2 or higher
- npm 11.0.0 or higher
- Access to Workvivo admin portal with "IT Administrator" and "Developer" roles

## Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd workvivo-jwtsso
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy and rename `.env.example` to `.env` in the root directory with the following variables:
   ```env
   PORT=<server port>

   # JWT Key File Paths
   # Path to your private RSA key file (relative to project root)
   JWT_PRIVATE_KEY_PATH=jwtRS256.key

   # Path to your JWKS (JSON Web Key Set) file (save it where Wokrvivo can see)
   JWKS_PATH=public/.well-known/jwks.json

   # JWT Token Configuration
   # Issuer - Your domain or organization identifier
   JWT_ISS=<your-domain>

   # Audience - Your Workvivo instance URL
   JWT_AUD=<your-workvivo-instance>.workvivo.com

   # Organization ID - Your Workvivo organization ID (numeric)
   JWT_ORGANISATION_ID=<your workvivo organization id>

   # Workvivo Base URL - The SSO redirect endpoint for your Workvivo instance
   WORKVIVO_BASE_URL=https://<your-workvivo-instance>.workvivo.com/proxy/redirect/sso/ 
   ```

## Setup Instructions

### 1. Generate RSA Key Pair

Run the JWKS generation tool which will create both the key pair and JWKS file:

```bash
node tools/generate-jwks.js
```

This will create:
- `jwtRS256.key` (private key)
- `jwtRS256.key.pub` (public key)
- `jwks.json` (JSON Web Key Set)

### 2. Make JWKS Publicly Accessible

Copy the JWKS file to the public directory:

```bash
mkdir -p public/.well-known
cp jwks.json public/.well-known/
```

### 3. Configure Workvivo Admin Portal

In your Workvivo admin portal (Admin > Admin > API & Keys & JWT Settings > JWT Settings):

- ✅ **Enable login via JWT SSO**
- ✅ **Force JWT SSO authentication only** (optional)
- ✅ **Enable JWT in URL**
- ✅ **JWT SSO Test mode only** (for testing)
- **Test User's email address**: `{TEST_USER_EMAIL}`
- **JWT SSO login URL**: `https://<your-domain>.com/login`
- **Public Key URL**: `https://<your-domain>.com/.well-known/jwks.json`
- **Allowed Origins for CORS**: `https://<your-domain>.com`
- **Key Type**: `JWKS`
- **JWKS Hosted on Workvivo**: Leave empty

## Usage

### Starting the Server

```bash
# Development
npm start

# Production with PM2
pm2 start app.js --name "Workvivo-JWTSSO"
```

The server will start on port 8790 (or the port specified in your `.env` file).

### Testing the Application

1. **Access the login page**: `http://<your domain>:<port>`
2. **Enter credentials**: Any email/password combination will work (demo mode)
3. **Login**: You'll be redirected to the welcome page
4. **Generate JWT**: Click "Redirect to WorkVivo" to generate and use the JWT token

### JWT Token Generation

You can also generate JWT tokens manually using the provided script under `tools`:

```bash
node generate-token.js
```

This will create a JWT token with the configured payload and display it in the console.

## API Endpoints

- `GET /` - Login page
- `GET /login` - Login page (same as root)
- `POST /login` - Handle login form submission
- `GET /welcome` - Welcome page with JWT token generation
- `GET /.well-known/jwks.json` - Public JWKS endpoint

## JWT Token Structure

The generated JWT tokens include the following claims:

```json
{
  "iss": "<your-domain.com>",
  "sub": "user@example.com",
  "aud": "<your-workvivo-instance>.workvivo.com",
  "iat": 1640995200,
  "nbf": 1640995200,
  "exp": 1640998800,
  "email": "user@example.com",
  "disableState": true,
  "organisation_id": 3307,
  "mobile": true
}
```

## Mobile vs Desktop Handling

The application automatically detects mobile devices and:
- Sets the `mobile: true` flag in JWT tokens for mobile requests
- Forces URL parameter usage for mobile devices
- Provides appropriate redirect handling for mobile apps

## Logging

The application includes comprehensive logging:
- **Access logs**: Rotated daily in `logs/` directory
- **Console logs**: Real-time server activity
- **Request details**: Method, URL, status, user agent, and request body

## Security Considerations

- **Private Key**: Keep `jwtRS256.key` secure and never expose it publicly
- **HTTPS**: Use HTTPS in production for secure token transmission
- **CORS**: Configure allowed origins in Workvivo admin portal
- **Token Expiration**: Tokens expire after 1 hour by default
- **Session Security**: Configure secure session settings for production

## Troubleshooting

### Common Issues

1. **JWKS not accessible**: Ensure `jwks.json` is copied to `public/.well-known/`
2. **CORS errors**: Verify allowed origins in Workvivo admin portal
3. **Token validation fails**: Check that public key URL is accessible
4. **Mobile redirect issues**: Ensure mobile flag is properly set in JWT

### Testing with curl

Test JWT authentication using curl:

```bash
# Using URL parameter
curl --location 'https://<your-workvivo-instance>.workvivo.com/proxy/redirect/sso/YOUR_JWT_TOKEN'

# Using header
curl --location 'https://<your-workvivo-instance>.workvivo.com/proxy/redirect/sso' \
  --header 'x-workvivo-jwt: YOUR_JWT_TOKEN'
```

## Project Structure

```
workvivo-jwtsso/
├── app.js                 # Main application server
├── jwks.json             # JSON Web Key Set
├── jwtRS256.key          # Private RSA key
├── jwtRS256.key.pub      # Public RSA key
├── package.json          # Node.js dependencies
├── .env.example          # Environment variables (sample)
├── logs/                 # Application logs
├── public/               # Static files
│   ├── css/
│   ├── images/
│   └── .well-known/      # JWKS endpoint
├── tools/                # Utility scripts
│   └── generate-jwks.js  # JWKS generation tool
└── views/                # EJS templates
    ├── login.ejs         # Login page
    └── welcome.ejs       # Welcome page
```

## Dependencies

- `express`: Web framework
- `jsonwebtoken`: JWT handling
- `node-jose`: JWKS operations
- `ejs`: Template engine
- `express-session`: Session management
- `morgan`: HTTP request logging
- `rotating-file-stream`: Log rotation
- `body-parser`: Request body parsing
- `dotenv`: Environment variable management

## License

This project is provided as a demo implementation for Workvivo JWT SSO integration.

## Support

For issues related to:
- **This demo application**: Check the troubleshooting section
- **Workvivo JWT SSO**: Contact Workvivo support
- **JWT implementation**: Refer to JWT documentation

---

**Author**: Yosuke Sawamura (yosuke.sawamura@zoom.us)  
**Version**: 1.0.0  
**Last Updated**: March 2025 
