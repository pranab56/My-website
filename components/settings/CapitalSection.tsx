"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Wallet } from 'lucide-react';
import { memo } from 'react';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface CapitalSectionProps {
  initialCapital: string;
  setInitialCapital: (value: string) => void;
  sessionDate: Date | undefined;
  setSessionDate: (date: Date) => void;
}

const CapitalSection = ({
  initialCapital,
  setInitialCapital,
  sessionDate,
  setSessionDate
}: CapitalSectionProps) => {
  return (
    <Card className="border-border bg-card/40 backdrop-blur-md rounded-xl overflow-hidden shadow-sm p-0">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <Wallet className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-semibold">Capital Config</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Initial Capital ($)</Label>
            <Input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(e.target.value)}
              className="bg-accent/5 border-border h-12 rounded-2xl focus-visible:ring-primary/20 font-semibold text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Session Month</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full h-12 justify-start text-left font-semibold rounded-2xl border-border bg-accent/5 hover:bg-accent/10 transition-colors",
                    !sessionDate && "text-muted-foreground"
                  )}
                >
                  <Clock className="mr-2 h-4 w-4 opacity-50 text-primary" />
                  {sessionDate ? format(sessionDate, "MMMM yyyy") : <span>Pick month</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 rounded-2xl border-border shadow-2xl bg-card/95 backdrop-blur-xl" align="start">
                <div className="flex items-center justify-between mb-4 px-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => sessionDate && setSessionDate(setYear(sessionDate, getYear(sessionDate) - 1))}
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold tracking-widest text-primary">
                    {sessionDate ? getYear(sessionDate) : getYear(new Date())}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => sessionDate && setSessionDate(setYear(sessionDate, getYear(sessionDate) + 1))}
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map((month: string, index: number) => {
                    const isSelected = sessionDate && getMonth(sessionDate) === index;
                    return (
                      <button
                        key={month}
                        onClick={() => {
                          const baseDate = sessionDate || new Date();
                          const newDate = setMonth(setYear(new Date(baseDate), getYear(baseDate)), index);
                          newDate.setDate(1);
                          setSessionDate(newDate);
                        }}
                        className={cn(
                          "py-2.5 px-1 text-[10px] font-semibold rounded-xl transition-all border",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                            : "bg-accent/5 border-transparent hover:border-primary/30 hover:bg-accent/10 text-muted-foreground"
                        )}
                      >
                        {month.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="text-[10px] font-semibold text-primary/60 mb-1">Calculation Advice</p>
          <p className="text-xs text-muted-foreground font-semibold italic leading-relaxed shadow-sm">
            Changing capital values will instantly recalibrate your dashboard metrics and ROI curves.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(CapitalSection);
