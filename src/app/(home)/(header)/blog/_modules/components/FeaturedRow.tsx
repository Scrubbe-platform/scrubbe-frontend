// app/blog/components/FeaturedRow.tsx
import Button from "@/components/ui/Button1";
import { BlogPost } from "../types/index";
import { BiRightArrow } from "react-icons/bi";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeaturedRowProps {
  post: BlogPost;
  imageRight?: boolean;
}

export default function FeaturedRow({
  post,
  imageRight = false,
}: FeaturedRowProps) {
  const router = useRouter();
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${imageRight ? "lg:direction-rtl" : ""}`}
    >
      {/* Visual Item Wrapper node */}
      <div
        className={`lg:col-span-6 w-full aspect-[4/3] rounded-xl bg-zinc-100 overflow-hidden relative border border-zinc-100 ${imageRight ? "lg:order-last" : ""}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-400 font-mono text-xs">
          {/* Mock graphics asset boundary container */}
          [Image: {post.title.slice(0, 20)}...]
        </div>
      </div>

      {/* Structured Text Descriptions Block */}
      <div className="lg:col-span-6 flex flex-col justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {post.category}
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 hover:text-zinc-700 transition-colors cursor-pointer">
          {post.title}
        </h3>

        <p className="mt-4 text-sm sm:text-base text-zinc-500 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Profile/Identity Segment metadata wrapper */}
        <div className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-6">
          <div className="h-8 w-8 rounded-full flex items-center justify-center font-mono text-[10px] font-bold text-blue-600 bg-blue-100 shrink-0 shadow-sm">
            {post.author.initials}
          </div>
          <div className="text-xs">
            <div className="font-semibold text-zinc-900">
              {post.author.name}
            </div>
            {post.author.role && (
              <div className="text-zinc-400 mt-0.5">{post.author.role}</div>
            )}
          </div>
          <span className="ml-auto text-[11px] font-medium text-zinc-400 font-mono whitespace-nowrap">
            {post.readingTime}
          </span>
        </div>

        {/* Custom Green Accent Execution buttons */}
        <div className="mt-6">
          <Button
            onClick={() => router.push(`/blog/${post.id}`)}
            rightIcon={<ArrowRight color="white" size={16} />}
            variant="gradient"
            className="border-none"
          >
            Read more
          </Button>
        </div>
      </div>
    </div>
  );
}
