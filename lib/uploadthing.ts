import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Image uploads for posts, announcements, member profiles
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      // Optional: Add auth check if needed
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl ?? file.url, ufsUrl: file.ufsUrl, key: file.key };
    }),

  // Document uploads for assistance requests
  documentUploader: f({
    pdf: { maxFileSize: "8MB" },
    image: { maxFileSize: "4MB" },
  })
    .middleware(async ({ req }) => {
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl ?? file.url, ufsUrl: file.ufsUrl, key: file.key, name: file.name };
    }),

  // Avatar/profile picture uploads
  avatarUploader: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl ?? file.url, ufsUrl: file.ufsUrl, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
