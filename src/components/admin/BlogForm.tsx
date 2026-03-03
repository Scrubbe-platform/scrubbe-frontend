"use client";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Input from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { LuUpload, LuX } from "react-icons/lu";
import CButton from "../ui/Cbutton";

const TagSchema = z
  .string()
  .min(2, "Tags must be at least 2 characters long (e.g., #a).")
  .max(50, "Tags cannot exceed 50 characters.")
  // Optionally, enforce a format like starting with '#' if your backend requires it
  .regex(
    /^#?[\w\d]+(?:-[\w\d]+)*$/i,
    "Tags can only contain letters, numbers, and hyphens, and may start with a #."
  );

// Define a schema for the file upload (Cover Image)
// NOTE: Zod cannot directly validate the file content (like size or type) in a typical browser `File` object
// without custom logic or using it on the server (where it might be a different object type).
// Here, we focus on validating the existence of a file selection.
const CoverImageSchema = z
  .any()
  .refine(
    (file) => file instanceof File || file === null || file === undefined,
    "Cover Image must be a file."
  )
  .optional(); // Making it optional based on the UI, but you might want to make it required.

// The main Zod schema for the entire blog post form
export const NewPostSchema = z.object({
  // 1. Title
  title: z
    .string()
    .min(5, "The post title must be at least 5 characters long.")
    .max(100, "The post title cannot exceed 100 characters."),

  // 2. Blog Content
  blogContent: z
    .string()
    // Assuming rich text/HTML is stripped/cleaned before validation,
    // this min length applies to the effective text content.
    .min(50, "The blog content must be at least 50 characters long."),
  // No explicit max, but you might want to add one (e.g., max 10000 characters)
  // .max(10000, "The blog content cannot exceed 10,000 characters."),

  tags: z
    .array(TagSchema)
    .min(1, "Please add at least one tag.") // Enforce at least one tag for better discoverability
    .max(10, "You can add a maximum of 10 tags.") // Limit the number of tags
    .optional(), // Make the whole array optional if you allow posts without tags

  // 4. SEO Slug
  // The UI says "Auto generated from Title," but if you allow manual override,
  // it should be validated as a URL-safe string.
  seoSlug: z
    .string()
    .min(3, "The SEO slug must be at least 3 characters long.")
    .max(120, "The SEO slug cannot exceed 120 characters.")
    // Enforce URL-friendly format: lowercase, letters, numbers, and hyphens only
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "The SEO slug must be URL-safe (lowercase letters, numbers, and hyphens)."
    )
    .optional(), // Optional, as it's auto-generated

  // 5. Cover Image
  coverImage: CoverImageSchema,
});

type NewPostType = z.infer<typeof NewPostSchema>;
const BlogForm = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const {
    control,
    handleSubmit,
    // watch,
    setValue,
    formState: { errors },
  } = useForm<NewPostType>({
    resolver: zodResolver(NewPostSchema),
    defaultValues: {
      title: "",
      blogContent: "",
      tags: [],
    },
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue("tags", newTags);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
  };

  const handleSubmitBlog = () => {
    console.log(featuredImage);
  };
  return (
    <form
      onSubmit={handleSubmit(handleSubmitBlog)}
      className="flex flex-col gap-5"
    >
      <p className=" text-3xl font-bold">Create New Blog</p>

      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Title"
            placeholder="Enter blog post title"
            required
            error={errors.title?.message}
          />
        )}
      />
      <Controller
        name="blogContent"
        control={control}
        render={({ field }) => (
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Content <span className="text-red-500">*</span>
            </label>
            <MDEditor
              value={field.value}
              onChange={(value) => field.onChange(value || "")}
              style={{
                backgroundColor: "white",
                color: "black",
              }}
              previewOptions={{
                rehypePlugins: [[rehypeSanitize]],
              }}
              height={400}
              textareaProps={{
                placeholder: "Write your blog post content in Markdown...",
              }}
              preview="edit"
              enableScroll
            />
            {errors.blogContent && (
              <p className="mt-1 text-sm text-red-600">
                {errors.blogContent.message}
              </p>
            )}
          </div>
        )}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
          Tags
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            placeholder="Enter a tag"
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 dark:border-zinc-600 dark:bg-themeBg-50 dark:text-white"
          />
          <CButton className=" !w-fit" type="button" onClick={addTag}>
            Add Tag
          </CButton>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-primary-800 dark:bg-primary-900/20 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-1 text-xs dark:text-primary-400"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-primary-600"
                >
                  <LuX size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
          Featured Image
        </h3>

        {!imagePreview ? (
          <div className="rounded-lg border-2 border-dashed border-neutral-300 p-6 text-center dark:border-zinc-600">
            <LuUpload className="mx-auto h-12 w-12 text-neutral-400" />
            <div className="mt-4">
              <label htmlFor="featured-image" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-neutral-900 dark:text-white">
                  Upload featured image
                </span>
                <span className="mt-1 block text-xs text-neutral-500">
                  PNG, JPG, GIF up to 10MB
                </span>
              </label>
              <input
                id="featured-image"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Featured image preview"
              className="h-64 w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <LuX size={16} />
            </button>
          </div>
        )}
      </div>

      <Controller
        name="seoSlug"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="SEO Title"
            placeholder="SEO optimized title"
          />
        )}
      />
    </form>
  );
};

export default BlogForm;
