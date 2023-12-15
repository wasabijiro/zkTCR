"use client";

import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
// @ts-ignore
import { poseidon } from "circomlibjs";
import { useRouter } from "next/navigation";
import { lalezar } from "@/app/fonts";
import { useState } from "react";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { SUI_NETWORK } from "@/config/sui";
import { useCredentialDB } from "@/libs/store/credentialDB";
import { ETH_NETWORK } from "@/config/ethereum";
import { verifyProof, readSchemaClaims } from "@/libs/eth";
import { shortenAddress, veryShortenAddress, fewShortenAddress } from "@/utils";
import { sleep } from "@/utils";

const groth16 = require("snarkjs").groth16;

const sd_vec = [1, 0, 0, 0, 1];

export default function Page() {
  const router = useRouter();
  const zkLoginSetup = useZkLoginSetup();
  const credentialSetup = useCredentialDB();
  const [proofSuccess, setProofSuccess] = useState<boolean>(false);
  const [claimsArray, setClaimsArray] = useState<any | undefined>(undefined);
  const [vals, setVals] = useState<string[] | undefined>(undefined);
  const [loading, setLoading] = useState<"not yet" | "loading" | "done">(
    "not yet"
  );

  const buttonName = () => {
    if (loading === "not yet") {
      return "証明を検証";
    } else if (loading === "loading") {
      return "検証中...";
    } else {
      return "完了！";
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <p
        className={`text-center text-black text-2xl mb-4 ${lalezar.className}`}
      >
        検証
      </p>
      <button
        onClick={async () => {
          setLoading("loading");
          const proof = {
            proof: {
              pi_a: [
                "1170853024072213938159940120655047159943196465162238047675789731852419276793",
                "21224199748162409138940802393633551634039111208849337585842680564179573914985",
                "1",
              ],
              pi_b: [
                [
                  "9030297452470220853422533627567979358916518230019549634878575398964190188672",
                  "15586034495903375597038194191651310565227837371764719513355156853368287568223",
                ],
                [
                  "13666250404131356014244149539986603152461580924229332815340870605814898911997",
                  "4143331154184941116312933005881884472362232770733194698482023030195855704362",
                ],
                ["1", "0"],
              ],
              pi_c: [
                "10943392969612342668536493954951731736283939248749073918063793828141424875935",
                "8751316280561565910116232589234621453624507597583196928843871805489607653264",
                "1",
              ],
              protocol: "groth16",
              curve: "bn128",
            },
            publicSignals: [
              "49",
              "0",
              "0",
              "0",
              "3157558",
              "7247771334805344951059163574235126279108029145931476179493232073428537023556",
              "611019973103370789823427947434669346919351194545",
              "1",
              "0",
              "0",
              "0",
              "1",
            ],
          };
          const res: any = await verifyProof(
            // credentialSetup.proofPack,
            proof,
            credentialSetup.credentialsDB,
            credentialSetup.signer
          );

          console.log({ res });

          if (res.result === true) {
            setLoading("done");
            credentialSetup.setIsVerified(true);
          }

          //Get Claims in string char
          const claims = await readSchemaClaims(credentialSetup.credentialsDB);
          console.log({ claims });
          setClaimsArray(claims);
          const ethAddressIndex = claims.indexOf("ethAddress");
          var credentialVals: any = [];

          for (var i = 0; i < claims.length; i++) {
            var hex = res?.Input[i].slice(2);
            hex = hex.replace(/^0+/, "");

            if (i !== ethAddressIndex) {
              var str: string = "";
              for (var n = 0; n < hex.length; n += 2) {
                str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
              }
              credentialVals.push(str);
            } else {
              credentialVals.push("0x" + hex);
            }
          }
          setVals(credentialVals);
          if (res.result === true) {
            console.log("verify success");
            setProofSuccess(true);
            await sleep(3000);
            // router.push("/");
          }
        }}
        className="w-60 border-2 border-red-400 bg-white text-red-400 rounded-lg px-2 py-2 hover:bg-red-500 hover:text-white"
      >
        {buttonName()}
      </button>
      {credentialSetup.isVerified && (
        <div
          className={`flex justify-center text-black text-xs mt-4 ${lalezar.className}`}
        >
          証明の検証が成功しました！
        </div>
      )}
      {proofSuccess && claimsArray && (
        <div>
          <ul>
            {claimsArray.map((claimNames: any, index: any) => {
              return (
                <li
                  key={claimNames}
                  className={`text-center text-black text-lg mt-5 mb-3 ${lalezar.className}`}
                >
                  {claimNames} ={/* @ts-ignore */}
                  {/* {credentialSetup.disclosureVector[index] */}
                  {/* @ts-ignore */}
                  {sd_vec[index] ? vals[index] : `"Hidden"`}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
