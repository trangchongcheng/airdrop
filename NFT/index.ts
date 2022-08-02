// import web3 from "web3";
// var W3 = new web3(
//   "https://eth-mainnet.gateway.pokt.network/v1/5f3453978e354ab992c4da79"
// );
// export async function getUserNfts(network, contractAddress, userAddress) {
//   //let ABI = await GetABI(network, contractAddress)
//   const ERC721 = new W3.eth.Contract(ABI, contractAddress);

//   let balance = await ERC721.methods.balanceOf(userAddress).call();
//   //   await ERC721.methods.userOwnedTokens.call(walletAddress)

//   //console.log(balance)

//   var tokens: any = [];
//   var objects: any = [];
//   for (var i = 0; i < balance; i++) {
//     tokens.push(
//       await ERC721.methods.tokenOfOwnerByIndex(userAddress, i).call()
//     );
//     // console.log(tokens[i])
//   }

//   for (i = 0; i < tokens.length; i++) {
//     objects.push(await ERC721.methods.tokenURI(tokens[i]).call());
//   }

//   let imagesUri = await getNftImageUri(objects);
//   let cN = await GetContractName("Eth", contractAddress);
//   let nftInfo = {
//     collectionName: cN,
//     tokenIds: tokens,
//     tokenImgUri: imagesUri,
//   };
//   return nftInfo;
// }

import Moralis from "moralis/node";
const serverUrl = "https://kzqetqyt9nq8.usemoralis.com:2053/server";
const appId = "cuVVxpw2kOntbU4IHCqD0cRNn2Yftsk3KuOEKRlV";
const masterKey = "xGlsgsVGkSQmYY6NzRb7Ub5HRbdqeyZVhHhpZnj9";

(async () => {
  await Moralis.start({ serverUrl, appId, masterKey });
  const options = {
    chain: "bsc" as "bsc",
    address: "0xc7b4Bbf88854D0D4210DF4EC55A14254C5D90b67",
  };
  const polygonNFTs = await Moralis.Web3API.account.getNFTs(options);
  let result = polygonNFTs.result.map((nft) => ({
    name: nft.name,
    token_id: nft.token_id,
    owner_of: nft.owner_of,
    token_uri: nft.token_uri,
  }));
  console.log(result);
})();
