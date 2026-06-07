const https = require('https');
const url = 'https://practicetestautomation.com/practice-test-login/';
https.get(url, (res) => {
  let data = '';
  res.on('data', (c) => { data += c; });
  res.on('end', () => {
    console.log(res.statusCode);
    console.log('username=', data.includes('id="username"'));
    console.log('password=', data.includes('id="password"'));
    console.log('submit_button=', data.includes('type="submit"'));
    console.log('button_text=', data.includes('Submit'));
    console.log('form=', data.includes('<form'));
    const idx = data.indexOf('id="username"');
    console.log(idx !== -1 ? data.slice(Math.max(0, idx - 120), idx + 200) : 'username not found');
  });
}).on('error', (e) => {
  console.error(e);
  process.exit(1);
});
