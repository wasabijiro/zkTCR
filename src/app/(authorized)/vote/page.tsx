// src/app/vote/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { lalezar } from "@/app/fonts";
import { useCredentialDB } from "@/libs/store/credentialDB";
import {
  readCredentialsCounter,
  readSchemaClaims,
  encryptWithMM,
  uploadEncryptedCredentialAndLeafToContract,
  ascii_to_hex,
  computeLeaf,
} from "@/libs/eth";
import { sleep } from "@/utils";

const Post = () => {
  const credentialSetup = useCredentialDB();

  const [status, setStatus] = useState<
    "notyet" | "encrypting" | "computing" | "uploading" | "zkp" | "done"
  >("notyet");

  const claimsArray = ["vote", "ethAddress", "balance", "weight", "val"];

  const credentialNumber = 1;

  const buttonName = () => {
    switch (status) {
      case "notyet":
        return "賛成";
      case "computing":
        return "Computing Voting Merkle Tree leaf";
      case "uploading":
        return "Uploading to contract";
      case "zkp":
        return "Generating ZK proof...";
      case "done":
        return "Done!";
    }
  };

  // const params = useParams();
  // const [vote, setVote] = useState(null); // ユーザーの投票を保存
  // const [voteResults, setVoteResults] = useState({ approve: 0, disapprove: 0 }); // 投票結果のダミーデータ
  // const [voters, setVoters] = useState([
  //   { name: "山田太郎", voteType: "approve" },
  //   { name: "鈴木花子", voteType: "disapprove" },
  //   // ... 他のダミーユーザー
  // ]); // 投票したユーザーのリスト
  // const list = [
  //   {
  //     title: "グリーンエネルギーのイノベーション",
  //     description: "再生可能エネルギー技術の最新動向と将来の可能性について。",
  //     id: "123",
  //   },
  //   {
  //     title: "持続可能な農業の推進",
  //     description: "環境に優しい農業方法と持続可能な食品生産に関する考察。",
  //     id: "234",
  //   },
  //   {
  //     title: "サステナブルな都市開発",
  //     description: "環境に配慮した都市計画とインフラストラクチャの構築。",
  //     id: "345",
  //   },
  //   {
  //     title: "廃棄物リサイクルの革新",
  //     description: "効率的な廃棄物管理とリサイクル技術の進化。",
  //     id: "456",
  //   },
  // ];
  // const currentItem = list.find((item) => item.id === params.id); // 現在のアイテムを検索

  // const handleVote = (voteType: any) => {
  //   // 確認ダイアログを表示
  //   const isConfirmed = confirm(
  //     `本当に${voteType === "approve" ? "賛成" : "反対"}しますか？`
  //   );
  //   if (isConfirmed) {
  //     setVote(voteType); // 投票結果を設定
  //     // 投票結果を更新（ダミーデータ）
  //     setVoteResults((prev) => ({
  //       ...prev,
  //       // @ts-ignore
  //       [voteType]: prev[voteType] + 1,
  //     }));
  //     // ここでバックエンドに投票を送信するロジックを実装
  //   }
  // };

  return (
    <>
      <div className="pt-3">
        <h2 className="text-center m-3 text-3xl"></h2>
        {/* {
          vote !== null && (
            <>
              <div className="text-center m-3">
                賛成: {voteResults.approve} 反対: {voteResults.disapprove}
              </div>
              <div className="m-3">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">名前</th>
                      <th className="border px-4 py-2">投票</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voters.map((voter, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{voter.name}</td>
                        <td className="border px-4 py-2">
                          {voter.voteType === "approve" ? "賛成" : "反対"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
          // 加えて、投票した人のリストがtable形式で表示されるようにしておいて、適当なデータを事前に作っといて、そこにuserを追加する感じでよろしく
        } */}
        <div className="flex">
          <div className="w-1/2">
            <img
              className="rounded-t-lg w-full h-auto"
              src="https://diamond-rm.net/wp-content/uploads/2021/02/main.jpg"
              alt=""
            />
          </div>
          <div className="w-1/2 p-4">
            <p>Title</p>
            <p>Description</p>
            {/* {vote === null && ( */}
            <div className="flex flex-row mt-4">
              <div className="m-2">
                <button
                  className={`mr-2 bg-green-500 text-white p-2 rounded  ${lalezar.className}`}
                  onClick={async () => {
                    // handleVote("approve");
                    console.log(credentialSetup.credentialJSON);
                    setStatus("computing");
                    const enc = encryptWithMM(
                      credentialSetup.walletPublicKey,
                      // @ts-ignore
                      credentialSetup.credentialJSON
                    );
                    console.log({ enc });
                    const leaf = computeLeaf(
                      // @ts-ignore
                      credentialSetup.credentialJSON,
                      claimsArray
                    );
                    console.log({ leaf });
                    setStatus("uploading");
                    setStatus("uploading");
                    await uploadEncryptedCredentialAndLeafToContract(
                      enc,
                      credentialSetup.credentialsDB,
                      leaf
                    );
                    console.log("upload success");
                    setStatus("zkp");
                    await sleep(5000);
                    // credentialSetup.generateProof(
                    //   credentialNumber,
                    //   credentialSetup.credentialJSON,
                    //   claimsArray,
                    //   credentialSetup.disclosureVector
                    // );
                    // console.log("proof generation success!");
                    setStatus("done");
                    // router.push("/verify");
                  }}
                >
                  {buttonName()}
                </button>
              </div>
              <div className="m-2">
                <button
                  className="bg-red-500 text-white p-2 rounded"
                  onClick={() => {
                    // handleVote("disapprove");
                  }}
                >
                  反対
                </button>
              </div>
            </div>
            {/* )} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
