require('dotenv').config();

const process = require('process');
const ethers = require('ethers');

const RocketArbitrumPriceMessenger = require('./out/RocketArbitrumPriceMessenger.sol/RocketArbitrumPriceMessenger.json');
const RocketArbitrumPriceOracle = require('./out/RocketArbitrumPriceOracle.sol/RocketArbitrumPriceOracle.json');
const RocketBalancerRateProvider = require('./out/RocketBalancerRateProvider.sol/RocketBalancerRateProvider.json');

const arbitrumProvider = new ethers.providers.JsonRpcProvider(process.env.ARBITRUM_RPC);
const arbitrumWallet = ethers.Wallet.fromMnemonic(process.env.ARBITRUM_MNEMONIC).connect(arbitrumProvider);

const ethereumProvider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC);
const ethereumWallet = ethers.Wallet.fromMnemonic(process.env.ETHEREUM_MNEMONIC).connect(ethereumProvider);

const ethTxOverrides = {
  maxFeePerGas: ethers.utils.parseUnits('20', 'gwei'),
  maxPriorityFeePerGas: ethers.utils.parseUnits('1.5', 'gwei'),
}

async function deploy() {
  console.log(`Ethereum deployer address: ${ethereumWallet.address}`);
  console.log(`Arbitrum deployer address: ${arbitrumWallet.address}`);

  // Create factories
  const messengerFactory = new ethers.ContractFactory(RocketArbitrumPriceMessenger.abi,
      RocketArbitrumPriceMessenger.bytecode.object).connect(ethereumWallet);
  const oracleFactory = new ethers.ContractFactory(RocketArbitrumPriceOracle.abi,
      RocketArbitrumPriceOracle.bytecode.object).connect(arbitrumWallet);
  const balancerProviderFactory = new ethers.ContractFactory(RocketBalancerRateProvider.abi,
      RocketBalancerRateProvider.bytecode.object).connect(arbitrumWallet);

  // Deploy
  console.log('Deploying messenger');
  const messenger = await messengerFactory.deploy(process.env.ROCKET_STORAGE, process.env.ARBITRUM_INBOX, ethTxOverrides)
  console.log(`Messenger address: ${messenger.address}`);

  console.log('Deploying oracle');
  const oracle = await oracleFactory.deploy();
  console.log(`Oracle address: ${oracle.address}`);

  // Setup tunnel
  console.log('Setting up permission');
  await messenger.updateL2Target(oracle.address, ethTxOverrides);
  await oracle.setOwner(messenger.address);
  console.log('Permissions set.');

  // Deploy balancer rate provider wrapper
  console.log('Deploying balancer wrapper')
  const balancerWrapper = await balancerProviderFactory.deploy(oracle.address);
  console.log(`Balancer wrapper address: ${balancerWrapper.address}`);

  process.exit(0);
}

deploy();
