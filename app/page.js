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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// import remarkGfm from "remark-gfm";
// import remarkGemoji from "remark-gemoji";

import "github-markdown-css/github-markdown-dark.css";

import Link from "next/link";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [markdownTxt, setMarkdownTxt] = useState("");
  const [mk, setMk] = useState("");
  const [generatingTags, setGeneratingTags] = useState(false);
  // const [tags, setTags] = useState([]);

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");

    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const generateTags = async (note) => {
    setGeneratingTags(true);

    try {
      const response = await fetch("/api/generate-tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: note.content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate tags");
      }
      console.log("data tags: ", data.tags);
      return data.tags;
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingTags(false);
    }
  };

  const addTagsToNote = async (noteId) => {
    const notesCopy = [...notes];

    // notesCopy.forEach((note) => {
    //   if (note.id === noteId) {
    //     let tags = [generateTags(note)];
    //     console.log("Tags: ", tags);
    //     note.tags = tags;
    //   }
    // });

    for (let i = 0; i < notesCopy.length; i++) {
      if (notesCopy[i].id === noteId) {
        let response = await generateTags(notesCopy[i]);
        let tags = JSON.parse(response);
        console.log("tags:", tags);
        notesCopy[i].tags = tags;
        break;
      }
    }

    setNotes(notesCopy);

    localStorage.setItem("notes", JSON.stringify(notesCopy));
  };

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

  return (
    <div className="flex flex-col justify-center items-center p-10 gap-10">
      <h1 className="font-black text-7xl">
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
      <div className="shadow-xl p-10 outline-1 outline-green-600 markdown-body">
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

      <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {notes.map((note) => (
          <div key={note.id} className="markdown-body p-5 space-y-5">
            <Dialog>
              <DialogTrigger className="bg-red-900 rounded-lg px-7 py-2 cursor-pointer hover:bg-red-700 transition-all duration-300">
                Delete
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>
                    Are you sure you want to delete this note?
                  </DialogTitle>
                </DialogHeader>
                <Button
                  onClick={() => deleteNote(note.id)}
                  className="cursor-pointer bg-slate-900 text-white w-1/3 rounded-lg py-2 px-5 hover:bg-slate-700 transition-all duration-200"
                >
                  Yes, delete
                </Button>
              </DialogContent>
            </Dialog>
            {parse(note.content)}
            <button
              onClick={() => addTagsToNote(note.id)}
              disabled={generatingTags}
              className="hover:bg-orange-400 hover:text-white cursor-pointer transition-all duration-200 bg-white text-black py-2 px-4 rounded-lg"
            >
              ✨{generatingTags ? "Generating..." : "Generate tags"}
            </button>
            {note.tags.length ? (
              <div className="grid grid-cols-4 gap-2">
                {note.tags.map((tag) => (
                  <p className="text-center">{tag}</p>
                ))}
              </div>
            ) : (
              ""
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
