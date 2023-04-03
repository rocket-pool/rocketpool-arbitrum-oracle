require('dotenv').config();

const process = require('process');
const ethers = require('ethers');

const RocketArbitrumPriceMessenger = require(
    '../out/RocketArbitrumPriceMessenger.sol/RocketArbitrumPriceMessenger.json');
const RocketArbitrumPriceOracle = require('../out/RocketArbitrumPriceOracle.sol/RocketArbitrumPriceOracle.json');

const arbitrumProvider = new ethers.providers.JsonRpcProvider(process.env.ARBITRUM_RPC);

const ethereumProvider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC);
const ethereumWallet = ethers.Wallet.fromMnemonic(process.env.ETHEREUM_MNEMONIC).connect(ethereumProvider);

const ethTxOverrides = {
  maxFeePerGas: ethers.utils.parseUnits('20', 'gwei'),
  maxPriorityFeePerGas: ethers.utils.parseUnits('1.5', 'gwei'),
}

async function submit() {
  // Create the contract instances
  const messengerFactory = new ethers.ContractFactory(RocketArbitrumPriceMessenger.abi,
      RocketArbitrumPriceMessenger.bytecode.object).connect(ethereumWallet);
  const messenger = messengerFactory.attach(process.env.MESSENGER_ADDRESS);

  // Construct the calldata of the L2 transaction for the estimator
  const oracleIface = new ethers.utils.Interface(RocketArbitrumPriceOracle.abi);
  const data = oracleIface.encodeFunctionData('updateRate', [ethers.BigNumber.from('1')]);

  /*
    The tx value is calculated by gasLimit * maxFeePerGas + maxSubmissionCost
    gasLimit can be safely hardcoded to 40,000 (it's the gas limit of the L2 transaction, so it's well known)
    maxFeePerGas can be queried from a third party gas estimator or via an eth_gasPrice RPC call to an Arbitrum node
    maxSubmissionCost can be calculated with the following formula: (1400 + 6 * dataLength) * baseFee
    maxSubmissionCost should have a buffer in case baseFee changes, a large buffer (300%) should be fine as it is such a small value
    baseFee is the current Ethereum baseFeePerGas
   */

  const gasLimit = ethers.BigNumber.from('70000');
  const maxFeePerGas = await arbitrumProvider.getGasPrice();
  const baseFee = (await ethereumProvider.getFeeData()).lastBaseFeePerGas;
  const maxSubmissionCost = ethers.BigNumber.from('1400').add(ethers.BigNumber.from('6').mul(ethers.utils.hexDataLength(data))).mul(baseFee).mul(4);
  const depositValue = gasLimit.mul(maxFeePerGas).add(maxSubmissionCost);

  console.log(`Calling submitRate with ${ethers.utils.formatEther(depositValue)} ETH callValue for L2 fees`);

  // Execute the submitRate transaction with calculated parameters and value
  const tx = await messenger.submitRate(maxSubmissionCost, gasLimit, maxFeePerGas, {...ethTxOverrides, value: depositValue});
  const receipt = await tx.wait();

  console.log(`Transaction confirmed on L1: ${receipt.transactionHash}`);
  process.exit(0);
}

submit();
