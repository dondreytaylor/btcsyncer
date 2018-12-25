// HTTP client
var got = require("got");

// RPC Client
var RPCClient = require('bitcoind-rpc');

// RPC Configuration
var rpc_config = {
    protocol: 'http',
    user: 'bithereum',
    pass: 'bithereum',
    host: 'node1.bithereum.network',
    port: '18554',
};

// BTC Bitcore Endpoint
var bitcoreEndpoint = "http://bitcoin.bithereum.network:3001/";

// BTC Sync Stop
var syncStopBlock = 2012;

// Fetching indicator
var isFetchingBlock = false;

// RPC
var rpc = new RPCClient(rpc_config);

var getBlockHash = function(blockNumber) {
  return new Promise(function(resolve, reject) {
      got(bitcoreEndpoint + "insight-api/block-index/" + blockNumber)
        .then(function(response) {
            try  {
                resolve(JSON.parse(response.body).blockHash);
            } catch(e) {
                reject();
            }
        });
  });
};

var getBlockHex = function(blockHash) {
  return new Promise(function(resolve, reject) {
      got(bitcoreEndpoint + "insight-api/rawblock/" + blockHash)
        .then(function(response) {
            try  {
                resolve(JSON.parse(response.body).rawblock);
            } catch(e) {
                reject();
            }
        });
  });
};

var getBlockCount = function() {
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

var changeHeader = function(blockHex) {
    // Reformat header
    var padding1 = "0000000000000000000000000000000000000000000000000000000000000000";
    var padding2 = "0000000000000000000000000000000000000000000000000000000000";
    var formattedBlockHex = [
        blockHex.slice(0,136),
        padding1,
        blockHex.slice(136,160),
        padding2,
        blockHex.slice(160,blockHex.length)
    ].join("");
    return formattedBlockHex;
};

var submitBlock = function(blockHex) {
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
        var index = await getBlockCount() + 1;
        var hash = await getBlockHash(index);
        var hex = await getBlockHex(hash);
        var hexFinal = changeHeader(hex);
        var submitted = await submitBlock(hexFinal);
        if (submitted) {
          console.log("[NOTICE]", index+1, "BLOCK SUBMITTED")
        }

        if (index+1 >= syncStopBlock) {
            console.log("[DONE]");
            try {
              clearInterval(timeout);
            }   catch (e) {}
        }
        isFetchingBlock = false;
    }
};

var timeout = setInterval(syncBlocks);
