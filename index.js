const { TatumSolanaSDK } = require('@tatumio/solana');
require('dotenv').config();

const TATUM_API_KEY = process.env.TATUM_API_KEY;

const entainGasWallet = {
  address: process.env.ENTAIN_GAS_PUBLIC_ADDRESS,
  privateKey: process.env.ENTAIN_GAS_PRIVATE_KEY,
};

const feePayer = entainGasWallet.address;
const feePayerPrivateKey = entainGasWallet.privateKey;

const entainTokenWallet = {
  address: process.env.ENTAIN_TOKEN_PUBLIC_ADDRESS,
  privateKey: process.env.ENTAIN_TOKEN_PRIVATE_KEY,
};

const bobWallet = {
  address: process.env.BOB_PUBLIC_KEY,
  privateKey: process.env.BOB_PRIVATE_KEY,
};

const sallyWallet = {
  address: process.env.SALLY_PUBLIC_KEY,
  privateKey: process.env.SALLY_PRIVATE_KEY,
};

const solanaSDK = TatumSolanaSDK({ apiKey: TATUM_API_KEY });

const createWallet = async () => {
  try {
    const wallet = await solanaSDK.blockchain.generateWallet();
    console.log(wallet);

    return wallet;
  } catch (err) {
    console.log('Error generating a solana wallet', err);
  }
};

const getBalance = async (address) => {
  try {
    const result = await solanaSDK.blockchain.getAccountBalance(address);
    return result.balance;
  } catch (err) {
    console.log('Error getting solana account balance', err);
  }
};

const createNft = async () => {
  const body = {
    chain: 'SOL',
    to: entainTokenWallet.address,
    from: entainTokenWallet.address,
    fromPrivateKey: entainTokenWallet.privateKey,
    metadata: {
      name: 'PugLife',
      symbol: 'PUG',
      sellerFeeBasisPoints: 500,
      uri: 'https://ipfs.io/ipfs/bafkreih2mqmjrjkwygrwprlici2wr3qedgyuni2kk3xba76u33ygclakpq',
      creators: [
        {
          address: entainTokenWallet.address,
          verified: true,
          share: 100,
        },
      ],
    },
  };

  // console.log('feePayer', feePayer);
  // console.log('feePayerPrivateKey', feePayerPrivateKey);

  try {
    const mintedNft = await solanaSDK.transaction.mintNft(
      body,
      undefined,
      feePayer,
      feePayerPrivateKey,
    );
    console.log('Mint successful: ', mintedNft);
    return mintedNft;
  } catch (err) {
    console.log('Error minting nft', err);
  }
};

const transferNft = async ({
  senderPublicAddress,
  senderPrivateKey,
  receiverPublicAddress,
  nftAddress,
}) => {
  const body = {
    chain: 'SOL',
    from: senderPublicAddress,
    fromPrivateKey: senderPrivateKey,
    to: receiverPublicAddress,
    contractAddress: nftAddress,
  };

  console.log('feePayer', feePayer);
  console.log('feePayerPrivateKey', feePayerPrivateKey);

  try {
    const transfer = await solanaSDK.transaction.transferNft(
      body,
      undefined,
      feePayer,
      feePayerPrivateKey,
    );
    console.log('Transfer successful: ', transfer);
    return transfer;
  } catch (err) {
    console.log('Error transferring NFT', err);
  }
};

const transferEntainToBob = async (nftAddress) => {
  return transferNft({
    senderPublicAddress: entainTokenWallet.address,
    senderPrivateKey: entainTokenWallet.privateKey,
    receiverPublicAddress: bobWallet.address,
    nftAddress,
  });
};

const transferBobToSally = async (nftAddress) => {
  return transferNft({
    senderPublicAddress: bobWallet.address,
    senderPrivateKey: bobWallet.privateKey,
    receiverPublicAddress: sallyWallet.address,
    nftAddress,
  });
};

async function run() {
  // await createWallet();
  console.log(`Gas Wallet balance: ` + (await getBalance(entainGasWallet.address)) + ' SOL');
  console.log(`Token Wallet balance: ` + (await getBalance(entainTokenWallet.address)) + ' SOL');
  console.log(`Bob Wallet balance: ` + (await getBalance(bobWallet.address)) + ' SOL');
  console.log(`Sally Wallet balance: ` + (await getBalance(sallyWallet.address)) + ' SOL');

  // await createNft();
  // await transferEntainToBob('6sv4pbYwG2wGwvJYZh5u76beUsGtim5TFtXLDGZjwopk');
  // await transferBobToSally('6sv4pbYwG2wGwvJYZh5u76beUsGtim5TFtXLDGZjwopk');
}

run();
