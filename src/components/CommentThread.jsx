export default function CommentThread({ comments = [] }) {
  if (comments.length === 0) return null;

  return (
    <div className="space-y-2">
      {comments.map((c) => (
        <div
          key={c.id}
          className={`text-sm rounded-md px-3 py-2 border ${
            c.role === "Reviewer" ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <p className="text-xs font-medium mb-0.5">
            {c.author} · {c.role} · {c.createdAt}
          </p>
          <p>{c.text}</p>
        </div>
      ))}
    </div>
  );
}
