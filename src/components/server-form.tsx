"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createServerSchema,
  type CreateServerInput,
} from "@/lib/validations/server";
import { CATEGORIES, PRICING_MODELS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ServerFormProps {
  defaultValues?: Partial<CreateServerInput>;
  onSubmit: (data: CreateServerInput) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

function PricingFields({
  pricingModel,
  register,
  errors,
}: {
  pricingModel: string;
  register: ReturnType<typeof useForm<CreateServerInput>>["register"];
  errors: ReturnType<typeof useForm<CreateServerInput>>["formState"]["errors"];
}) {
  if (pricingModel === "SUBSCRIPTION") {
    return (
      <Input
        label="Monthly Price (USD)"
        type="number"
        step="0.01"
        min="0"
        error={errors.price?.message}
        {...register("price", { valueAsNumber: true })}
      />
    );
  }
  if (pricingModel === "USAGE") {
    return (
      <>
        <Input
          label="Price per Call (USD)"
          type="number"
          step="0.0001"
          min="0"
          error={errors.usagePrice?.message}
          {...register("usagePrice", { valueAsNumber: true })}
        />
        <Input
          label="Free Call Limit"
          type="number"
          min="0"
          error={errors.freeCallLimit?.message}
          {...register("freeCallLimit", { valueAsNumber: true })}
        />
      </>
    );
  }
  return null;
}

function HostingFields({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<CreateServerInput>>["register"];
  errors: ReturnType<typeof useForm<CreateServerInput>>["formState"]["errors"];
}) {
  return (
    <>
      <Input
        label="Docker Image"
        placeholder="e.g. ghcr.io/user/my-mcp-server:latest"
        error={errors.dockerImage?.message}
        {...register("dockerImage")}
      />
      <Input
        label="GitHub Repository URL"
        type="url"
        placeholder="https://github.com/user/repo"
        error={errors.githubRepoUrl?.message}
        {...register("githubRepoUrl")}
      />
    </>
  );
}

export function ServerForm({
  defaultValues,
  onSubmit,
  submitLabel = "Submit",
  isLoading = false,
}: ServerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateServerInput>({
    resolver: zodResolver(createServerSchema),
    defaultValues: {
      pricingModel: "FREE",
      managedHosting: false,
      category: "general",
      tags: [],
      ...defaultValues,
    },
  });

  const pricingModel = watch("pricingModel");
  const managedHosting = watch("managedHosting");

  async function handleFormSubmit(data: CreateServerInput) {
    await onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="Server Name"
        placeholder="My Awesome MCP Server"
        error={errors.name?.message}
        {...register("name")}
      />

      <Textarea
        label="Short Description"
        placeholder="A concise description of what your server does (max 200 chars)"
        maxLength={200}
        error={errors.description?.message}
        {...register("description")}
      />

      <Textarea
        label="Long Description (Markdown, optional)"
        placeholder="Detailed description, features, usage instructions..."
        className="min-h-[160px]"
        error={errors.longDescription?.message}
        {...register("longDescription")}
      />

      <Select
        label="Category"
        options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
        error={errors.category?.message}
        {...register("category")}
      />

      <Input
        label="Tags (comma-separated)"
        placeholder="api, productivity, automation"
        error={errors.tags?.message}
        {...register("tags", {
          setValueAs: (v: string | string[]) => {
            if (Array.isArray(v)) return v;
            return v
              ? v
                  .split(",")
                  .map((t: string) => t.trim())
                  .filter(Boolean)
              : [];
          },
        })}
      />

      <Select
        label="Pricing Model"
        options={PRICING_MODELS.map((p) => ({
          value: p.value,
          label: p.label,
        }))}
        error={errors.pricingModel?.message}
        {...register("pricingModel")}
      />

      <PricingFields
        pricingModel={pricingModel}
        register={register}
        errors={errors}
      />

      <div className="flex items-center gap-2">
        <input
          id="managedHosting"
          type="checkbox"
          className="h-4 w-4 rounded border-input"
          {...register("managedHosting")}
        />
        <label htmlFor="managedHosting" className="text-sm font-medium">
          Use Managed Hosting (MCPmarket hosts your server)
        </label>
      </div>

      {managedHosting ? (
        <HostingFields register={register} errors={errors} />
      ) : (
        <Input
          label="Endpoint URL"
          type="url"
          placeholder="https://your-server.com/mcp"
          error={errors.endpointUrl?.message}
          {...register("endpointUrl")}
        />
      )}

      <Input
        label="Logo URL (optional)"
        type="url"
        placeholder="https://example.com/logo.png"
        error={errors.logoUrl?.message}
        {...register("logoUrl")}
      />

      <Input
        label="Repository URL (optional)"
        type="url"
        placeholder="https://github.com/user/repo"
        error={errors.repoUrl?.message}
        {...register("repoUrl")}
      />

      <Input
        label="Website URL (optional)"
        type="url"
        placeholder="https://myserver.com"
        error={errors.websiteUrl?.message}
        {...register("websiteUrl")}
      />

      <Button
        type="submit"
        loading={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
