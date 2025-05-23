export interface ValidateSourcePipeOptions {
  /**
   * whether to only validate urls that start with 'http' or 'https'.
   * default is true, consistent with the original behavior.
   * if set to false, the DefaultUrlValidator will validate all urls with valid protocols.
   */
  httpOnly?: boolean;
  /**
   * custom error message.
   */
  errorMessage?: string;
  /**
   * when the value is an object, only validate the specified fields.
   * if not specified, it will validate all string fields that start with 'http'.
   */
  fieldsToValidate?: string[];
  /**
   * allowed domains list.
   * if provided, the url must belong to one of these domains to be valid.
   */
  allowedDomains?: string[];
}
