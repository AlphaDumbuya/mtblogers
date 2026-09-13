import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.url, key: file.key };
  }),

  documentUploader: f({
    pdf: { maxFileSize: "8MB" },
    image: { maxFileSize: "4MB" },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.url, key: file.key, name: file.name };
  }),

  avatarUploader: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.url, key: file.key };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
