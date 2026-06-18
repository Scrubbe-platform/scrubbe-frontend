import Button from "@/components/ui/Button1";
import { BlogPost } from "../types/index";
import { useRouter } from "next/navigation";

export default function PostCard({ post }: { post: BlogPost }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-start justify-between bg-white rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
      <div className="relative w-full aspect-[16/10] rounded-lg bg-zinc-100 overflow-hidden mb-5">
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100 to-zinc-200 flex items-center justify-center font-mono text-[11px] text-zinc-400">
          [Image Grid Item Asset]
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
          {post.category}
        </div>
        <h4 className="text-base font-bold tracking-tight text-zinc-900 line-clamp-2 hover:text-zinc-700 transition-colors cursor-pointer">
          {post.title}
        </h4>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500 line-clamp-3">
          {post.excerpt}
        </p>
      </div>

      <div className="mt-6 w-full pt-4 border-t border-zinc-100 flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-full flex items-center justify-center font-mono text-[9px] font-bold bg-blue-100 text-blue-600 shrink-0">
          {post.author.initials}
        </div>
        <div className="text-[11px]">
          <div className="font-semibold text-zinc-900">{post.author.name}</div>
        </div>
        <span className="ml-auto text-[10px] text-zinc-400 font-mono">
          {post.readingTime}
        </span>
      </div>

      <Button
        onClick={() => router.push(`/blog/${post.id}`)}
        variant="gradient"
        className="mt-4 border-none"
      >
        Read Article
      </Button>
    </div>
  );
}
