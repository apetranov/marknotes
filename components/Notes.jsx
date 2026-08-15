import React from 'react'

import Note from './Note';
export default function Notes({ 
    notes, 
    deleteNote,
    addTagsToNote,
    handleSetNotes
}) {
  return (
    <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {notes.map((note) => (
            <Note 
                key={note.id} 
                note={note}
                notes={notes}
                deleteNote={deleteNote}
                addTagsToNote={addTagsToNote}
                handleSetNotes={handleSetNotes}
            />
        ))}
      </div>
  )
}
