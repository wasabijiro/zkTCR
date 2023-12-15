"use client";

import Card from "@/components/List/Card";

export default function Main({ page }: { page?: String | null }) {
  const list = [
    {
      title: "グリーンエネルギーのイノベーション",
      description: "再生可能エネルギー技術の最新動向と将来の可能性について。",
      link: page ? `/${page}/123` : "#",
    },
    {
      title: "持続可能な農業の推進",
      description: "環境に優しい農業方法と持続可能な食品生産に関する考察。",
      link: page ? `/${page}/234` : "#",
    },
    {
      title: "サステナブルな都市開発",
      description: "環境に配慮した都市計画とインフラストラクチャの構築。",
      link: page ? `/${page}/345` : "#",
    },
    {
      title: "廃棄物リサイクルの革新",
      description: "効率的な廃棄物管理とリサイクル技術の進化。",
      link: page ? `/${page}/456` : "#",
    },
  ];

  return (
    <main className="main flex flex-wrap">
      {list.map((item, index) => (
        <Card
          key={index}
          title={item.title}
          description={item.description}
          link={item.link}
        />
      ))}
    </main>
  );
}
