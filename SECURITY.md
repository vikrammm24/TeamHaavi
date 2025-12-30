# Security Policy

## Overview

CityConnect takes security seriously. This document outlines our security practices and how to report vulnerabilities.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Measures Implemented

### 1. Environment Variables

Sensitive configuration data (API keys, tokens, database credentials) are stored in environment variables, not in source code.

- **Backend**: Create a `.env` file based on `backend/.env.example`
- **Frontend**: Create a `.env` file based on `project/.env.example`
- **Never commit** `.env` files or files containing secrets to version control

### 2. API Security

#### Rate Limiting
- Implemented rate limiting to prevent DoS attacks
- Default: 100 requests per 15 minutes per IP
- Configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` environment variables

#### Input Validation
- All API endpoints use express-validator for input validation
- Strict validation rules for:
  - String lengths (min/max)
  - Data types
  - Allowed values (enums)
  - Array sizes

#### XSS Protection
- Production-grade HTML sanitization using DOMPurify
- All HTML tags and dangerous content stripped from user input
- Protection against:
  - Script injection
  - Event handler injection
  - Protocol-based attacks (javascript:, data:, vbscript:)
  - Nested/obfuscated XSS attempts
- Input sanitization applied to all user-generated content

#### NoSQL Injection Protection
- Custom middleware removes dangerous keys ($ prefix, . characters)
- Prevents NoSQL injection attacks on in-memory data structures
- Applied to request body, query parameters, and URL parameters

#### Security Headers
- Helmet.js configures secure HTTP headers:
  - Content Security Policy (CSP)
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security
  - And more

### 3. Authentication & Authorization

#### Firebase Authentication
- Secure authentication using Firebase Auth
- Supports email/password and Google OAuth
- Session management with secure persistence

#### Role-Based Access Control
- Middleware for role verification (`requireRole`)
- Protected endpoints require appropriate roles (authority, professional)
- Example: Only authorities/professionals can delete comments

### 4. Data Protection

#### Sensitive Data
- Firebase API keys moved to environment variables
- ngrok authtokens excluded from repository
- Private keys, certificates excluded via `.gitignore`

#### Data Sanitization
- All user input is sanitized before storage
- HTML content is stripped of dangerous elements
- Array sizes are limited (e.g., max 5 photos per issue)

### 5. File Security

#### .gitignore Configuration
Protected files:
- `.env*` - Environment variables
- `*.key`, `*.pem`, `*.p12`, `*.pfx` - Private keys and certificates
- `secrets.*` - Any files containing secrets
- `ngrok.yml` - Tunnel configuration with authtoken

## Deployment Best Practices

### Environment Setup

1. **Never use default/example values in production**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your production values
   
   # Frontend
   cp project/.env.example project/.env
   # Edit project/.env with your production values
   ```

2. **Use strong secrets**
   - Generate random session secrets (at least 32 characters)
   - Use unique API keys for each environment
   - Rotate credentials regularly

3. **Firebase Security Rules**
   - Configure proper Firestore security rules
   - Restrict read/write access based on authentication
   - Example rules:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{userId} {
           allow read: if request.auth != null;
           allow write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
     ```

4. **CORS Configuration**
   - In production, restrict CORS to specific origins
   - Update `backend/index.js`:
     ```javascript
     expressApp.use(cors({
       origin: process.env.CORS_ORIGIN || '*'
     }));
     ```
   - Set `CORS_ORIGIN=https://yourdomain.com` in production

5. **HTTPS Only**
   - Always use HTTPS in production
   - Configure your hosting platform to enforce HTTPS
   - Set secure cookie flags if using sessions

### Monitoring

1. **Log Security Events**
   - Monitor failed authentication attempts
   - Track rate limit violations
   - Log validation errors

2. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm audit fix
   npm outdated
   ```

3. **Regular Security Scans**
   - Run CodeQL or similar static analysis tools
   - Check for known vulnerabilities in dependencies

## Reporting a Vulnerability

If you discover a security vulnerability, please email us at [security@cityconnect.example] with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if available)

**Please do not:**
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before we've addressed it

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 30 days
  - Medium/Low: Within 90 days

## Security Checklist for Developers

- [ ] Never commit sensitive data (API keys, tokens, passwords)
- [ ] Use environment variables for all configuration
- [ ] Validate and sanitize all user input
- [ ] Implement proper error handling (don't leak system information)
- [ ] Use prepared statements/parameterized queries
- [ ] Keep dependencies up to date
- [ ] Use HTTPS in production
- [ ] Implement proper authentication and authorization
- [ ] Set secure HTTP headers
- [ ] Implement rate limiting
- [ ] Log security-relevant events
- [ ] Regular security audits

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

## License

This security policy is part of the CityConnect project and follows the same license terms.
