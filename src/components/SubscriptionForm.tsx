import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Subscription } from "@/types";
import { DEFAULT_CURRENCY, parseDueDate } from "@/lib/subscriptions";
import { NO_BRAND, brandSearchValue, brandsByCategory, detectBrand, findBrand, matchesBrandSearch } from "@/lib/brands";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SubscriptionIcon } from "@/components/SubscriptionIcon";
import { useEffect, useState } from "react";

const CURRENCIES = [
    { value: "INR", label: "INR - Indian Rupee" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "CHF", label: "CHF - Swiss Franc" },
    { value: "CNY", label: "CNY - Chinese Yuan" },
];

const formSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters." }),
  price: z.coerce
    .number({ invalid_type_error: "Enter a valid price." })
    .min(0, { message: "Price cannot be negative." }),
  currency: z.string().default(DEFAULT_CURRENCY),
  category: z.string().optional(),
  brand: z.string().default(NO_BRAND),
  billing_cycle: z.enum(["monthly", "yearly", "one-time"]),
  next_due_date: z.date({ required_error: "A due date is required." }),
});

export type SubscriptionFormValues = z.infer<typeof formSchema>;

interface SubscriptionFormProps {
  subscription?: Subscription | null;
  onSave: (data: SubscriptionFormValues) => void;
  isSaving: boolean;
}

export function SubscriptionForm({ subscription, onSave, isSaving }: SubscriptionFormProps) {
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      currency: DEFAULT_CURRENCY,
      category: "",
      brand: NO_BRAND,
      billing_cycle: "monthly",
    },
  });

  // The logo follows the typed name until the user picks one themselves.
  const [brandChosenByUser, setBrandChosenByUser] = useState(false);
  const [brandPickerOpen, setBrandPickerOpen] = useState(false);
  const name = form.watch("name");

  useEffect(() => {
    if (!brandChosenByUser) form.setValue("brand", detectBrand(name) ?? NO_BRAND);
  }, [name, brandChosenByUser, form]);

  useEffect(() => {
    if (subscription) {
      form.reset({
        name: subscription.name,
        price: subscription.price,
        currency: subscription.currency || DEFAULT_CURRENCY,
        category: subscription.category || "",
        brand: subscription.brand ?? detectBrand(subscription.name) ?? NO_BRAND,
        billing_cycle: subscription.billing_cycle as "monthly" | "yearly" | "one-time",
        next_due_date: parseDueDate(subscription.next_due_date) ?? undefined,
      });
      // A saved logo that differs from what the name suggests was a deliberate choice.
      setBrandChosenByUser(
        subscription.brand != null && subscription.brand !== (detectBrand(subscription.name) ?? NO_BRAND)
      );
    } else {
      form.reset({
        name: "",
        price: 0,
        currency: DEFAULT_CURRENCY,
        category: "",
        brand: NO_BRAND,
        billing_cycle: "monthly",
        next_due_date: undefined,
      });
      setBrandChosenByUser(false);
    }
  }, [subscription, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Netflix" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => {
            const selected = findBrand(field.value);
            const choose = (value: string) => {
              setBrandChosenByUser(true);
              field.onChange(value);
              setBrandPickerOpen(false);
            };
            return (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <Popover open={brandPickerOpen} onOpenChange={setBrandPickerOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={brandPickerOpen}
                        className="h-11 w-full justify-between bg-background/60 px-3.5 font-normal"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          {selected ? (
                            <>
                              <SubscriptionIcon name={selected.label} brand={selected.id} size="sm" className="h-6 w-6 rounded-md" />
                              <span className="truncate">{selected.label}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">No logo (initials)</span>
                          )}
                        </span>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command filter={matchesBrandSearch}>
                      <CommandInput placeholder="Search brands" />
                      <CommandList className="max-h-72">
                        <CommandEmpty>No brand found. Choose "No logo" to use initials.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem value="no logo initials" onSelect={() => choose(NO_BRAND)}>
                            <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-0" : "opacity-100")} />
                            No logo (initials)
                          </CommandItem>
                        </CommandGroup>
                        {brandsByCategory().map((group) => (
                          <CommandGroup key={group.category} heading={group.category}>
                            {group.brands.map((b) => (
                              <CommandItem
                                key={b.id}
                                value={brandSearchValue(b)}
                                onSelect={() => choose(b.id)}
                              >
                                <Check className={cn("mr-2 h-4 w-4", selected?.id === b.id ? "opacity-100" : "opacity-0")} />
                                <SubscriptionIcon name={b.label} brand={b.id} size="sm" className="mr-2.5 h-6 w-6 rounded-md" />
                                {b.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>
                    {brandChosenByUser
                      ? "You picked this logo."
                      : selected
                        ? "Matched from the name. Change it if it's wrong."
                        : "No logo matched yet. Pick one if it applies."}
                  </span>
                  {brandChosenByUser && (
                    <button
                      type="button"
                      onClick={() => setBrandChosenByUser(false)}
                      className="shrink-0 rounded-md text-foreground underline underline-offset-4 hover:text-highlight"
                    >
                      Match from name
                    </button>
                  )}
                </p>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="e.g., 9.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label.split(' - ')[0]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Entertainment" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="billing_cycle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Cycle</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a billing cycle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="next_due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Next Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "h-11 w-full bg-background/60 pl-3.5 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="pt-2">
            <Button type="submit" size="lg" disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : "Save subscription"}
            </Button>
        </div>
      </form>
    </Form>
  );
}