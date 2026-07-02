import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  LogOut, 
  Plus, 
  Users, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  Copy,
  UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, addDays, isSameDay, isToday, parseISO, getDay } from "date-fns";
import { et } from "date-fns/locale";
import { AddEventDialog } from "@/components/AddEventDialog";
import { EditEventDialog } from "@/components/EditEventDialog";
import { ThemeSelector } from "@/components/ThemeSelector";
import { ThemeDecorations, ThemeBanner } from "@/components/ThemeDecorations";
import { ActivityIcon, activityIcons } from "@/components/ActivityIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/integrations/supabase/types";

type ActivityType = Database["public"]["Enums"]["activity_type"];
type ScheduleEvent = Database["public"]["Tables"]["schedule_events"]["Row"];

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyInviteCode, setFamilyInviteCode] = useState<string | null>(null);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [familyDialogOpen, setFamilyDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [currentTheme, setCurrentTheme] = useState("default");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType>("other");
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchFamilyAndEvents = useCallback(async (userId: string) => {
    // Get user's first family (ordered by join date to be consistent)
    const { data: memberships } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", userId)
      .order("joined_at", { ascending: true })
      .limit(1);
    
    const membership = memberships?.[0] || null;

    if (membership?.family_id) {
      setFamilyId(membership.family_id);
      
      // Get family invite code
      const { data: familyData } = await supabase
        .from("families")
        .select("invite_code")
        .eq("id", membership.family_id)
        .maybeSingle();
      
      if (familyData?.invite_code) {
        setFamilyInviteCode(familyData.invite_code);
      }
      
      // Fetch schedule events for this family
      const { data: events } = await supabase
        .from("schedule_events")
        .select("*")
        .eq("family_id", membership.family_id)
        .order("start_time", { ascending: true });

      setScheduleEvents(events || []);
    } else {
      // User has no family yet - create one automatically via backend function (avoids RLS edge cases)
      const { data: newFamilyId, error: createErr } = await supabase
        .rpc("create_family_group", { family_name: "Minu pere" });

      if (createErr || !newFamilyId) {
        toast({
          title: "Peregrupi loomine ebaõnnestus",
          description: createErr?.message || "Palun proovi uuesti.",
          variant: "destructive",
        });
        return;
      }

      setFamilyId(newFamilyId);

      const { data: familyData, error: familyReadErr } = await supabase
        .from("families")
        .select("invite_code")
        .eq("id", newFamilyId)
        .maybeSingle();

      if (!familyReadErr && familyData?.invite_code) {
        setFamilyInviteCode(familyData.invite_code);
      }

      toast({
        title: "Tere tulemast! 🎉",
        description: "Sinu peregrupp on loodud. Kutsu teisi kutsekoodiga!",
      });
    }
  }, [toast]);

  const createFamilyNow = useCallback(async () => {
    if (!user) return;
    const { data: newFamilyId, error } = await supabase
      .rpc("create_family_group", { family_name: "My Family" });

    if (error || !newFamilyId) {
      toast({
        title: "Couldn't create family",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
      return;
    }

    await fetchFamilyAndEvents(user.id);
  }, [fetchFamilyAndEvents, toast, user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        // Defer any DB calls to avoid auth callback deadlocks
        setTimeout(() => fetchFamilyAndEvents(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => fetchFamilyAndEvents(session.user.id), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchFamilyAndEvents]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const copyInviteCode = () => {
    if (familyInviteCode) {
      navigator.clipboard.writeText(familyInviteCode);
      toast({
        title: "Kopeeritud! 📋",
        description: "Jaga seda koodi pereliikmetega",
      });
    }
  };

  const joinFamily = async () => {
    if (!joinCode.trim() || !user) return;
    
    // Find family by invite code
    const { data: family } = await supabase
      .from("families")
      .select("id")
      .eq("invite_code", joinCode.trim())
      .maybeSingle();

    if (!family) {
      toast({
        title: "Vale kood",
        description: "Palun kontrolli kutsekoodi ja proovi uuesti",
        variant: "destructive",
      });
      return;
    }

    // Join the family
    const { error } = await supabase.from("family_members").insert({
      family_id: family.id,
      user_id: user.id,
      role: "member",
    });

    if (error) {
      toast({
        title: "Liitumine ebaõnnestus",
        description: "Sa võid juba olla liige",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Tere tulemast perekonda! 🎉",
        description: "Nüüd saad vaadata ja lisada tunniplaani",
      });
      setFamilyDialogOpen(false);
      setJoinCode("");
      fetchFamilyAndEvents(user.id);
    }
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const navigateWeek = (direction: number) => {
    setCurrentDate(addDays(currentDate, direction * 7));
  };

  const openAddDialog = (date: Date, activityType: ActivityType = "other") => {
    setSelectedDate(date);
    setSelectedActivityType(activityType);
    setDialogOpen(true);
  };

  const handleEventAdded = () => {
    if (user) {
      fetchFamilyAndEvents(user.id);
    }
  };

  const openEditDialog = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  const handleEventUpdated = () => {
    if (user) {
      fetchFamilyAndEvents(user.id);
    }
  };

  const getEventsForDay = (day: Date) => {
    const dayOfWeek = getDay(day); // 0 = Sunday, 1 = Monday, etc.
    
    return scheduleEvents.filter((event) => {
      const eventDate = parseISO(event.start_time);
      
      // Show event if it's on this exact day
      if (isSameDay(eventDate, day)) {
        return true;
      }
      
      // Show recurring events on matching weekdays (even for future/past weeks)
      if (event.recurring && event.recurrence_rule === "weekly") {
        const eventDayOfWeek = getDay(eventDate);
        return eventDayOfWeek === dayOfWeek;
      }
      
      return false;
    }).map((event) => {
      // For recurring events shown on a different week, adjust display times
      const eventDate = parseISO(event.start_time);
      if (!isSameDay(eventDate, day) && event.recurring) {
        // Create adjusted times for display purposes
        const originalStart = parseISO(event.start_time);
        const originalEnd = parseISO(event.end_time);
        
        const adjustedStart = new Date(day);
        adjustedStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
        
        const adjustedEnd = new Date(day);
        adjustedEnd.setHours(originalEnd.getHours(), originalEnd.getMinutes(), 0, 0);
        
        return {
          ...event,
          _displayStartTime: adjustedStart.toISOString(),
          _displayEndTime: adjustedEnd.toISOString(),
          _isRecurringInstance: true,
        };
      }
      return event;
    });
  };

  // Activity icons are now handled by ActivityIcon component

  const getActivityClass = (type: ActivityType) => {
    switch (type) {
      case "school": return "activity-school";
      case "training": return "activity-training";
      case "music": return "activity-music";
      default: return "activity-other";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-pulse-soft">
          <Calendar className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Kasutaja";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Theme Background - behind everything */}
      <ThemeDecorations theme={currentTheme} />
      
      {/* Theme Banner */}
      <ThemeBanner theme={currentTheme} />
      
      {/* Header - above background */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-50 relative">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-foreground">PereTunniplaan</h1>
                <p className="text-xs text-muted-foreground">Tere, {userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">3</span>
              </Button>
              
              {/* Family Management */}
              <Dialog open={familyDialogOpen} onOpenChange={setFamilyDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Users className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Peregrupp
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6 mt-4">
                    {/* Create family if none exists */}
                    {!familyInviteCode && user && (
                      <div className="space-y-2">
                        <Label>Loo peregrupp</Label>
                        <Button onClick={createFamilyNow} className="w-full">
                          Loo minu peregrupp
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          See loob sinu peregrupi ja teeb sind administraatoriks.
                        </p>
                      </div>
                    )}

                    {/* Show invite code if user has a family */}
                    {familyInviteCode && (
                      <div className="space-y-2">
                        <Label>Sinu pere kutsekood</Label>
                        <div className="flex gap-2">
                          <Input 
                            value={familyInviteCode} 
                            readOnly 
                            className="font-mono text-lg tracking-wider"
                          />
                          <Button onClick={copyInviteCode} variant="outline">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Jaga seda koodi pereliikmetega, et nad saaksid tunniplaaniga liituda
                        </p>
                      </div>
                    )}

                    {/* Join another family */}
                    <div className="space-y-2 border-t pt-4">
                      <Label className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Liitu teise perega
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Sisesta kutsekood..."
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value)}
                          className="font-mono"
                        />
                        <Button onClick={joinFamily}>
                          Liitu
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Theme Selector */}
              {user && <ThemeSelector userId={user.id} onThemeChange={setCurrentTheme} />}
              
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - above background */}
      <main className="container py-6 relative z-10">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Nädala tunniplaan</h2>
            <p className="text-muted-foreground">{format(weekStart, "MMMM yyyy", { locale: et })}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="soft" onClick={() => setCurrentDate(new Date())}>
              Täna
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-4 mb-6">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`text-center p-3 rounded-xl transition-all cursor-pointer ${
                isToday(day)
                  ? "bg-primary text-primary-foreground"
                  : isSameDay(day, currentDate)
                  ? "bg-accent"
                  : "hover:bg-muted"
              }`}
              onClick={() => setCurrentDate(day)}
            >
              <p className={`text-xs font-medium ${isToday(day) ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {format(day, "EEE", { locale: et })}
              </p>
              <p className={`text-lg font-bold ${isToday(day) ? "text-primary-foreground" : "text-foreground"}`}>
                {format(day, "d")}
              </p>
            </div>
          ))}
        </div>

        {/* Schedule Cards */}
        <div className="grid lg:grid-cols-7 gap-4">
          {weekDays.map((day, dayIndex) => {
            const daySchedule = getEventsForDay(day);
            return (
              <Card key={dayIndex} className={`min-h-[300px] ${isToday(day) ? "ring-2 ring-primary" : ""}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {format(day, "EEEE", { locale: et })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {daySchedule.length > 0 ? (
                    daySchedule.map((event) => {
                      // Use display times for recurring instances, original times otherwise
                      const displayEvent = event as typeof event & { 
                        _displayStartTime?: string; 
                        _displayEndTime?: string;
                        _isRecurringInstance?: boolean;
                      };
                      const startTimeStr = displayEvent._displayStartTime || event.start_time;
                      const endTimeStr = displayEvent._displayEndTime || event.end_time;
                      const startTime = format(parseISO(startTimeStr), "HH:mm");
                      const endTime = format(parseISO(endTimeStr), "HH:mm");
                      const isRecurringInstance = displayEvent._isRecurringInstance;
                      
                      return (
                        <div
                          key={`${event.id}-${day.toISOString()}`}
                          className={`${getActivityClass(event.activity_type)} rounded-lg p-3 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all relative`}
                          onClick={() => openEditDialog(event)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && openEditDialog(event)}
                        >
                          <div className="flex items-start gap-2">
                            <ActivityIcon 
                              type={event.activity_type} 
                              title={event.title}
                              size="sm"
                              className="mt-0.5 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">
                                {event.title}
                                {event.recurring && (
                                  <span className="ml-1 text-xs opacity-60">🔄</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{startTime} - {endTime}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">Tegevused puuduvad</p>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2 text-muted-foreground"
                    onClick={() => openAddDialog(day)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Lisa
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-dashed border-2 hover:border-primary/50 bg-card/90"
            onClick={() => openAddDialog(currentDate, "school")}
          >
            <CardContent className="flex items-center gap-4 py-6">
              <img src={activityIcons.school} alt="Kool" className="w-12 h-12 object-contain" />
              <div>
                <h3 className="font-semibold text-foreground">Lisa koolitund</h3>
                <p className="text-sm text-muted-foreground">Tunnid, kontrolltööd, koosolekud</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-dashed border-2 hover:border-primary/50 bg-card/90"
            onClick={() => openAddDialog(currentDate, "training")}
          >
            <CardContent className="flex items-center gap-4 py-6">
              <img src={activityIcons.training} alt="Trenn" className="w-12 h-12 object-contain" />
              <div>
                <h3 className="font-semibold text-foreground">Lisa trenn</h3>
                <p className="text-sm text-muted-foreground">Sport, harjutused</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-dashed border-2 hover:border-primary/50 bg-card/90"
            onClick={() => openAddDialog(currentDate, "music")}
          >
            <CardContent className="flex items-center gap-4 py-6">
              <img src={activityIcons.music} alt="Muusika" className="w-12 h-12 object-contain" />
              <div>
                <h3 className="font-semibold text-foreground">Lisa muusikatund</h3>
                <p className="text-sm text-muted-foreground">Pillimäng, laulutunnid</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Event Dialog */}
      <AddEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDate={selectedDate}
        defaultActivityType={selectedActivityType}
        familyId={familyId || undefined}
        onEventAdded={handleEventAdded}
      />

      {/* Edit Event Dialog */}
      <EditEventDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        event={selectedEvent}
        onEventUpdated={handleEventUpdated}
        onEventDeleted={handleEventUpdated}
      />
    </div>
  );
};

export default Dashboard;
