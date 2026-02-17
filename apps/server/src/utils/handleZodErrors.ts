import { ZodError } from "zod";
import { CustomError } from "./CustomError";
import { ResponseStatus } from "./constants";

const handleZodError = <T>(result: any): T => {
  if (!result.success) {
    const error = result.error as ZodError;

    const missing = error.issues.find(
      (issue) => issue.code === "invalid_type"
    );

    if (missing) {
      throw new CustomError(
        ResponseStatus.BadRequest,
        `Zod Missing required field ${missing.path.join(".")}`
      );
    }

    const firstIssue = error.issues[0];

    throw new CustomError(
      ResponseStatus.BadRequest,
      firstIssue ? firstIssue.message : "Validation error"
    );
  }

  return result.data;
};

export { handleZodError };
