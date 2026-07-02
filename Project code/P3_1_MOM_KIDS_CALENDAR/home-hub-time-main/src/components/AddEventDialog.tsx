import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Repeat } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type ActivityType = Database["public"]["Enums"]["activity_type"];

// Estonian labels for activity types
const activityLabels: Record<ActivityType, string> = {
  school: "Kool",
  training: "Trenn",
  music: "Muusika",
  other: "Muu",
};

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  activity_type: z.enum(["school", "training", "music", "other"] as const),
  date: z.date({ required_error: "Date is required" }),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  recurring: z.boolean().default(true),
});

type EventFormData = z.infer<typeof eventSchema>;

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  defaultActivityType?: ActivityType;
  familyId?: string;
  onEventAdded?: () => void;
}

export const AddEventDialog = ({
  open,
  onOpenChange,
  defaultDate,
  defaultActivityType = "other",
  familyId,
  onEventAdded,
}: AddEventDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      activity_type: "other",
      date: new Date(),
      start_time: "09:00",
      end_time: "10:00",
      recurring: true,
    },
  });

  // Update form values when dialog opens with new defaults
  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        description: "",
        location: "",
        activity_type: defaultActivityType,
        date: defaultDate || new Date(),
        start_time: "09:00",
        end_time: "10:00",
        recurring: true,
      });
    }
  }, [open, defaultActivityType, defaultDate, form]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const onSubmit = async (data: EventFormData) => {
    if (!familyId) {
      toast({
        title: "Peregrupp puudub",
        description: "Palun liitu või loo esmalt peregrupp.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const startDateTime = new Date(data.date);
      const [startHour, startMin] = data.start_time.split(":").map(Number);
      startDateTime.setHours(startHour, startMin, 0, 0);

      const endDateTime = new Date(data.date);
      const [endHour, endMin] = data.end_time.split(":").map(Number);
      endDateTime.setHours(endHour, endMin, 0, 0);

      // Check for overlapping school events if adding a school event
      if (data.activity_type === "school") {
        const { data: existingEvents } = await supabase
          .from("schedule_events")
          .select("*")
          .eq("family_id", familyId)
          .eq("activity_type", "school");

        const hasOverlap = existingEvents?.some((event) => {
          const eventStart = new Date(event.start_time);
          const eventEnd = new Date(event.end_time);
          // Check if times overlap
          return (
            (startDateTime >= eventStart && startDateTime < eventEnd) ||
            (endDateTime > eventStart && endDateTime <= eventEnd) ||
            (startDateTime <= eventStart && endDateTime >= eventEnd)
          );
        });

        if (hasOverlap) {
          toast({
            title: "Ajakonflikt",
            description: "Sellel ajal on juba teine koolitund. Koolitunnid ei saa kattuda.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await supabase.from("schedule_events").insert({
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        activity_type: data.activity_type,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        family_id: familyId,
        created_by: userData.user.id,
        recurring: data.recurring,
        recurrence_rule: data.recurring ? "weekly" : null,
      });

      if (error) throw error;

      toast({
        title: "Sündmus loodud",
        description: `"${data.title}" on tunniplaani lisatud.`,
      });

      onOpenChange(false);
      onEventAdded?.();
    } catch (error: any) {
      toast({
        title: "Sündmuse loomine ebaõnnestus",
        description: error.message || "Palun proovi uuesti.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Lisa uus sündmus</DialogTitle>
          <DialogDescription>
            Lisa uus tegevus perekonna tunniplaani.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pealkiri</FormLabel>
                  <FormControl>
                    <Input placeholder="Matemaatika, Jalgpalli trenn..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tegevuse tüüp</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vali tüüp">
                          {field.value && activityLabels[field.value as ActivityType]}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="school">{activityLabels.school}</SelectItem>
                      <SelectItem value="training">{activityLabels.training}</SelectItem>
                      <SelectItem value="music">{activityLabels.music}</SelectItem>
                      <SelectItem value="other">{activityLabels.other}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Kuupäev</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "dd.MM.yyyy") : <span>Vali kuupäev</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Algusaeg</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lõpuaeg</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asukoht (valikuline)</FormLabel>
                  <FormControl>
                    <Input placeholder="Klass 207, Saal, Muusikaklass..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kirjeldus (valikuline)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Lisainfo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurring"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2">
                      <Repeat className="w-4 h-4" />
                      Kordub igal nädalal
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Sündmus ilmub automaatselt igal nädalal samal päeval
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Tühista
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Lisamine..." : "Lisa sündmus"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
