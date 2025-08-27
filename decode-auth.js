// Decode the authorization header
const authHeader = 'U1NBcHA6cGFzc3dvcmQ=';
const decoded = Buffer.from(authHeader, 'base64').toString();
console.log('Decoded authorization:', decoded);

// Split to get username and password
const [username, password] = decoded.split(':');
console.log('Username:', username);
console.log('Password:', password);
