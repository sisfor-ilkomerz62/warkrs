"use client";
import { useState } from "react";
import { format } from "date-fns";
import { id as indonesia } from "date-fns/locale";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validWarTime } from "@/lib/game-form-values";
// Value is a Jakarta wall-clock string, exactly like the former datetime-local.
// Only lib/time.fromJakartaInput converts it into an authoritative UTC payload.
export function GameDateTimeField({
  id,
  label,
  value,
  onChange,
  disabled = false,
  invalid = false,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [day, time] = value.split("T");
  const [touched, setTouched] = useState(false);
  const timeError = touched && day && !validWarTime(time ?? "")
    ? "Gunakan format HH:mm: jam 00–23 dan menit 00–59."
    : undefined;
  const feedback = timeError || error;
  const parts = day?.split("-").map(Number);
  const selected =
    parts?.length === 3
      ? new Date(parts[0], parts[1] - 1, parts[2], 12)
      : undefined;
  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="grid min-w-0 gap-2 min-[420px]:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <Label htmlFor={`${id}-date`} className="sr-only">
            Tanggal {label.toLowerCase()}
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id={`${id}-date`}
                type="button"
                variant="outline"
                className="h-11 w-full justify-start px-3 text-left font-normal"
                disabled={disabled}
                aria-invalid={invalid}
                aria-describedby={`${id}-zone${feedback ? ` ${id}-error` : ""}`}
              >
                <CalendarDays
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span
                  className={`min-w-0 flex-1 truncate ${selected ? "" : "text-muted-foreground"}`}
                >
                  {selected
                    ? format(selected, "d MMM yyyy", { locale: indonesia })
                    : "Pilih tanggal"}
                </span>
                <ChevronDown
                  className="size-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-auto max-w-[calc(100vw-2rem)] p-0"
            >
              <Calendar
                mode="single"
                selected={selected}
                defaultMonth={selected}
                locale={indonesia}
                className="[--cell-size:2.25rem]"
                autoFocus
                labels={{
                  labelNext: () => "Bulan berikutnya",
                  labelPrevious: () => "Bulan sebelumnya",
                  labelDayButton: (date) =>
                    format(date, "EEEE, d MMMM yyyy", { locale: indonesia }),
                }}
                onSelect={(date) => {
                  if (date) {
                    onChange(`${format(date, "yyyy-MM-dd")}T${time ?? "00:00"}`);
                    setOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor={`${id}-time`} className="sr-only">Waktu {label.toLowerCase()}</Label>
          <Input
            id={`${id}-time`}
            type="text"
            placeholder="HH:mm"
            maxLength={5}
            autoComplete="off"
            spellCheck={false}
            className="h-11 min-w-0 min-[420px]:w-28 xl:w-full 2xl:w-28"
            disabled={disabled || !day}
            value={day ? time ?? "00:00" : ""}
            aria-invalid={invalid || Boolean(timeError)}
            aria-describedby={`${id}-zone${feedback ? ` ${id}-error` : ""}`}
            onBlur={() => setTouched(true)}
            onChange={(event) => onChange(`${day}T${event.target.value}`)}
          />
        </div>
      </div>
      {feedback && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{feedback}</p>}
      <input type="hidden" name={id} value={value} />
      <p id={`${id}-zone`} className="text-xs text-muted-foreground">
        WIB · Asia/Jakarta
      </p>
    </fieldset>
  );
}
