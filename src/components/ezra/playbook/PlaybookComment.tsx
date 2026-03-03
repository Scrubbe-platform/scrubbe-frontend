import { useState } from "react";

const mockComments = [
  {
    id: 1,
    message:
      "I came across the threat details . David really wanted to hack into the account",
    author: "Analyst 1",
    time: "2025-05-29 12:39:25",
  },
  {
    id: 2,
    message: "Hmms, that’s kind of suspicious",
    author: "Manager 1",
    time: "2025-05-29 12:39:25",
  },
  {
    id: 3,
    message: "Let’s see what we can do about it",
    author: "Analyst 1",
    time: "2025-05-29 12:39:25",
  },
];

const PlaybookComment = () => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(mockComments);
  return (
    <div className="dark:bg-gray-900 bg-gray-50 rounded-2xl p-6 h-full">
      <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto">
        {comments.map((c) => (
          <div
            key={c.id}
            className={`dark:bg-gray-800 bg-white border-l-4 border-blue-400 rounded-xl px-6 py-4 shadow-sm`}
          >
            <div className="font-semibold dark:text-white text-gray-800 mb-1">
              {c.message}
            </div>
            <div className="text-gray-500 text-sm">
              By {c.author} at {c.time}
            </div>
          </div>
        ))}
      </div>
      <div className="mb-4">
        <div className="font-semibold dark:text-white text-gray-800 mb-2">
          Add comment
        </div>
        <textarea
          className="w-full min-h-[80px] bg-transparent border dark:text-white border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none text-gray-800"
          placeholder="Enter your comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        className="px-8 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        type="button"
        onClick={() => {
          setComments([
            ...comments,
            {
              id: comments.length + 1,
              message: comment,
              author: "You",
              time: new Date().toISOString(),
            },
          ]);
          setComment("");
        }}
      >
        Add Comment
      </button>
    </div>
  );
};

export default PlaybookComment;
