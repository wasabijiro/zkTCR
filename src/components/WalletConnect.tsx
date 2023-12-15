"use client"

import { useState } from 'react';
import Web3 from 'web3';

const escrowABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_tx_id",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_buyer",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "accept",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_tx_id",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_seller",
                "type": "address"
            }
        ],
        "name": "release",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_seller",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_tx_id",
                "type": "uint256"
            }
        ],
        "name": "resolveToBuyer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_tx_id",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "balances",
        "outputs": [
            {
                "internalType": "address",
                "name": "buyer",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "locked",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "spent",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllTransactionIds",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_seller",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_tx_id",
                "type": "uint256"
            }
        ],
        "name": "transaction",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "transactionIds",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const tokenABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "allowance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "needed",
                "type": "uint256"
            }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "balance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "needed",
                "type": "uint256"
            }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "approver",
                "type": "address"
            }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "admin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];


const escrowAddress = '0xf8349183ba645c6F2DD977799fDF511c9e44147F';
const tokenAddress = "0x044908B461Cc72742e711eB3A31c1f47bdA81B61";


async function getTokenBalance(address, contractAddress, setTokenBalance) {
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

    const contract = new web3.eth.Contract(minABI, contractAddress);
    const balance = await contract.methods.balanceOf(address).call();
    setTokenBalance(web3.utils.fromWei(balance, 'ether'));
}

async function getTotalBalanceEscrow() {
    const web3 = new Web3(window.ethereum);
    const escrowContract = new web3.eth.Contract(escrowABI, escrowAddress);

    try {
        const totalBalance = await escrowContract.methods.totalBalance().call();
        console.log('Total Balance:', web3.utils.fromWei(totalBalance, 'ether'));
    } catch (error) {
        console.error('Error getting total balance:', error);
    }
}

async function callAccept(buyerAddress, amount) {
    const web3 = new Web3(window.ethereum);
    const numericAmount = web3.utils.toWei(amount, 'ether');

    const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
    const escrowContract = new web3.eth.Contract(escrowABI, escrowAddress);

    try {
        // ERC20トークンのapprove
        await tokenContract.methods.approve(escrowAddress, numericAmount).send({ from: buyerAddress });
        console.log('Token approved for escrow');

        // エスクローコントラクトのacceptメソッドを呼び出す
        const receipt = await escrowContract.methods.accept(buyerAddress, buyerAddress, numericAmount).send({ from: buyerAddress });
        console.log('Transaction receipt:', receipt);
        console.log('Transaction hash:', receipt.transactionHash);
    } catch (error) {
        console.error('Error in transaction:', error);
    }
}

async function connectWallet(setAccount, setBalance) {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            console.log('Connected', account);
            setAccount(account);
            getTokenBalance(account, "0x044908B461Cc72742e711eB3A31c1f47bdA81B61", setBalance);
        } catch (error) {
            console.error('User denied account access');
        }
    } else {
        alert('Please install MetaMask!');
    }
}

async function callRelease(txId, sellerAddress) {
    const web3 = new Web3(window.ethereum);
    const escrowContract = new web3.eth.Contract(escrowABI, escrowAddress);

    try {
        const receipt = await escrowContract.methods.release(txId, sellerAddress).send({ from: sellerAddress });
        console.log('Release transaction receipt:', receipt);
    } catch (error) {
        console.error('Error in release transaction:', error);
    }
}

async function callWithdraw(txId, account) {
    const web3 = new Web3(window.ethereum);
    const escrowContract = new web3.eth.Contract(escrowABI, escrowAddress);

    try {
        const receipt = await escrowContract.methods.withdraw(txId).send({ from: account });
        console.log('Withdraw transaction receipt:', receipt);
    } catch (error) {
        console.error('Error in withdraw transaction:', error);
    }
}

async function getAllTxIds() {
    const web3 = new Web3(window.ethereum);
    const escrowContract = new web3.eth.Contract(escrowABI, escrowAddress);

    try {
        const txIds = await escrowContract.methods.getAllTransactionIds().call();
        console.log('All Transaction IDs:', txIds);
    } catch (error) {
        console.error('Error getting all transaction IDs:', error);
    }
}

export default function WalletConnect() {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [input, setInput] = useState("");
    const [releaseTxId, setReleaseTxId] = useState('');
    const [withdrawTxId, setWithdrawTxId] = useState('');

    return (
        <div>
            {
                !account &&
                <button onClick={() => connectWallet(setAccount, setBalance)}>
                    Connect Wallet
                </button>
            }
            {account && <p>Connected Account: {account}</p>}
            {balance && <p>Balance: {balance} Token</p>}
            {account &&
                <div>
                    <div className='p-1'>
                        <input className="border" type='text' onChange={(e) => { setInput(e.target.value) }} placeholder="Enter amount"/>
                        <button className='bg-amber-100' onClick={() => { callAccept(account, input) }}>submit</button>
                    </div>
                    <div className='p-1'>
                        <input className="border" value={releaseTxId} onChange={(e) => setReleaseTxId(e.target.value)} placeholder="Enter tx_id" />
                        <button className='bg-amber-100' onClick={() => callRelease(releaseTxId, account)}>Release</button>
                    </div>
                    <div className='p-1'>
                        <input className="border" value={withdrawTxId} onChange={(e) => setWithdrawTxId(e.target.value)} placeholder="Enter tx_id" />
                        <button className='bg-amber-100' onClick={() => callWithdraw(withdrawTxId, account)}>Withdraw</button>
                    </div>
                    <div className='p-1'>
                        <button className='bg-amber-100' onClick={getTotalBalanceEscrow}>totalBalance</button>
                    </div>
                    <div className='p-1'>
                        <button className='bg-amber-100' onClick={getAllTxIds}>Get All Tx IDs</button>
                    </div>
                </div>
            }
        </div>
    );
}
