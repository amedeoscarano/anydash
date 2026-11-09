"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigationGuard } from "@/lib/use-navigation-guard";
import { deleteStore, fetchStoreSettings, saveStoreSettings } from "@/lib/api";

const DEFAULTS = {
  storeName: "",
  contactEmail: "",
  currency: "USD",
  freeShippingThreshold: "$50.00",
  autoArchive: false,
  emailOnShip: true,
  smsOnShip: false,
  digestEnabled: false,
  digestDay: "monday",
};

export default function StoreSettingsPage({ plan }) {
  const [saved, setSaved] = useState(DEFAULTS);
  const { register, control, handleSubmit, reset, watch, formState } = useForm({ defaultValues: DEFAULTS });
  const { isDirty, isSubmitting } = formState;

  useEffect(() => {
    fetchStoreSettings().then((values) => {
      setSaved(values);
      reset(values);
    });
  }, [reset]);

  useNavigationGuard(isDirty, "Leave page with unsaved changes? Your edits will be lost.");
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  async function onSubmit(values) {
    try {
      const next = await saveStoreSettings(values);
      setSaved(next);
      reset(next);
      toast.success("Store settings saved");
    } catch (error) {
      toast.error("Invalid input");
    }
  }

  const digestEnabled = watch("digestEnabled");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-8 pb-24">
      <h1 className="text-xl font-semibold">Store</h1>

      <section aria-labelledby="details-heading" className="space-y-4">
        <h2 id="details-heading" className="font-medium">Store details</h2>
        <div className="space-y-1">
          <Label htmlFor="storeName">Store name</Label>
          <Input id="storeName" {...register("storeName", { required: true, maxLength: 60 })} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input id="contactEmail" type="email" {...register("contactEmail")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="currency">Store currency</Label>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="currency" title="Changing the currency recalculates the totals of all open draft orders.">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">US dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">Pound sterling (GBP)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </section>

      <section aria-labelledby="orders-heading" className="space-y-4">
        <h2 id="orders-heading" className="font-medium">Orders</h2>
        <div className="space-y-1">
          <Label htmlFor="freeShippingThreshold">Free shipping threshold</Label>
          <Input id="freeShippingThreshold" type="text" {...register("freeShippingThreshold")} />
        </div>
        <div className="flex items-start gap-3">
          <Controller
            name="autoArchive"
            control={control}
            render={({ field }) => (
              <Switch id="autoArchive" checked={field.value} onCheckedChange={field.onChange} aria-describedby="autoArchive-help" />
            )}
          />
          <div>
            <Label htmlFor="autoArchive">Archive orders after delivery</Label>
            <p id="autoArchive-help" className="text-sm text-muted-foreground">
              Delivered orders move out of the Open list 7 days after delivery.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="notify-heading" className="space-y-4">
        <h2 id="notify-heading" className="font-medium">Customer notifications</h2>
        <div className="flex items-center gap-3">
          <Controller
            name="emailOnShip"
            control={control}
            render={({ field }) => <Checkbox id="emailOnShip" checked={field.value} onCheckedChange={field.onChange} />}
          />
          <Label htmlFor="emailOnShip">Email the customer when an order ships</Label>
        </div>
        <div className="flex items-center gap-3">
          <Controller
            name="smsOnShip"
            control={control}
            render={({ field }) => (
              <Checkbox id="smsOnShip" checked={field.value} onCheckedChange={field.onChange} disabled={!plan.includesSms} />
            )}
          />
          <Label htmlFor="smsOnShip">Text the customer when an order ships</Label>
        </div>
        <div className="flex items-start gap-3">
          <Controller
            name="digestEnabled"
            control={control}
            render={({ field }) => (
              <Checkbox id="digestEnabled" checked={field.value} onCheckedChange={field.onChange} aria-describedby="digest-help" />
            )}
          />
          <div>
            <Label htmlFor="digestEnabled">Email a weekly sales digest</Label>
            <p id="digest-help" className="text-sm text-muted-foreground">
              A summary of orders, refunds and top products, sent to the contact email.
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="digestDay">Digest day</Label>
          <Controller
            name="digestDay"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="digestDay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background py-3">
        <Button type="button" variant="destructive" onClick={() => deleteStore()}>
          Delete store
        </Button>
        <Button type="button" variant="outline" disabled={!isDirty} onClick={() => reset(DEFAULTS)}>
          Discard
        </Button>
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          Save
        </Button>
      </div>
    </form>
  );
}
