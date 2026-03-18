import { z } from "zod";
import { Resolver } from "react-hook-form";

export type FormData = z.infer<typeof formSchema>;

const formSchema = z.object({
  name: z.string().optional(),
  email: z.email("Invalid email format").min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    /* .refine((password: string) => /[0-9]/.test(password), {
      message: "Password must contain at least one number.",
    })
    //.refine((password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
      message: "Password must contain at least one special character",
    }) */
    .optional()
    .default("12345678"),
});

export const zodResolver: Resolver<FormData> = async (values) => {
  const result = formSchema.safeParse(values);
  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const errorTree = z.treeifyError(result.error);
  /**
   * The code snippet processes a Zod validation error to create a simplified,
   * flat object containing only the first error message for each top-level property of a form.
   *  This format is typically used for displaying a single, user-friendly error message next to
   * each form field in a user interface
   */
  const errors = Object.entries(errorTree.properties ?? {}).reduce(
    (acc, [key, node]) => {
      if (node?.errors?.length) {
        acc[key as keyof FormData] = {
          type: "validation",
          message: node.errors[0],
        };
      }
      return acc;
    },
    {} as Record<keyof FormData, any>,
  );

  return { values: {}, errors };
};
