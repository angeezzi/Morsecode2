const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        addresses.push({
          name: name,
          address: interface.address
        });
      }
    }
  }
  
  return addresses;
}

console.log('='.repeat(50));
console.log('🌐 Your Computer\'s Network IP Addresses:');
console.log('='.repeat(50));

const ips = getLocalIP();
if (ips.length === 0) {
  console.log('❌ No network interfaces found');
} else {
  ips.forEach((ip, index) => {
    console.log(`${index + 1}. ${ip.name}: ${ip.address}`);
    console.log(`   Your friend should use: http://${ip.address}:3000`);
  });
}

console.log('='.repeat(50));
console.log('📋 Instructions for your friend:');
console.log('1. Make sure you\'re both on the same WiFi network');
console.log('2. Your friend should open one of the URLs above');
console.log('3. Each person can connect their own Arduino');
console.log('='.repeat(50));
