'use client'
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@base-ui/react";
import { useState, useEffect } from "react";
import markdown from "@wcj/markdown-to-html";
import parse from "html-react-parser"
import Link from "next/link";

export default function Home() {
  const [markdownTxt, setMarkdownTxt] = useState('');
  const [mk, setMk] = useState('');

  return (
    <div className="flex flex-col justify-center items-center p-10 gap-10">
      <h1 className="font-black text-7xl"><span className="text-green-600">Mark</span>Notes</h1>
      <h3>Check markdown syntax <Link className="text-blue-500 underline" target="_blank" href={"https://www.markdownguide.org/cheat-sheet/"}>here</Link></h3>
      <h2 className="text-4xl">Note preview</h2>
      <div className="shadow-xl p-10 outline-1 outline-green-600 markdown-body">
          {parse(mk)}
      </div>
      <Textarea 
        value={markdownTxt}
        onChange={(e) => {
          setMarkdownTxt(e.target.value);
          setMk(markdown(e.target.value));
        }}
      />
      <Button className="bg-black text-white py-1 px-4 rounded-2xl">+ Create Note</Button>
    </div>
  );
}
