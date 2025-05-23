import {
  BadRequestException,
  Injectable,
  PipeTransform,
  Inject,
  Optional,
  Logger,
} from "@nestjs/common";
import { IUrlValidator } from "../interfaces/url-validator.interface";
import { DefaultUrlValidator } from "../utils/default-url-validator";
import { ValidateSourcePipeOptions } from "../types/validate-source.types";

export const URL_VALIDATOR_TOKEN = "URL_VALIDATOR";
export const VALIDATE_SOURCE_PIPE_OPTIONS = "VALIDATE_SOURCE_PIPE_OPTIONS";

@Injectable()
export class ValidateSourcePipe implements PipeTransform {
  private readonly urlValidator: IUrlValidator;
  private readonly logger = new Logger(ValidateSourcePipe.name);
  private readonly options: ValidateSourcePipeOptions;

  constructor(
    optionsOrValidator?: ValidateSourcePipeOptions | IUrlValidator,
    @Optional() @Inject(URL_VALIDATOR_TOKEN) injectedValidator?: IUrlValidator,
    @Optional()
    @Inject(VALIDATE_SOURCE_PIPE_OPTIONS)
    injectedOptions?: ValidateSourcePipeOptions,
  ) {
    if (this.isValidateSourcePipeOptions(optionsOrValidator)) {
      this.options = {
        httpOnly: true,
        errorMessage: "Invalid source URL",
        allowedDomains: [],
        ...optionsOrValidator,
      };
      this.urlValidator =
        injectedValidator || new DefaultUrlValidator(this.options);
    } else if (this.isUrlValidator(optionsOrValidator)) {
      this.options = {
        httpOnly: true,
        errorMessage: "Invalid source URL",
        allowedDomains: [],
        ...injectedOptions,
      };
      this.urlValidator = optionsOrValidator;
    } else {
      this.options = {
        httpOnly: true,
        errorMessage: "Invalid source URL",
        allowedDomains: [],
        ...injectedOptions,
      };
      this.urlValidator =
        injectedValidator || new DefaultUrlValidator(this.options);
    }
  }

  private isValidateSourcePipeOptions(
    obj: any,
  ): obj is ValidateSourcePipeOptions {
    return obj && typeof obj === "object" && !("isValid" in obj);
  }

  private isUrlValidator(obj: any): obj is IUrlValidator {
    return obj && typeof obj === "object" && typeof obj.isValid === "function";
  }

  transform(value: any) {
    const shouldValidateString = (str: string): boolean => {
      return this.options.httpOnly
        ? str.startsWith("http") || str.startsWith("https")
        : true;
    };

    const throwError = (message: string) => {
      throw new BadRequestException(message);
    };

    if (typeof value === "string") {
      if (shouldValidateString(value)) {
        if (!this.urlValidator.isValid(value)) {
          this.logger.error({
            message: this.options.errorMessage,
            value,
          });
          throwError(this.options.errorMessage);
        }
      }
      return value;
    }

    if (typeof value === "object" && value !== null) {
      const keysToValidate =
        this.options.fieldsToValidate &&
        this.options.fieldsToValidate.length > 0
          ? this.options.fieldsToValidate
          : Object.keys(value);

      for (const key of keysToValidate) {
        const prop = value[key];
        if (typeof prop === "string" && shouldValidateString(prop)) {
          if (!this.urlValidator.isValid(prop)) {
            this.logger.error({
              message: `${this.options.errorMessage} in field`,
              field: key,
              value: prop,
            });
            throwError(`${this.options.errorMessage} in field: ${key}`);
          }
        }
      }
    }

    return value;
  }
}
