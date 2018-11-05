const pidFromPort = require('pid-from-port');

(async () => {
	try {
		console.log(await pidFromPort(8545));
		//=> 1337

		//const pids = await pidFromPort.all([8080, 22]);

		//console.log(pids.get(8080));
		//=> 1337

		//console.log(pids.get(22));
		//=> 12345
	} catch (err) {
		console.log(err);
		//=> 'Couldn't find a process with port `8080`'
	}
})();