import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { Contract, ethers, Signer } from "ethers";
import { CREDENTIALS_DB_ADDRESS } from "@/config";
import CREDENTIAL_DB_ARTIFACT from "../../../artifacts/contracts/CredentialsDB.sol/CredentialsDB.json";
import type { credentisalState } from "@/types";
import { generateMerkleProof, generateZKProof } from "@/libs/eth";

export const useCredentialDB = create<credentisalState>((set, get) => ({
  credentialsDB: undefined,
  mercari_id: "114514",
  ethAddress: "",
  aptAddress:
    "0xf1cd67ef7061931e5668decdcbd558bee10358756e3115a07f22d583e3a309a7",
  suiAddress:
    "0xddbfeeb9f8704eca37f6c421fe1036cfe85de398c37a8fc9760e9cbf2da8fe03",
  walletPublicKey: "",
  // credentialJSON: {
  //   claims: {
  //     mercari_id: get().mercari_id,
  //     ethAddress: get().ethAddress,
  //     aptAddress: get().aptAddress,
  //     suiAddress: get().suiAddress,
  //     merAddress:
  //       "0x22b022481a2a4162efd03910d81cb4aa66dcb96071c9743d0773d336389dfae1",
  //   },
  // },
  credentialJSON: undefined,
  provider: undefined,
  signer: undefined,
  proofPack: {
    proof: "",
    publicSignals: "",
  },
  disclosureVector: [],
  isVerified: false,
  connectAccount: async () => {
    // @ts-ignore
    if (window.ethereum) {
      // @ts-ignore
      const accounts = await window.ethereum.request!({
        method: "eth_requestAccounts",
      });
      // @ts-ignore
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      if (provider) {
        const abi = new ethers.utils.Interface(CREDENTIAL_DB_ARTIFACT.abi);
        const creDB = new ethers.Contract(CREDENTIALS_DB_ADDRESS, abi, signer);
        console.log({ creDB });
        set({ credentialsDB: creDB });
      }
      // @ts-ignore
      set({ ethAddress: accounts[0] });
      set({ provider: provider });
      set({ signer: signer });
    }
  },
  getPubKeyFromMM: async (walletAddress: string) => {
    // @ts-ignore
    if (window.ethereum) {
      // @ts-ignore
      const keyB64 = (await window.ethereum.request!({
        method: "eth_getEncryptionPublicKey",
        params: [walletAddress],
      })) as string;
      console.log({ keyB64 });
      //if you want base 64 encoded
      set({ walletPublicKey: keyB64 });
      //if you want the decoded form bytes32 like
      //return ethers.utils.base64.decode(keyB64)
    }
  },
  generateProof: async (
    credentialNumber: number,
    credentialJSON: any,
    claimsArray: any,
    disclosureVector: any
  ) => {
    const merkleProof = await generateMerkleProof(
      get().credentialsDB,
      credentialNumber
    );
    console.log({ merkleProof });
    const { proof, publicSignals } = await generateZKProof(
      credentialJSON,
      claimsArray,
      merkleProof,
      disclosureVector
    );

    const proofPack = {
      proof: proof,
      publicSignals: publicSignals,
    };

    console.log({ proofPack });

    set({ proofPack: proofPack });
  },
  setDisclosureVector: (disclosureVector: number[]) => {
    set({ disclosureVector: disclosureVector });
  },
  setCredentialJSON: (credentialJSON: any) => {
    set({ credentialJSON: credentialJSON });
  },
  setSuiAddress: (address: string) => {
    set({ suiAddress: address });
  },
  setAptosAddress: (address: string) => {
    set({ aptAddress: address });
  },
  setIsVerified: (isVerified: boolean) => {
    set({ isVerified: isVerified });
  },
  getInfo: () => ({
    // @ts-ignore
    credentialsDB: get().credentialsDB,
    // @ts-ignore
    ethAddress: get().ethAddress,
    // @ts-ignore
    walletPublicKey: get().walletPublicKey,
    // @ts-ignore
    provider: get().provider,
    // @ts-ignore
    signer: get().signer,
  }),
}));
