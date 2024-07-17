import React from 'react';

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    labels: string[];
  };
  onClick: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md m-2 w-full md:w-1/3 lg:w-1/5 cursor-pointer  flex flex-col justify-between" onClick={onClick}>
      <h3 className="font-semibold text-xl mb-2">{note.title}</h3>
      <p className="text-gray-700 mb-2 overflow-hidden text-ellipsis whitespace-pre-wrap break-words max-h-32">{note.content}</p>
      <div className="flex flex-wrap">
        {note.labels.map((label, index) => (
          <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NoteCard;
