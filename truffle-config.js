require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: process.env.ETH_DEV_RPC_HOST || '127.0.0.1',     // Localhost (default: none)
      port: process.env.ETH_DEV_RPC_PORT || 7545,            // Standard Ethereum port (default: none)
      network_id: process.env.ETH_DEV_RPC_NETWORK_ID || '*',       // Any network (default: none)
      gas: parseInt(process.env.ETH_DEV_RPC_GAS, 10) || 6721975 // required for deploy, otherwise it throws weird require-errors on constructor
    },

    testnet: {
      provider: () => new HDWalletProvider(process.env.ADMIN_WALLET_MNEMONIC, `https://api.avax-test.network/ext/bc/C/rpc`),
      network_id: 43113,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    mainnet: {
      provider: () => new HDWalletProvider(process.env.ADMIN_WALLET_MNEMONIC, `https://api.avax.network/ext/bc/C/rpc`),
      network_id: 43114,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    // Another network with more advanced options...
    // advanced: {
    // port: 8777,             // Custom port
    // network_id: 1342,       // Custom network
    // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
    // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
    // from: <address>,        // Account to send txs from (default: accounts[0])
    // websocket: true        // Enable EventEmitter interface for web3 (default: false)
    // },
    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    // ropsten: {
    // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
    // network_id: 3,       // Ropsten's id
    // gas: 5500000,        // Ropsten has a lower block limit than mainnet
    // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    // },
    // Useful for private networks
    // private: {
    // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
    // network_id: 2111,   // This network is yours, in the cloud.
    // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.14",    // Fetch exact version from solc-bin (default: truffle's version)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
      }
    }
  },
  // plugins: [
  //   "truffle-plugin-verify",
  //   "truffle-contract-size"
  // ],
  // api_keys: {
  //   bscscan: process.env.BSCSCAN_API_KEY
  // },
};
