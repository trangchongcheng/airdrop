import { ethers } from "ethers";
import { sleep, writeFile } from "../log";
import { HOME_ABI, ROCK_ABI } from "./ABI";
const ExcelJS = require("exceljs");

/**
 * Steps:
 * 1: npm install + npm install g ts-node
 * 2. Update AirdropLand.xlsx includes: walletaddress, amount, tokenid
 * 3. Config value BSC_RPC, PRIVATE_KEY, CONTRACT_ADDRESS, ABI
 * 4. Run script: npm run scripts AirdropLandRevo
 */
async function runner() {
  const ERC_1155_CONTRACT_ADDRESS_ROCK =
    "0x1D1b39d000Db557604317F1D0677388F4d39C49C";
  const BSC_RPC = "https://bsc-dataseed.binance.org";
  const PRIVATE_KEY = "";
  const ERC_1155_CONTRACT_ADDRESS_HOME =
    "0x13cBcfEB3AeEe469b7Cf0a3135d32D04E05D41aE";

  // Read excel get data
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile("./land/AirdropLand.xlsx");
  const airdropAddresses = workbook
    .getWorksheet(1)
    .getColumn(1)
    .values.filter((el) => el !== "");

  const amounts = workbook
    .getWorksheet(1)
    .getColumn(2)
    .values.filter((el) => el !== "");

  const tokenIDs = workbook
    .getWorksheet(1)
    .getColumn(3)
    .values.filter((el) => el !== "");

  // Remove header
  airdropAddresses.shift();
  amounts.shift();
  tokenIDs.shift();

  console.log(
    `>>> Total airdrop ${airdropAddresses.length} land(s) for ${airdropAddresses.length} address(es)`
  );
  for (let i = 0; i < airdropAddresses.length; i++) {
    const airdropAddress = airdropAddresses[i].toLowerCase().trim();

    const tokenID = tokenIDs[i];
    // const amount = amounts[i];
    const amount = 1;

    const isValidWallet = ethers.utils.isAddress(airdropAddress);
    if (!isValidWallet) {
      console.log(`xxx Address ${airdropAddress} is invalid`);
      continue;
    }
    try {
      const provider = new ethers.providers.JsonRpcProvider(BSC_RPC);

      // create signer

      const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
      let balancePromise = await wallet.getBalance();

      const balance = +ethers.utils.formatEther(balancePromise);

      const contract = new ethers.Contract(
        ERC_1155_CONTRACT_ADDRESS_HOME,
        HOME_ABI,
        wallet
      );

      const adminAddress = (await wallet.getAddress()).toLowerCase();

      const tx = await contract.safeTransferFrom(
        adminAddress,
        airdropAddress,
        tokenID,
        amount,
        "0x"
      );

      const txReceipt = await tx.wait();
      await sleep(2000);
      console.log("result:", txReceipt);

      if (txReceipt.status) {
        await writeFile(
          "./logs/airdop-land-home-success-logs.txt",
          "\n" +
            JSON.stringify({ txReceipt, balance, tokenID, airdropAddress }) +
            "\n"
        );
        console.log(
          ">>> Airdrop land success: ",
          `${airdropAddress} - ${tokenID} - ${amount}`
        );
      } else {
        await writeFile(
          "./logs/airdop-land-home-fail-logs.txt",
          "\n" +
            JSON.stringify({ txReceipt, balance, tokenID, airdropAddress }) +
            "\n"
        );
        console.log(
          ">>> Airdrop land failed: ",
          `${airdropAddress} - ${tokenID} - ${amount}`
        );
      }
    } catch (error) {
      // console.log("Transfer Box failed: ", error);
      console.log("Transfer Box failed messsage: ", error.message);
    }
  }
}

export default runner;
