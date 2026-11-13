"use client";

import type { ReactNode } from "react";
import { FactoryIcon, QrCodeIcon } from "lucide-react";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BRAND_MAX_LENGTH,
  BRAND_SUGGESTIONS,
  CATEGORY_MAX_LENGTH,
  CATEGORY_SUGGESTIONS,
  DESCRIPTION_LIMIT,
  NAME_MAX_LENGTH,
  SKU_MAX_LENGTH,
} from "./list-products.data";
import {
  Field,
  sheetFieldClass,
  sheetFieldErrorId,
  sheetLeadingIconClass,
  sheetTextareaClass,
} from "./list-products-sheet-parts";

type FieldProps = {
  /**
   * Namespaces the DOM ids so the create and edit drawers can share these
   * controls without duplicate ids in a single document.
   */
  idPrefix: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
};

function errorProps(id: string, error?: string) {
  return {
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? sheetFieldErrorId(id) : undefined,
  };
}

export function SkuField({
  idPrefix,
  value,
  onChange,
  error,
  action,
}: FieldProps & { action?: ReactNode }) {
  const id = `${idPrefix}-sku`;

  return (
    <Field label="SKU identifier" htmlFor={id} error={error} required action={action}>
      <div className="relative">
        <QrCodeIcon aria-hidden className={sheetLeadingIconClass} />
        <Input
          id={id}
          required
          maxLength={SKU_MAX_LENGTH}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="SKU-10492"
          {...errorProps(id, error)}
          className={cn(sheetFieldClass, "pl-10 font-mono")}
        />
      </div>
    </Field>
  );
}

export function BrandField({ idPrefix, value, onChange, error, required }: FieldProps) {
  const id = `${idPrefix}-brand`;
  const listId = `${idPrefix}-brand-options`;

  return (
    <Field label="Manufacturer / brand" htmlFor={id} error={error} required={required}>
      <div className="relative">
        <FactoryIcon aria-hidden className={sheetLeadingIconClass} />
        <Input
          id={id}
          list={listId}
          maxLength={BRAND_MAX_LENGTH}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="DeWalt"
          required={required}
          {...errorProps(id, error)}
          className={cn(sheetFieldClass, "pl-10")}
        />
      </div>
      <datalist id={listId}>
        {BRAND_SUGGESTIONS.map((brand) => (
          <option key={brand} value={brand} />
        ))}
      </datalist>
    </Field>
  );
}

export function NameField({ idPrefix, value, onChange, error, required }: FieldProps) {
  const id = `${idPrefix}-name`;

  return (
    <Field label="Product name" htmlFor={id} error={error} required={required}>
      <Input
        id={id}
        maxLength={NAME_MAX_LENGTH}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Heavy-duty angle grinder"
        required={required}
        {...errorProps(id, error)}
        className={sheetFieldClass}
      />
    </Field>
  );
}

export function CategoryField({ idPrefix, value, onChange }: FieldProps) {
  const id = `${idPrefix}-category`;
  const listId = `${idPrefix}-category-options`;

  return (
    <Field label="Category" htmlFor={id}>
      <>
        <Input
          id={id}
          list={listId}
          maxLength={CATEGORY_MAX_LENGTH}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Power tools"
          className={sheetFieldClass}
        />
        <datalist id={listId}>
          {CATEGORY_SUGGESTIONS.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </>
    </Field>
  );
}

export function DescriptionField({ idPrefix, value, onChange }: FieldProps) {
  const id = `${idPrefix}-description`;

  return (
    <Field label="Description" htmlFor={id} hint={`${value.length} / ${DESCRIPTION_LIMIT} chars`}>
      <Textarea
        id={id}
        rows={3}
        maxLength={DESCRIPTION_LIMIT}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="What distinguishes this item on a shelf photo?"
        className={sheetTextareaClass}
      />
    </Field>
  );
}
