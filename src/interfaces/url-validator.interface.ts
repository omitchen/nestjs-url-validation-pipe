export interface IUrlValidator {
  /**
   * Check if the given URL string is valid.
   * @param url The URL string to be checked.
   * @returns Returns true if the URL is valid, otherwise returns false.
   */
  isValid(url: string): boolean;
}
