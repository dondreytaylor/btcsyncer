// HTTP client
var got = require("got");

// RPC Client
var RPCClient = require('bitcoind-rpc');

// RPC Configuration (Sync from node)
var sync_from_rpc = {
    protocol: 'http',
    user: '',
    pass: '',
    host: '',
    port: '',
};

// RPC Configuration (Sync to node)
var sync_to_rpc = {
    protocol: 'http',
    user: '',
    pass: '',
    host: '',
    port: '',
};


// Fetching indicator
var isFetchingBlock = false;

// RPC
var syncFromRPC = new RPCClient(sync_from_rpc);
var syncToRPC = new RPCClient(sync_to_rpc);

var getBlockHash = function(rpc, blockNumber) {
  return new Promise(function(resolve, reject) {
      rpc.getBlockHash(function(err, response) {
          if (!err && !response.err) {
              resolve(response.result);
          }
          else {
              reject();
          }
      });
  });
};

var getBlockHex = function(rpc, blockHash) {
  return new Promise(function(resolve, reject) {
      rpc.getBlock(function(err, response) {
          if (!err && !response.err) {
              resolve(response.result);
          }
          else {
              reject();
          }
      });
  });
};

var getBlockCount = function(rpc) {
  return new Promise(function(resolve, reject) {
      rpc.getBlockCount(function(err, response) {
          if (!err && !response.err) {
              resolve(response.result);
          }
          else {
              reject();
          }
      });
  });
};

var submitBlock = function(rpc, blockHex) {
  return new Promise(function(resolve, reject) {
      rpc.submitBlock(blockHex, function(err, response) {
          if (!err && !response.err) {
             resolve(true);
          }
          else {
             resolve(false);
          }
      });
  });
};

var syncBlocks = async function() {
    if (!isFetchingBlock) {
        isFetchingBlock = true;
        try {
            var syncFromBlockCount = await getBlockCount(syncFromRPC) + 1;
            var syncToBlockCount = await getBlockCount(syncToRPC) + 1;
            if (syncToBlockCount != syncFromBlockCount) {
                var hash = await getBlockHash(syncFromRPC, index);
                var hex = await getBlockHex(syncFromRPC, hash);
                var submitted = submitBlock(syncToRPC, hexFinal);
                console.log(syncToBlockCount, "of", syncFromBlockCount, "blocks synced");
            }
            else {
                console.log("[DONE]");
                clearInterval(timeout);
            }
         }
        catch(e) { console.log(e); }
        isFetchingBlock = false;
    }
};

var timeout = setInterval(syncBlocks);
