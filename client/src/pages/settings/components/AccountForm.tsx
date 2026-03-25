import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useTypedSelector } from "@/app/hook";
import { Loader } from "lucide-react";
import { useUpdateUserMutation } from "@/features/user/userAPI";
import { updateCredentials } from "@/features/auth/authSlice";
import { accountFormSchema } from "@/validators/userValidators";

type AccountFormValues = z.infer<typeof accountFormSchema>;

const AccountForm = () => {
  const dispatch = useAppDispatch();
  const { user } = useTypedSelector((state) => state.auth);

  const [updateUserMutation, { isLoading }] = useUpdateUserMutation();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const watchedName = form.watch("name");
  const watchedEmail = form.watch("email");

  const isNameModified = (watchedName || "") !== (user?.name || "");
  const isEmailModified = (watchedEmail || "") !== (user?.email || "");
  const isModified = isNameModified || isEmailModified;

  const onSubmit = (values: AccountFormValues) => {
    if (isLoading || !isModified) return;

    const payload: AccountFormValues = {};

    if (isNameModified && values.name) payload.name = values.name;
    if (isEmailModified && values.email) payload.email = values.email;

    updateUserMutation(payload)
      .unwrap()
      .then((response) => {
        dispatch(
          updateCredentials({
            user: {
              name: response.data.name,
              email: response.data.email,
            }
          })
        );
        toast.success("Account updated successfully");
      })
      .catch((error) => {
        toast.error(error.data.message || "Failed to update account");
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[500px]">
        <div className="flex flex-col items-start space-y-4">
          <FormLabel>Profile Picture</FormLabel>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.profilePicture || ""} />
              <AvatarFallback className="text-2xl">
                {form.watch("name")?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isLoading || !isModified} type="submit">
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          Update Account
        </Button>
      </form>
    </Form>
  );
}

export default AccountForm;