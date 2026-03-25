import { z } from "zod";
import { Calendar, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  TRANSACTION_FREQUENCY,
  TRANSACTION_CATEGORY,
  CATEGORIES,
  PAYMENT_METHODS,
  TRANSACTION_FREQUENCY_OPTIONS,
  TRANSACTION_CATEGORY_OPTIONS,
  MIN_TRANSACTION_DATE,
} from "@/constants/constants";
import { Switch } from "../ui/switch";
import CurrencyInputField from "../ui/currency-input";
import { SingleSelector } from "../ui/single-select";
import { toast } from "sonner";
import {
  useCreateTransactionMutation,
  useGetSingleTransactionQuery,
  useUpdateTransactionMutation,
} from "@/features/transaction/transactionAPI";
import { transactionFormSchema } from "@/validators/transactionValidators";
import { format } from "date-fns";
import { enIN } from "date-fns/locale";
import { useEffect } from "react";

type FormValues = z.infer<typeof transactionFormSchema>;

const TransactionForm = (props: {
  isEdit?: boolean;
  transactionId?: string;
  onCloseDrawer?: () => void;
}) => {
  const { onCloseDrawer, isEdit = false, transactionId } = props;

  const { data, isLoading } = useGetSingleTransactionQuery(
    transactionId || "",
    { skip: !transactionId },
  );
  const editData = data?.transaction;

  const [createTransaction, { isLoading: isCreating }] = useCreateTransactionMutation();

  const [updateTransaction, { isLoading: isUpdating }] = useUpdateTransactionMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      title: "",
      amount: "",
      type: TRANSACTION_CATEGORY.EXPENSE,
      category: "",
      date: new Date(),
      paymentMethod: "",
      isRecurring: false,
      frequency: null,
      description: "",
    },
  });

  useEffect(() => {
    if (isEdit && transactionId && editData) {
      form.reset({
        title: editData.title,
        amount: editData.amount.toString(),
        type: editData.type,
        category: editData.category,
        date: new Date(editData.date),
        paymentMethod: editData.paymentMethod,
        isRecurring: editData.isRecurring,
        frequency: editData.recurringInterval,
        description: editData.description,
      });
    }
  }, [editData, form, isEdit, transactionId]);

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    if (isCreating || isUpdating) return;
    const payload = {
      title: values.title,
      type: values.type,
      category: values.category,
      paymentMethod: values.paymentMethod,
      description: values.description || "",
      amount: Number(values.amount),
      date: values.date.toISOString(),
      isRecurring: values.isRecurring || false,
      recurringInterval: values.frequency || null,
    };

    const handleSuccess = () => {
      form.reset();
      onCloseDrawer?.();
      toast.success(
        isEdit
          ? "Transaction updated successfully"
          : "Transaction created successfully",
      );
    };

    const handleError = (error: any) => {
      const defaultErrMessage = isEdit
        ? "Failed to update transaction"
        : "Failed to create transaction";
      toast.error(error?.data?.message || error?.message || defaultErrMessage);
    };

    if (isEdit && transactionId) {
      updateTransaction({ id: transactionId, transaction: payload })
        .unwrap()
        .then(handleSuccess)
        .catch(handleError);
      return;
    }
    createTransaction(payload).unwrap().then(handleSuccess).catch(handleError);
  };

  return (
    <div className="relative pt-5 px-2.5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
          <div className="space-y-6">
            {/* Transaction Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!font-normal">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Transaction title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CurrencyInputField
                        {...field}
                        onValueChange={(value) => field.onChange(value || "")}
                        placeholder="₹0.00"
                        prefix="₹"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => {
                const getCategoryOption = () => {
                  if (!field.value) return undefined;
                  const found = CATEGORIES.find(opt => opt.value === field.value);
                  return found || { value: field.value, label: field.value };
                };

                return (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <SingleSelector
                      value={getCategoryOption()}
                      onChange={(option) => field.onChange(option.value)}
                      options={CATEGORIES}
                      placeholder="Select or type a category"
                      creatable
                    />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover modal={false}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: enIN })
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 !pointer-events-auto"
                      align="start"
                    >
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < MIN_TRANSACTION_DATE}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-[14.5px]">
                      Recurring Transaction
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      {field.value
                        ? "This will repeat automatically"
                        : "Set recurring to repeat this transaction"}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      className="cursor-pointer"
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue(
                            "frequency",
                            TRANSACTION_FREQUENCY.DAILY,
                          );
                        } else {
                          form.setValue("frequency", null);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("isRecurring") && form.getValues().isRecurring && (
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem className="recurring-control">
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger className="!capitalize">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRANSACTION_FREQUENCY_OPTIONS.map(
                          ({ value, label }) => (
                            <SelectItem
                              key={value}
                              value={value}
                              className="!capitalize"
                            >
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about this transaction"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-background pb-2">
            <Button
              type="submit"
              className="w-full !text-white"
              disabled={isCreating || isUpdating}
            >
              {(isCreating || isUpdating) && (
                <Loader className="h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Update" : "Save"}
            </Button>
          </div>

          {isLoading && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/70 dark:bg-background/70 z-50 flex justify-center">
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default TransactionForm;
