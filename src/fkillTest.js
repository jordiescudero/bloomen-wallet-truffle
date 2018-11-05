const fkill = require('fkill');

// fkill(1337).then(() => {
// 	console.log('Killed process');
// });

// fkill('Safari');
fkill(':8545');

//fkill([1337, 'Safari', ':8080']);