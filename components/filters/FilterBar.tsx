"use client";

import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { activeFilterCount, type Filters } from "@/lib/filters";
import {
  CONTACT_LABELS,
  CREDENTIAL_LABELS,
  DOMAIN_LABELS,
  PORTAL_LABELS,
  PROGRAM_TYPE_LABELS,
  REGION_LABELS,
} from "@/lib/format";
import {
  ContactLevelSchema,
  CredentialSchema,
  DomainSchema,
  PortalSchema,
  ProgramTypeSchema,
  RegionSchema,
} from "@/lib/schema";
import { toggle, useFilters } from "./useFilters";

const WAGE_STEPS = [20, 25, 30, 35, 40, 45, 50];

function CheckboxGroup<T extends string>({
  legend,
  name,
  options,
  labels,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      <ul className="grid gap-0.5">
        {options.map((o) => (
          <li key={o}>
            <label className="hover:bg-muted flex min-h-8 cursor-pointer items-center gap-2 rounded-md px-1 text-sm">
              <input
                type="checkbox"
                name={name}
                checked={value.includes(o)}
                onChange={() => onChange(toggle(value, o))}
                className="accent-primary size-4"
              />
              {labels[o]}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="hover:bg-muted flex min-h-8 cursor-pointer items-center gap-2 rounded-md px-1 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary size-4"
      />
      {label}
    </label>
  );
}

const selectClass =
  "h-9 w-full rounded-md border bg-background px-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function FilterBar() {
  const { filters: f, setFilters, clearFilters } = useFilters();
  const n = activeFilterCount(f);
  // nuqs treats null as "remove from URL".
  const set = (patch: Partial<Filters>) =>
    setFilters(
      Object.fromEntries(
        Object.entries(patch).map(([k, v]) => [
          k,
          v === false || (Array.isArray(v) && v.length === 0) ? null : v,
        ]),
      ) as Parameters<typeof setFilters>[0],
    );

  return (
    <details className="group rounded-xl border" open>
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
        <SlidersHorizontal className="size-4" aria-hidden />
        Filters{n > 0 && ` (${n} active)`}
        <span className="text-muted-foreground ml-auto text-sm font-normal group-open:hidden">
          Show
        </span>
        <span className="text-muted-foreground ml-auto hidden text-sm font-normal group-open:inline">
          Hide
        </span>
      </summary>
      <div className="grid gap-5 border-t p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid content-start gap-5">
          <CheckboxGroup
            legend="Program type"
            name="programType"
            options={ProgramTypeSchema.options}
            labels={PROGRAM_TYPE_LABELS}
            value={f.programType}
            onChange={(programType) => set({ programType })}
          />
          <CheckboxGroup
            legend="Area of health care"
            name="domain"
            options={DomainSchema.options}
            labels={DOMAIN_LABELS}
            value={f.domain}
            onChange={(domain) => set({ domain })}
          />
        </div>
        <div className="grid content-start gap-5">
          <CheckboxGroup
            legend="Patient contact"
            name="contact"
            options={ContactLevelSchema.options}
            labels={CONTACT_LABELS}
            value={f.contact}
            onChange={(contact) => set({ contact })}
          />
          <CheckboxGroup
            legend="Credential"
            name="credential"
            options={CredentialSchema.options}
            labels={CREDENTIAL_LABELS}
            value={f.credential}
            onChange={(credential) => set({ credential })}
          />
        </div>
        <div className="grid content-start gap-5">
          <CheckboxGroup
            legend="Region"
            name="region"
            options={RegionSchema.options}
            labels={REGION_LABELS}
            value={f.region}
            onChange={(region) => set({ region })}
          />
          <CheckboxGroup
            legend="Apply through"
            name="portal"
            options={PortalSchema.options}
            labels={PORTAL_LABELS}
            value={f.portal}
            onChange={(portal) => set({ portal })}
          />
        </div>
        <div className="grid content-start gap-4">
          <div>
            <label htmlFor="f-years" className="mb-1 block text-sm font-medium">
              Program length
            </label>
            <select
              id="f-years"
              className={selectClass}
              value={f.maxYears ?? ""}
              onChange={(e) => set({ maxYears: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Any length</option>
              <option value="2">2 years or less</option>
              <option value="3">3 years or less</option>
              <option value="4">4 years or less</option>
            </select>
          </div>
          <fieldset>
            <legend className="mb-1 text-sm font-medium">Median wage (hourly)</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-muted-foreground text-xs">
                At least
                <select
                  className={selectClass}
                  value={f.minWage ?? ""}
                  onChange={(e) => set({ minWage: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">Any</option>
                  {WAGE_STEPS.map((w) => (
                    <option key={w} value={w}>
                      ${w}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-muted-foreground text-xs">
                At most
                <select
                  className={selectClass}
                  value={f.maxWage ?? ""}
                  onChange={(e) => set({ maxWage: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">Any</option>
                  {WAGE_STEPS.map((w) => (
                    <option key={w} value={w}>
                      ${w}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1 text-sm font-medium">More options</legend>
            <Toggle label="Co-op available" checked={f.coop} onChange={(coop) => set({ coop })} />
            <Toggle
              label="Job outlook good or better"
              checked={f.goodOutlook}
              onChange={(goodOutlook) => set({ goodOutlook })}
            />
            <Toggle
              label="Only programs I have all prerequisites for"
              checked={f.qualified}
              onChange={(qualified) => set({ qualified })}
            />
          </fieldset>
          {n > 0 && (
            <button
              type="button"
              onClick={() => clearFilters()}
              className="justify-self-start text-sm underline underline-offset-4"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      {(f.goodOutlook || f.minWage !== null || f.maxWage !== null) && (
        <p className="text-muted-foreground border-t px-4 py-2 text-xs">
          Programs whose wage or outlook is not yet verified are hidden by these filters.
        </p>
      )}
    </details>
  );
}
