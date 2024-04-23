// Resource: https://docs.uploadthing.com/api-reference/react#generatereacthelpers
// Copy paste (be careful with imports)

import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { updateUser } from "@/lib/actions/user.actions";

export const { useUploadThing, uploadFiles } = 
generateReactHelpers<OurFileRouter>();