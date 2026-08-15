"use client";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@base-ui/react";
import { useState, useEffect } from "react";
// import markdown from "@wcj/markdown-to-html";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkGemoji from "remark-gemoji";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import parse from "html-react-parser";
import { v4 } from "uuid";


// import remarkGfm from "remark-gfm";
// import remarkGemoji from "remark-gemoji";

import "github-markdown-css/github-markdown-dark.css";

import Link from "next/link";
import Notes from "@/components/Notes";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [markdownTxt, setMarkdownTxt] = useState("");
  const [mk, setMk] = useState("");
  
  // const [tags, setTags] = useState([]);

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");

    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  

  const deleteNote = (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  const createNote = () => {
    if (!mk) {
      alert("Note cannot be empty");
      return;
    }

    const newNote = {
      id: v4(),
      content: mk,
      tags: [],
    };

    setNotes(notes.concat(newNote));

    localStorage.setItem("notes", JSON.stringify(notes.concat(newNote)));

    setMk("");
    setMarkdownTxt("");
  };

  const renderMarkdown = async (value) => {
    // Conferts Markdown -> Markdown AST -> HTML AST -> HTML string.
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGemoji)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(value);

    return String(result);
  };

  const handleSetNotes = (notes) => {
    setNotes(notes);
  }

  return (
    <div className="flex flex-col justify-center items-center p-10 gap-10">
      <h1 className="font-black text-5xl md:text-7xl">
        <span className="text-green-600">Mark</span>Notes
      </h1>
      <h3>
        Check markdown syntax{" "}
        <Link
          className="text-blue-500 underline"
          target="_blank"
          href={"https://www.markdownguide.org/cheat-sheet/"}
        >
          here
        </Link>
      </h3>
      <h3>
        Check how to write emojis with markdown{" "}
        <Link
          className="text-blue-500 underline"
          target="_blank"
          href={"https://gist.github.com/rxaviers/7360908"}
        >
          here
        </Link>
      </h3>
      <h2 className="text-4xl">Note preview</h2>
      <div className="max-w-3/4 shadow-xl p-10 outline-1 outline-green-600 markdown-body">
        {parse(mk)}
      </div>
      <Textarea
        value={markdownTxt}
        onChange={async (e) => {
          const value = e.target.value;

          setMarkdownTxt(value);
          const html = await renderMarkdown(value);

          setMk(html);
        }}
      />
      <Button
        onClick={createNote}
        className="bg-black text-white py-1 px-4 rounded-2xl hover:bg-slate-600 cursor-pointer transition-all duration-200"
      >
        + Create Note
      </Button>

      <Notes 
        notes={notes} 
        deleteNote={deleteNote}
        handleSetNotes={handleSetNotes}
      />
    </div>
  );
}
