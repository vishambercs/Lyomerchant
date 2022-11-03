const childProcess = require('child_process')

module.exports =
{
   async GetBalance(address) {
    const forked_child_process = childProcess.fork('./worker-pool.js');
    forked_child_process.send(address);
    forked_child_process.on("message", data => res.send(data));
    },
}