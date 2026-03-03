import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/input";
import useAuthStore from "@/lib/stores/auth.store";
import { useCommunityAuth } from "@/lib/stores/useCommunityAuth";
import { Heart } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { BsSendFill } from "react-icons/bs";
import { FaHeart, FaRegCommentDots } from "react-icons/fa";
import {
  IoBookmark,
  IoBookmarkOutline,
  IoShareSocialSharp,
} from "react-icons/io5";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MessageContent = ({ post }: { post: any }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isComment, setIsComment] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuthStore();
  const { setOpen } = useCommunityAuth();

  const authGuard = (fn: () => void) => {
    if (!user) {
      setOpen(true, "signin");
    } else {
      fn();
    }
  };
  return (
    <div className="p-4 rounded-xl bg-white border-neutral-100 border flex flex-col gap-3">
      <div className="flex justify-between ">
        <div className="flex gap-2">
          <div className="size-10 rounded-full bg-IMSLightGreen text-white flex justify-center items-center text-sm font-bold uppercase">
            {post?.user?.fullname[0]}.{post?.user?.fullname.split(" ")[1][0]}
          </div>
          <div>
            <p className=" font-medium capitalize">{post?.user?.fullname}</p>{" "}
            <p className=" text-neutral-600">{post?.user?.role}</p>
          </div>
        </div>
        <p className=" text-sm text-neutral-500">
          {moment(post?.createdAt).fromNow(true)}
        </p>
      </div>

      <div>
        <p className=" text-base">{post?.message}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {post?.tags?.map((tag: string, index: number) => (
          <div
            className=" px-4 py-2 bg-neutral-100 text-neutral-600 text-sm rounded-md"
            key={index}
          >
            {tag}
          </div>
        ))}
      </div>

      <div className=" border-t border-neutral-300 flex flex-wrap gap-5 p-3">
        <div className=" text-base flex flex-nowrap gap-1 items-center cursor-pointer">
          <div onClick={() => authGuard(() => setIsLiked((prev) => !prev))}>
            {isLiked ? (
              <FaHeart size={17} className=" text-rose-600" />
            ) : (
              <Heart size={17} />
            )}
          </div>
          <span>Like ({post?.likes})</span>
        </div>
        <div
          onClick={() => setIsComment((prev) => !prev)}
          className=" text-base flex flex-nowrap gap-1 items-center cursor-pointer"
        >
          <FaRegCommentDots size={17} />
          <span>Comments ({post?.comments?.length})</span>
        </div>
        <div className=" text-base flex flex-nowrap gap-1 items-center cursor-pointer">
          <IoShareSocialSharp size={17} />
          <span>Share</span>
        </div>
        <div
          onClick={() => authGuard(() => setIsSaved((prev) => !prev))}
          className=" text-base flex flex-nowrap gap-1 items-center cursor-pointer"
        >
          {isSaved ? <IoBookmark size={17} /> : <IoBookmarkOutline size={17} />}
          <span>Save</span>
        </div>
      </div>

      {isComment && (
        <div className="p-3 rounded-lg bg-neutral-50 flex flex-col gap-4">
          {post?.comments?.length > 0 ? (
            <>
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                post?.comments?.map((comment: any, index: number) => (
                  <MessageContent post={comment} key={index} />
                ))
              }
            </>
          ) : (
            <EmptyState
              title="No Comments yet"
              description="Be the first to comment on this post"
            />
          )}

          <div className="flex gap-4">
            <div onClick={() => authGuard(() => {})} className=" flex-1">
              <Input placeholder="Write a comment" />
            </div>
            <div className=" size-[42px] rounded-lg bg-IMSLightGreen text-white flex justify-center items-center">
              <BsSendFill />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContent;
