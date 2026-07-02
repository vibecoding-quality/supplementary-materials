import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Trash2, Repeat } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type ActivityType = Database["public"]["Enums"]["activity_type"];
type ScheduleEvent = Database["public"]["Tables"]["schedule_events"]["Row"];

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
  recurring: z.boolean().default(false),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ScheduleEvent | null;
  onEventUpdated?: () => void;
  onEventDeleted?: () => void;
}

export const EditEventDialog = ({
  open,
  onOpenChange,
  event,
  onEventUpdated,
  onEventDeleted,
}: EditEventDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      recurring: false,
    },
  });

  // Reset form when event changes
  useEffect(() => {
    if (event && open) {
      const startDate = parseISO(event.start_time);
      const endDate = parseISO(event.end_time);
      
      form.reset({
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        activity_type: event.activity_type,
        date: startDate,
        start_time: format(startDate, "HH:mm"),
        end_time: format(endDate, "HH:mm"),
        recurring: event.recurring || false,
      });
    }
  }, [event, open, form]);

  const onSubmit = async (data: EventFormData) => {
    if (!event) return;

    setIsSubmitting(true);

    try {
      const startDateTime = new Date(data.date);
      const [startHour, startMin] = data.start_time.split(":").map(Number);
      startDateTime.setHours(startHour, startMin, 0, 0);

      const endDateTime = new Date(data.date);
      const [endHour, endMin] = data.end_time.split(":").map(Number);
      endDateTime.setHours(endHour, endMin, 0, 0);

      // Check for overlapping school events if updating to a school event
      if (data.activity_type === "school") {
        const { data: existingEvents } = await supabase
          .from("schedule_events")
          .select("*")
          .eq("family_id", event.family_id)
          .eq("activity_type", "school")
          .neq("id", event.id); // Exclude current event

        const hasOverlap = existingEvents?.some((existingEvent) => {
          const eventStart = new Date(existingEvent.start_time);
          const eventEnd = new Date(existingEvent.end_time);
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

      const { error } = await supabase
        .from("schedule_events")
        .update({
          title: data.title,
          description: data.description || null,
          location: data.location || null,
          activity_type: data.activity_type,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          recurring: data.recurring,
          recurrence_rule: data.recurring ? "weekly" : null,
        })
        .eq("id", event.id);

      if (error) throw error;

      toast({
        title: "Sündmus uuendatud",
        description: `"${data.title}" on uuendatud.`,
      });

      onOpenChange(false);
      onEventUpdated?.();
    } catch (error: any) {
      toast({
        title: "Uuendamine ebaõnnestus",
        description: error.message || "Palun proovi uuesti.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("schedule_events")
        .delete()
        .eq("id", event.id);

      if (error) throw error;

      toast({
        title: "Sündmus kustutatud",
        description: `"${event.title}" on eemaldatud.`,
      });

      setShowDeleteConfirm(false);
      onOpenChange(false);
      onEventDeleted?.();
    } catch (error: any) {
      toast({
        title: "Kustutamine ebaõnnestus",
        description: error.message || "Palun proovi uuesti.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!event) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Muuda sündmust</DialogTitle>
            <DialogDescription>
              Muuda selle sündmuse andmeid.
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

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting || isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Kustuta
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Tühista
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvestamine..." : "Salvesta"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kustuta sündmus</AlertDialogTitle>
            <AlertDialogDescription>
              Kas oled kindel, et soovid kustutada "{event.title}"? Seda toimingut ei saa tagasi võtta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Tühista</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Kustutamine..." : "Kustuta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
