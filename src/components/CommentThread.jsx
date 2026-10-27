const STYLES = {
  Reviewer: "bg-red-50 border-red-200 text-red-700",
  Translator: "bg-blue-50 border-blue-200 text-blue-800",
  Admin: "bg-amber-50 border-amber-200 text-amber-800",
};

export default function CommentThread({ comments = [], viewerRole }) {
  if (comments.length === 0) return null;

  return (
    <div className="space-y-2">
      {comments.map((c) => {
        const showOwnerText = c.role === "Admin" && viewerRole === "Content Owner" && c.ownerText;
        return (
          <div key={c.id} className={`text-sm rounded-md px-3 py-2 border ${STYLES[c.role] || STYLES.Translator}`}>
            <p className="text-xs font-medium mb-0.5">
              {c.role === "Admin" ? "Admin" : `${c.author} · ${c.role}`} · {c.createdAt}
            </p>
            <p>{showOwnerText ? c.ownerText : c.text}</p>
          </div>
        );
      })}
    </div>
  );
}
