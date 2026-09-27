"use client";

import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import type { Filters } from "@/lib/filters";
import {
  ContactLevelSchema,
  CredentialSchema,
  DomainSchema,
  PortalSchema,
  ProgramTypeSchema,
  RegionSchema,
} from "@/lib/schema";

/** URL params for the discovery hub (§7.3). Short keys keep shared links readable. */
export const filterParsers = {
  courses: parseAsArrayOf(parseAsString).withDefault([]),
  qualified: parseAsBoolean.withDefault(false),
  programType: parseAsArrayOf(parseAsStringLiteral(ProgramTypeSchema.options)).withDefault([]),
  domain: parseAsArrayOf(parseAsStringLiteral(DomainSchema.options)).withDefault([]),
  contact: parseAsArrayOf(parseAsStringLiteral(ContactLevelSchema.options)).withDefault([]),
  credential: parseAsArrayOf(parseAsStringLiteral(CredentialSchema.options)).withDefault([]),
  maxYears: parseAsInteger,
  region: parseAsArrayOf(parseAsStringLiteral(RegionSchema.options)).withDefault([]),
  portal: parseAsArrayOf(parseAsStringLiteral(PortalSchema.options)).withDefault([]),
  coop: parseAsBoolean.withDefault(false),
  goodOutlook: parseAsBoolean.withDefault(false),
  minWage: parseAsInteger,
  maxWage: parseAsInteger,
  compare: parseAsArrayOf(parseAsString).withDefault([]),
};

export function useFilters() {
  const [state, setState] = useQueryStates(filterParsers, { history: "replace", scroll: false });
  const { compare, ...filters } = state;
  return {
    filters: filters satisfies Filters,
    compare,
    setFilters: setState,
    clearFilters: () =>
      setState({
        qualified: null,
        programType: null,
        domain: null,
        contact: null,
        credential: null,
        maxYears: null,
        region: null,
        portal: null,
        coop: null,
        goodOutlook: null,
        minWage: null,
        maxWage: null,
      }),
  };
}

export const toggle = <T>(list: readonly T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
