const http = require('http');

console.time('fetchProposals');
http.get('http://localhost:5000/api/proposals', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.timeEnd('fetchProposals');
    console.log('Status:', res.statusCode);
  });
}).on('error', err => {
  console.error(err);
});
