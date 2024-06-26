"use client"

import * as z from "zod"
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '../ui/textarea';
import { usePathname, useRouter } from 'next/navigation';
// import { updateUser } from '@/lib/actions/user.actions';
import { PostValidation } from '@/lib/validations/post';
import { createPost } from "@/lib/actions/post.actions";
import { useOrganization } from "@clerk/nextjs";

interface Props{
    user: {
        id:string;
        objectId:string;
        username:string;
        bio:string;
        image:string;
    };
    btnTitle:string;
}



function Post( {userId} : {userId:string}){
    const router = useRouter();
    const pathname = usePathname();
    const { organization } = useOrganization();

    const form =useForm({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            post: '',
            accountId: userId,
        }
    })

    const onSubmit= async (values: z.infer<typeof PostValidation>) => {
        await createPost({ text: values.post,
        author: userId,
        communityId: organization ? organization.id : null,
        path: pathname
      });

      router.push("/")
    }

    return (
        <Form {...form}>
        <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="mt-10 flex flex-col justify-start gap-10">
        <FormField
            control={form.control}
            name="post"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full gap-3 ">
                <FormLabel className="text-base-semibold text-light-2">
                    Content
                </FormLabel>
                <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                  <Textarea
                    rows={30}
                   {...field}
                   />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
        
            <Button type="submit" className="bg-primary-500">
                Post
            </Button>
        </form>
        </Form>
    )
}

export default Post;