import axios from "axios";
import { ethers } from "ethers";
import { sleep, writeFile } from "../log";

const ExcelJS = require("exceljs");

async function runner() {
  const BSC_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545/";
  const PRIVATE_KEY = "xxxxx";
  const PUBLIC_KEY = "0x3960C14C8762fFaEFAA7B391f3fCcE50CeEb0E12";
  const CONTRACT = "0x8e08BF3aD0933920dCce6aEa64240bB312d06957";

  const ABI = [
    {
      inputs: [{ internalType: "address", name: "token_", type: "address" }],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Released",
      type: "event",
    },
    { anonymous: false, inputs: [], name: "Revoked", type: "event" },
    { stateMutability: "payable", type: "fallback" },
    {
      inputs: [{ internalType: "address", name: "holder", type: "address" }],
      name: "computeNextVestingScheduleIdForHolder",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "vestingScheduleId", type: "bytes32" },
      ],
      name: "computeReleasableAmount",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "holder", type: "address" },
        { internalType: "uint256", name: "index", type: "uint256" },
      ],
      name: "computeVestingScheduleIdForAddressAndIndex",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_beneficiary", type: "address" },
        { internalType: "uint256", name: "_start", type: "uint256" },
        { internalType: "uint256", name: "_cliff", type: "uint256" },
        { internalType: "uint256", name: "_duration", type: "uint256" },
        {
          internalType: "uint256",
          name: "_slicePeriodSeconds",
          type: "uint256",
        },
        { internalType: "bool", name: "_revocable", type: "bool" },
        { internalType: "uint256", name: "_amount", type: "uint256" },
        {
          internalType: "uint256",
          name: "_releasedBeforeVest",
          type: "uint256",
        },
      ],
      name: "createVestingSchedule",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "holder", type: "address" }],
      name: "getLastVestingScheduleForHolder",
      outputs: [
        {
          components: [
            { internalType: "bool", name: "initialized", type: "bool" },
            { internalType: "address", name: "beneficiary", type: "address" },
            { internalType: "uint256", name: "cliff", type: "uint256" },
            { internalType: "uint256", name: "start", type: "uint256" },
            { internalType: "uint256", name: "duration", type: "uint256" },
            {
              internalType: "uint256",
              name: "slicePeriodSeconds",
              type: "uint256",
            },
            { internalType: "bool", name: "revocable", type: "bool" },
            { internalType: "uint256", name: "amountTotal", type: "uint256" },
            { internalType: "uint256", name: "released", type: "uint256" },
            { internalType: "bool", name: "revoked", type: "bool" },
            {
              internalType: "uint256",
              name: "releasedBeforeVest",
              type: "uint256",
            },
          ],
          internalType: "struct TokenVesting.VestingSchedule",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getToken",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
      name: "getVestingIdAtIndex",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "vestingScheduleId", type: "bytes32" },
      ],
      name: "getVestingSchedule",
      outputs: [
        {
          components: [
            { internalType: "bool", name: "initialized", type: "bool" },
            { internalType: "address", name: "beneficiary", type: "address" },
            { internalType: "uint256", name: "cliff", type: "uint256" },
            { internalType: "uint256", name: "start", type: "uint256" },
            { internalType: "uint256", name: "duration", type: "uint256" },
            {
              internalType: "uint256",
              name: "slicePeriodSeconds",
              type: "uint256",
            },
            { internalType: "bool", name: "revocable", type: "bool" },
            { internalType: "uint256", name: "amountTotal", type: "uint256" },
            { internalType: "uint256", name: "released", type: "uint256" },
            { internalType: "bool", name: "revoked", type: "bool" },
            {
              internalType: "uint256",
              name: "releasedBeforeVest",
              type: "uint256",
            },
          ],
          internalType: "struct TokenVesting.VestingSchedule",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "holder", type: "address" },
        { internalType: "uint256", name: "index", type: "uint256" },
      ],
      name: "getVestingScheduleByAddressAndIndex",
      outputs: [
        {
          components: [
            { internalType: "bool", name: "initialized", type: "bool" },
            { internalType: "address", name: "beneficiary", type: "address" },
            { internalType: "uint256", name: "cliff", type: "uint256" },
            { internalType: "uint256", name: "start", type: "uint256" },
            { internalType: "uint256", name: "duration", type: "uint256" },
            {
              internalType: "uint256",
              name: "slicePeriodSeconds",
              type: "uint256",
            },
            { internalType: "bool", name: "revocable", type: "bool" },
            { internalType: "uint256", name: "amountTotal", type: "uint256" },
            { internalType: "uint256", name: "released", type: "uint256" },
            { internalType: "bool", name: "revoked", type: "bool" },
            {
              internalType: "uint256",
              name: "releasedBeforeVest",
              type: "uint256",
            },
          ],
          internalType: "struct TokenVesting.VestingSchedule",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getVestingSchedulesCount",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_beneficiary", type: "address" },
      ],
      name: "getVestingSchedulesCountByBeneficiary",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getVestingSchedulesTotalAmount",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getWithdrawableAmount",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "vestingScheduleId", type: "bytes32" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "release",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "vestingScheduleId", type: "bytes32" },
      ],
      name: "revoke",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
      name: "withdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    { stateMutability: "payable", type: "receive" },
  ];

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
  for (let i = 1; i < airdropAddresses.length; i++) {
    const airdropAddress = airdropAddresses[i].toLowerCase().trim();
    const tokenID = 12;
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
      const contract = new ethers.Contract(CONTRACT, ABI, wallet);

      const adminAddress = (await wallet.getAddress()).toLowerCase();

      const tx = await contract.createVestingSchedule(
        adminAddress,
        airdropAddress,
        tokenID,
        amount,
        "0x"
      );

      const txReceipt = await tx.wait();
      await sleep(2000);
      console.log(txReceipt);
      if (txReceipt.status) {
        await writeFile(
          "./logs/createVestingSchedule-success-logs.txt",
          "\n" + JSON.stringify({ txReceipt }) + "\n"
        );
      } else {
        await writeFile(
          "./logs/createVestingSchedule-fail-logs.txt",
          "\n" + JSON.stringify({ txReceipt }) + "\n"
        );
      }
    } catch (error) {
      // console.log("Transfer Box failed: ", error);
      console.log("Transfer Box failed messsage: ", error.message);
    }
  }
}

export default runner;
// const provider = new ethers.providers.Web3Provider(window.ethereum)
// const contract = new ethers.Contract(
//   ERC_1155_CONTRACT_ADDRESS_HOME,
//   HOME_ABI,
//   provider.getSigner()
// );
