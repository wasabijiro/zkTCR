"use client";

import { lalezar } from "@/app/fonts";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sleep } from "@/utils";

export default function AddTCRItemForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState<"not yet" | "loading" | "done">(
    "not yet"
  );

  const router = useRouter();

  const depositButtonName = () => {
    if (loading === "not yet") {
      return "Deposit TCR Token";
    } else if (loading === "loading") {
      return "Depositing...";
    } else {
      return "Done!";
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log({ title, description, link, image });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-10">
      <div className="mb-6">
        <label
          htmlFor="title"
          className="text-xl block mb-2 font-medium text-gray-900 dark:text-gray-300"
        >
          タイトル
        </label>
        <input
          type="text"
          id="title"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label
          htmlFor="description"
          className="text-xl block mb-2 font-medium text-gray-900 dark:text-gray-300"
        >
          説明
        </label>
        <textarea
          id="description"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label
          htmlFor="link"
          className="text-xl block mb-2 font-medium text-gray-900 dark:text-gray-300"
        >
          リンク
        </label>
        <input
          type="url"
          id="link"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label
          htmlFor="image"
          className="text-xl block mb-2 font-medium text-gray-900 dark:text-gray-300"
        >
          画像
        </label>
        <input
    type="file"
    id="image"
    className="block w-full text-md text-gray-900 bg-gray-50 rounded-lg border-2 border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none p-1"
    // 入力フィールドのフォントサイズを text-sm から text-md に変更し、ボーダーサイズを border から border-2 に、パディングを p-3 に増やします。
    onChange={(e: any) => setImage(e.target.files[0])}
    style={{height:"42px"}}
  />
      </div>
      <button
        type="submit"
        className={`border-2 bg-blue-600 text-white text-2xl rounded-lg px-8 py-2 hover:bg-blue-700 ${lalezar.className}`}
        onClick={async () => {
          setLoading("loading");
          await sleep(2000);
          setLoading("done");
          // router.push("/proof");
        }}
      >
        {depositButtonName()}
      </button>
    </form>
  );
}
