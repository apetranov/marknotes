'use client'
import React from 'react'
import { Button } from "@base-ui/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import parse from "html-react-parser";
import { useState } from 'react';

export default function Note({
    note,
    deleteNote,
    notes,
    handleSetNotes
}) {
    const [generatingTags, setGeneratingTags] = useState(false);

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
    
      if (notesCopy[i].id === noteId && !notesCopy[i].tags.length) {
        let response = await generateTags(notesCopy[i]);
        let tags = JSON.parse(response);
        console.log("tags:", tags);
        notesCopy[i].tags = tags;
        break;
      }
    }

    handleSetNotes(notesCopy);

    localStorage.setItem("notes", JSON.stringify(notesCopy));
  };
  return (
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
                {note.tags.map((tag, index) => (
                  <p key={index} className="text-center">{tag}</p>
                ))}
              </div>
            ) : (
              ""
            )}
          </div>
  )
}
