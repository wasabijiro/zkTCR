import { create, StateCreator } from "zustand";
import { tokenAddress, escrowAddress } from "@/config";
import Web3 from "web3";
import { walletState } from "@/types";
import { escrowABI, tokenABI } from "@/config/abi";

export const useWalletSetup = create<walletState>((set, get) => ({
  account: undefined,
  balance: undefined,
  input: "",
  releaseTxId: "",
  withdrawTxId: "",
  connectWallet: async () => {
    // @ts-ignore
    if (window.ethereum) {
      try {
        // @ts-ignore
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        console.log("Connected", account);
        set({ account: accounts[0] });
        // @ts-ignore
        const web3 = new Web3(window.ethereum);
        const minABI = [
          // balanceOf
          {
            constant: true,
            inputs: [{ name: "_owner", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "balance", type: "uint256" }],
            type: "function",
          },
        ];
        // @ts-ignore
        const contract = new web3.eth.Contract(minABI, tokenAddress);
        const balance = await contract.methods.balanceOf(account).call();
        set({ balance: web3.utils.fromWei(balance, "ether") });
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      console.log("Please install MetaMask!");
    }
  },
  depositTCR: async (buyerAddress: any, amount: any) => {
    // @ts-ignore
    const web3 = new Web3(window.ethereum);
    const numericAmount = web3.utils.toWei(amount, "ether");

    // @ts-ignore
    const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
    // @ts-ignore
    const escrowContract = new web3.eth.Contract(escrowABI, escrowAddress);

    try {
      await tokenContract.methods
        .approve(escrowAddress, numericAmount)
        .send({ from: buyerAddress });
      console.log("Token approved for escrow");

      const receipt = await escrowContract.methods
        .accept(buyerAddress, buyerAddress, numericAmount)
        .send({ from: buyerAddress });
      console.log("Transaction receipt:", receipt);
      console.log("Transaction hash:", receipt.transactionHash);
    } catch (error) {
      console.error("Error in transaction:", error);
    }
  },
  callRelease: async (txId: any, sellerAddress: any) => {
    // @ts-ignore
    const web3 = new Web3(window.ethereum);
    // @ts-ignore
    const escrowContract = new web3.eth.Contract(escrowABI, escrowAddress);

    try {
      const receipt = await escrowContract.methods
        .release(txId, sellerAddress)
        .send({ from: sellerAddress });
      console.log("Release transaction receipt:", receipt);
    } catch (error) {
      console.error("Error in release transaction:", error);
    }
  },
  callWithdraw: async (txId: any, account: any) => {
    // @ts-ignore
    const web3 = new Web3(window.ethereum);
    // @ts-ignore
    const escrowContract = new web3.eth.Contract(escrowABI, escrowAddress);

    try {
      const receipt = await escrowContract.methods
        .withdraw(txId)
        .send({ from: account });
      console.log("Withdraw transaction receipt:", receipt);
    } catch (error) {
      console.error("Error in withdraw transaction:", error);
    }
  },
  getTotalBalanceEscrow: async () => {
    // @ts-ignore
    const web3 = new Web3(window.ethereum);
    // @ts-ignore
    const escrowContract = new web3.eth.Contract(escrowABI, escrowAddress);

    try {
      const totalBalance = await escrowContract.methods.totalBalance().call();
      console.log("Total Balance:", web3.utils.fromWei(totalBalance, "ether"));
    } catch (error) {
      console.error("Error getting total balance:", error);
    }
  },
  getAllTxIds: async () => {
    // @ts-ignore
    const web3 = new Web3(window.ethereum);
    // @ts-ignore
    const escrowContract = new web3.eth.Contract(escrowABI, escrowAddress);

    try {
      const txIds = await escrowContract.methods.getAllTransactionIds().call();
      console.log("All Transaction IDs:", txIds);
    } catch (error) {
      console.error("Error getting all transaction IDs:", error);
    }
  },
}));
