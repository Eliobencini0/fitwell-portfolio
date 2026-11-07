'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createActivity } from '@/lib/actions';
import { toast } from 'sonner';
import type { ActivityType } from '@/types';

interface AddActivityDialogProps {
  date: string;
}

export function AddActivityDialog({ date }: AddActivityDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('meal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Il titolo è obbligatorio');
      return;
    }

    setLoading(true);

    try {
      await createActivity({
        date,
        title: title.trim(),
        description: description.trim() || undefined,
        activity_type: activityType,
        calories: parseInt(calories) || 0,
      });

      toast.success('Attività aggiunta!');
      setOpen(false);

      // Reset form
      setTitle('');
      setDescription('');
      setCalories('');
      setActivityType('meal');

      router.refresh();
    } catch (error) {
      toast.error('Errore nell\'aggiunta dell\'attività');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const quickActivities = {
    meal: [
      { title: 'Colazione', calories: 400 },
      { title: 'Pranzo', calories: 600 },
      { title: 'Cena', calories: 600 },
      { title: 'Spuntino', calories: 200 },
    ],
    workout: [
      { title: 'Allenamento Forza', calories: -300 },
      { title: 'Cardio 30min', calories: -250 },
      { title: 'Camminata', calories: -150 },
      { title: 'Yoga', calories: -100 },
    ],
    other: [
      { title: 'Meditazione', calories: 0 },
      { title: 'Integratori', calories: 0 },
      { title: 'Riposo', calories: 0 },
    ],
  };

  const fillQuickActivity = (quickTitle: string, quickCalories: number) => {
    setTitle(quickTitle);
    setCalories(quickCalories.toString());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          ➕ Aggiungi Attività
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuova Attività</DialogTitle>
          <DialogDescription>
            Aggiungi un pasto, allenamento o altra attività
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="meal">🍽️ Pasto</TabsTrigger>
              <TabsTrigger value="workout">💪 Workout</TabsTrigger>
              <TabsTrigger value="other">📝 Altro</TabsTrigger>
            </TabsList>

            <TabsContent value="meal" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-2">
                {quickActivities.meal.map((activity) => (
                  <Button
                    key={activity.title}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillQuickActivity(activity.title, activity.calories)}
                  >
                    {activity.title}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="workout" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-2">
                {quickActivities.workout.map((activity) => (
                  <Button
                    key={activity.title}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillQuickActivity(activity.title, activity.calories)}
                  >
                    {activity.title}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="other" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-2">
                {quickActivities.other.map((activity) => (
                  <Button
                    key={activity.title}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillQuickActivity(activity.title, activity.calories)}
                  >
                    {activity.title}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="title">Titolo *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Colazione"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calories">Calorie</Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="0 (positivo = consumate, negativo = bruciate)"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Positivo per calorie consumate, negativo per calorie bruciate
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Note (opzionale)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="es. Yogurt e frutta"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Aggiunta...' : 'Aggiungi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
