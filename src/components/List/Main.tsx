"use client";

import Card from "@/components/List/Card";

export default function Main({ page }: { page?: String | null }) {
  const list = [
    {
      title:"エコフレンドリーな竹製コーヒーカップ",
      description:"この再利用可能なコーヒーカップは竹繊維で作られており、安全な蓋と耐熱スリーブが付いています。自然な色合いと地球の色を基調としたパレットに、小さな葉のモチーフが特徴です。",
      path:"/bamboocap.png",
      link:"#"
    },
    {
      title:"太陽光発電のポータブルチャージャー",
      description:"このスタイリッシュなデザインのポータブルチャージャーは太陽光で充電でき、コンパクトでリサイクル素材を使用しています。黒と緑の色使いがエコフレンドリーさを強調しており、晴れた屋外の背景が太陽光充電機能を際立たせています。",
      path:"/battery.png",
      link:"#"
    },
    {
      title:"リサイクルプラスチックボトル製エコトートバッグ",
      description:"このトートバッグはリサイクルされたプラスチックボトルから作られており、耐久性があり軽量です。カラフルなデザインは海のテーマで、海洋生物のイラストが特徴です。背景のビーチ設定は、海と海洋保護とのつながりを強調しています。",
      path:"/bag.png",
      link:"#"
    }
  ];

  return (
    <main className="main flex flex-wrap">
      {list.map((item, index) => (
        <Card
          key={index}
          title={item.title}
          description={item.description}
          link={item.link}
          path={item.path}
        />
      ))}
    </main>
  );
}
