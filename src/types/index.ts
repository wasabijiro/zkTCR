import { Contract, ethers, Signer } from "ethers";
import { Web3Provider } from "@ethersproject/providers";

export type ZKProof = {
  proofPoints: {
    a: string[];
    b: string[][];
    c: string[];
  };
  issBase64Details: {
    value: string;
    indexMod4: number;
  };
  headerBase64: string;
};

export type Account = {
  provider: string;
  userAddr: string;
  zkProofs: ZKProof;
  ephemeralPublicKey: string;
  ephemeralPrivateKey: string;
  userSalt: string;
  sub: string;
  aud: string;
  maxEpoch: number;
  randomeness: string;
};

// Setup for issuing json rpc calls to the gas station for sponsorship.
export interface SponsoredTransaction {
  txBytes: string;
  txDigest: string;
  signature: string;
  expireAtTime: number;
  expireAfterEpoch: number;
}
export type SponsoredTransactionStatus = "IN_FLIGHT" | "COMPLETE" | "INVALID";

export interface SponsorRpc {
  gas_sponsorTransactionBlock(
    txBytes: string,
    sender: string,
    gasBudget: number
  ): SponsoredTransaction;
  gas_getSponsoredTransactionBlockStatus(
    txDigest: string
  ): SponsoredTransactionStatus;
}

export type OpenIdProvider = "Google" | "Twitch" | "Facebook";

export type SetupData = {
  provider: OpenIdProvider;
  maxEpoch: number;
  randomness: string;
  ephemeralPublicKey: string;
  ephemeralPrivateKey: string;
};

export type zkLoginState = SetupData & {
  beginZkLogin: (provider: OpenIdProvider) => void;
  completeZkLogin: (account: Account) => void;
  initZkLogin: () => void;
  nonce: string;
  loginUrl: () => string;
  userAddr: string;
  jwt: string;
  aud: string;
  sub: string;
  salt: () => string;
  getJwt: () => void;
  zkProofs: any;
  account: () => Account;
  isProofsLoading: boolean;
};

export type AccountData = {
  provider: OpenIdProvider;
  userAddr: string;
  zkProofs: any; // TODO: add type
  ephemeralPublicKey: string;
  ephemeralPrivateKey: string;
  userSalt: string;
  sub: string;
  aud: string;
  maxEpoch: number;
};

export type credentisalState = {
  credentialsDB: Contract | undefined;
  mercari_id: string;
  ethAddress: string;
  aptAddress: string;
  suiAddress: string;
  walletPublicKey: string;
  credentialJSON:
    | {
        claims: { [x: string]: string };
      }
    | undefined;
  provider: Web3Provider | undefined;
  signer: Signer | undefined;
  proofPack: {
    proof: any;
    publicSignals: any;
  };
  disclosureVector: number[] | undefined;
  isVerified: boolean;
  connectAccount: () => void;
  getPubKeyFromMM: (walletAddress: string) => void;
  generateProof: (
    credentialNumber: number,
    credentialJSON: any,
    claimsArray: any,
    disclosureVector: any
  ) => void;
  setDisclosureVector: (disclosureVector: number[]) => void;
  setSuiAddress: (address: string) => void;
  setAptosAddress: (address: string) => void;
  setCredentialJSON: (credentialJSON: any) => void;
  setIsVerified: (isVerified: boolean) => void;
  getInfo: () => void;
};
