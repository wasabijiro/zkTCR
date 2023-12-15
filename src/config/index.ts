import { OpenIdProvider } from "@/types";

export const ZKLOGIN_ACCONTS = `zklogin-demo.accounts`;

export const openIdProviders: OpenIdProvider[] = [
  "Google",
  // "Twitch",
  // "Facebook",
];

export const PACKAGE_ID =
  "0x768d79edd9f06e5865356e57aa9fec4d7c2a5b450beec58a213c0578d849a48c";

export const NFT_INDEX_ID =
  "0x89ba4a352f8aee8c353988258c20130b5ac4513f6c8f8f7df73a1b746af01fda";

export const NFT_TYPE = `${PACKAGE_ID}::issuer::DriveNFTId`;

export const CLOCK_ID = "0x6";

export const driveObjectType = `${PACKAGE_ID}::nft::DriveNFT`;

export const CREDENTIALS_DB_ADDRESS =
  "0xBd8b0BDe561E8bBa934F2eB6B03d7C5A5bbD478a";

export const escrowAddress = "0xf8349183ba645c6F2DD977799fDF511c9e44147F";
export const tokenAddress = "0x044908B461Cc72742e711eB3A31c1f47bdA81B61";
