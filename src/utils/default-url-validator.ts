import { IUrlValidator } from "../interfaces/url-validator.interface";
import { ValidateSourcePipeOptions } from "../types/validate-source.types";

/**
 * Default URL validator implementation using native URL constructor for basic validation
 * and supporting domain whitelisting.
 */
export class DefaultUrlValidator implements IUrlValidator {
  private readonly allowedDomainsRegExp?: RegExp;

  constructor(private readonly options?: ValidateSourcePipeOptions) {
    if (options?.allowedDomains && options.allowedDomains.length > 0) {
      const escapedDomains = options.allowedDomains.map((domain) =>
        domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      );
      this.allowedDomainsRegExp = new RegExp(
        `^https?://(?:${escapedDomains.join("|")})(/|$|:)`,
      );
    }
  }

  isValid(url: string): boolean {
    if (!url || url.trim().length === 0) {
      return false;
    }

    if (/\s/.test(url)) {
      return false;
    }

    try {
      const parsedUrl = new URL(url);
      console.log("parsedUrl ===> ", parsedUrl);

      const httpOnly = (this as any).options?.httpOnly ?? true;
      if (httpOnly && !parsedUrl.protocol.match(/^https?:$/)) {
        return false;
      }

      if (
        !parsedUrl.hostname ||
        parsedUrl.hostname === ".com" ||
        !/^[^.]+\.[^.]+/.test(parsedUrl.hostname)
      ) {
        return false;
      }

      if (this.allowedDomainsRegExp) {
        return this.allowedDomainsRegExp.test(url);
      }

      return true;
    } catch (e) {
      return false; // URL format is invalid
    }
  }
}
