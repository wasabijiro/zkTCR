"use client";

import { useState } from "react";
import Web3 from "web3";
import { escrowAddress, tokenAddress } from "@/config";
import { deposit } from "@/libs/eth";
import { escrowABI, tokenABI } from "@/config/abi";
import { useWalletSetup } from "@/libs/store/wallet";

// @ts-ignore
async function getTokenBalance(address, contractAddress, setTokenBalance) {
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
  const contract = new web3.eth.Contract(minABI, contractAddress);
  const balance = await contract.methods.balanceOf(address).call();
  setTokenBalance(web3.utils.fromWei(balance, "ether"));
}

async function getTotalBalanceEscrow() {
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
}

// @ts-ignore
async function connectWallet(setAccount, setBalance) {
  // @ts-ignore
  if (window.ethereum) {
    try {
      // @ts-ignore
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      console.log("Connected", account);
      setAccount(account);
      getTokenBalance(
        account,
        "0x044908B461Cc72742e711eB3A31c1f47bdA81B61",
        setBalance
      );
    } catch (error) {
      console.error("User denied account access");
    }
  } else {
    alert("Please install MetaMask!");
  }
}

// @ts-ignore
async function callRelease(txId, sellerAddress) {
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
}

// @ts-ignore
async function callWithdraw(txId, account) {
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
}

async function getAllTxIds() {
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
}

export default function WalletConnect() {
  const walletSetup = useWalletSetup();
  //   const [account, setAccount] = useState(null);
  //   const [balance, setBalance] = useState(null);
  //   const [input, setInput] = useState("");
  //   const [releaseTxId, setReleaseTxId] = useState("");
  //   const [withdrawTxId, setWithdrawTxId] = useState("");

  return (
    <div>
      {!walletSetup.account && (
        <button onClick={() => walletSetup.connectWallet()}>
          Connect Wallet
        </button>
      )}
      {walletSetup.account && <p>Connected Account: {walletSetup.account}</p>}
      {walletSetup.balance && <p>Balance: {walletSetup.balance} Token</p>}
      {walletSetup.account && (
        <div>
          <div className="p-1">
            {/* <input
              className="border"
              type="text"
              onChange={(e) => {
                setInput(e.target.value);
              }}
              placeholder="Enter amount"
            /> */}
            <button
              className="bg-amber-100"
              onClick={() => {
                walletSetup.depositTCR(walletSetup.account, "50");
              }}
            >
              submit
            </button>
          </div>
          {/* <div className="p-1">
            <input
              className="border"
              value={releaseTxId}
              onChange={(e) => setReleaseTxId(e.target.value)}
              placeholder="Enter tx_id"
            />
            <button
              className="bg-amber-100"
              onClick={() => callRelease(releaseTxId, account)}
            >
              Release
            </button>
          </div>
          <div className="p-1">
            <input
              className="border"
              value={withdrawTxId}
              onChange={(e) => setWithdrawTxId(e.target.value)}
              placeholder="Enter tx_id"
            />
            <button
              className="bg-amber-100"
              onClick={() => callWithdraw(withdrawTxId, account)}
            >
              Withdraw
            </button>
          </div>
          <div className="p-1">
            <button className="bg-amber-100" onClick={getTotalBalanceEscrow}>
              totalBalance
            </button>
          </div>
          <div className="p-1">
            <button className="bg-amber-100" onClick={getAllTxIds}>
              Get All Tx IDs
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}

// export default function WalletConnect() {
//   const walletSetup = useWalletSetup();
//   const [account, setAccount] = useState(null);
//   const [balance, setBalance] = useState(null);
//   const [input, setInput] = useState("");
//   const [releaseTxId, setReleaseTxId] = useState("");
//   const [withdrawTxId, setWithdrawTxId] = useState("");

//   return (
//     <div>
//       {!account && (
//         <button onClick={() => connectWallet(setAccount, setBalance)}>
//           Connect Wallet
//         </button>
//       )}
//       {account && <p>Connected Account: {account}</p>}
//       {balance && <p>Balance: {balance} Token</p>}
//       {account && (
//         <div>
//           <div className="p-1">
//             <input
//               className="border"
//               type="text"
//               onChange={(e) => {
//                 setInput(e.target.value);
//               }}
//               placeholder="Enter amount"
//             />
//             <button
//               className="bg-amber-100"
//               onClick={() => {
//                 deposit(account, input);
//               }}
//             >
//               submit
//             </button>
//           </div>
//           <div className="p-1">
//             <input
//               className="border"
//               value={releaseTxId}
//               onChange={(e) => setReleaseTxId(e.target.value)}
//               placeholder="Enter tx_id"
//             />
//             <button
//               className="bg-amber-100"
//               onClick={() => callRelease(releaseTxId, account)}
//             >
//               Release
//             </button>
//           </div>
//           <div className="p-1">
//             <input
//               className="border"
//               value={withdrawTxId}
//               onChange={(e) => setWithdrawTxId(e.target.value)}
//               placeholder="Enter tx_id"
//             />
//             <button
//               className="bg-amber-100"
//               onClick={() => callWithdraw(withdrawTxId, account)}
//             >
//               Withdraw
//             </button>
//           </div>
//           <div className="p-1">
//             <button className="bg-amber-100" onClick={getTotalBalanceEscrow}>
//               totalBalance
//             </button>
//           </div>
//           <div className="p-1">
//             <button className="bg-amber-100" onClick={getAllTxIds}>
//               Get All Tx IDs
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
