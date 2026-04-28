import { useState } from 'react';
import { Calendar, DatePicker, DateRangePicker, TimePicker } from 'zenput';
import { Section, Scenario } from './_shell';

export function PickersSection() {
  const [calDate, setCalDate] = useState<Date | null>(new Date());
  const [pickerDate, setPickerDate] = useState<Date | null>(null);

  const presets = [
    { label: 'Today', date: new Date() },
    { label: 'Yesterday', date: new Date(Date.now() - 86400000) },
    { label: 'Last week', date: new Date(Date.now() - 7 * 86400000) },
  ];

  return (
    <Section
      id="pickers"
      name="Pickers (Calendar, DatePicker, DateRangePicker, TimePicker)"
      description="Rich date and time picker components built on the Calendar primitive."
    >
      <Scenario title="Calendar — standalone">
        <div>
          <Calendar
            value={calDate}
            onChange={setCalDate}
          />
          <p style={{ marginTop: '8px', fontSize: '0.85em', color: 'var(--zp-color-text-muted)' }}>
            Selected: <strong>{calDate?.toDateString() ?? 'none'}</strong>
          </p>
        </div>
      </Scenario>

      <Scenario title="DatePicker — basic">
        <DatePicker label="Date of birth" clearable />
      </Scenario>

      <Scenario title="DatePicker — controlled with presets">
        <div>
          <DatePicker
            label="Appointment date"
            value={pickerDate}
            onChange={setPickerDate}
            presets={presets}
            clearable
          />
          <p style={{ marginTop: '8px', fontSize: '0.85em', color: 'var(--zp-color-text-muted)' }}>
            Selected: <strong>{pickerDate?.toDateString() ?? 'none'}</strong>
          </p>
        </div>
      </Scenario>

      <Scenario title="DatePicker — with min/max">
        <DatePicker
          label="Available dates"
          min={new Date(Date.now() - 7 * 86400000)}
          max={new Date(Date.now() + 30 * 86400000)}
          clearable
          helperText="Only dates within ±30 days from today are selectable."
        />
      </Scenario>

      <Scenario title="DateRangePicker">
        <DateRangePicker label="Date range" clearable />
      </Scenario>

      <Scenario title="TimePicker — basic">
        <TimePicker label="Meeting time" />
      </Scenario>

      <Scenario title="TimePicker — step 15 min, 24-hour format">
        <TimePicker label="Schedule (24h, 15 min)" minuteStep={15} hourCycle={24} />
      </Scenario>
    </Section>
  );
}
