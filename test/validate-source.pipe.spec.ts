import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import {
  ValidateSourcePipe,
  URL_VALIDATOR_TOKEN,
  VALIDATE_SOURCE_PIPE_OPTIONS,
} from "../src/pipes/validate-source.pipe";
import { DefaultUrlValidator } from "../src/utils/default-url-validator";
import { IUrlValidator } from "../src/interfaces/url-validator.interface";

describe("ValidateSourcePipe", () => {
  let pipe: ValidateSourcePipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ValidateSourcePipe,
          useFactory: (validator: IUrlValidator, options: any) => {
            return new ValidateSourcePipe(validator, options);
          },
          inject: [URL_VALIDATOR_TOKEN, VALIDATE_SOURCE_PIPE_OPTIONS],
        },
        {
          provide: URL_VALIDATOR_TOKEN,
          useClass: DefaultUrlValidator,
        },
        {
          provide: VALIDATE_SOURCE_PIPE_OPTIONS,
          useValue: {},
        },
      ],
    }).compile();

    pipe = module.get<ValidateSourcePipe>(ValidateSourcePipe);
  });

  describe("Basic Validation", () => {
    it("should pass valid string inputs", () => {
      const validInputs = [
        "http://example.com",
        "https://test.com/path",
        "ftp://example.com",
        "just-a-string",
      ];

      validInputs.forEach((input) => {
        expect(pipe.transform(input)).toBe(input);
      });
    });

    it("should reject invalid HTTP/HTTPS URLs", () => {
      const invalidInputs = ["http://invalid url", "https://.com", "http://"];

      invalidInputs.forEach((input) => {
        expect(() => pipe.transform(input)).toThrow(BadRequestException);
      });
    });
  });

  describe("Array Validation", () => {
    it("should validate all URLs in array", () => {
      const input = ["http://valid.com", "https://test.com"];
      expect(pipe.transform(input)).toEqual(input);
    });

    it("should throw when array contains invalid URL", () => {
      const input = ["http://valid.com", "http://invalid url"];
      expect(() => pipe.transform(input)).toThrow(BadRequestException);
    });
  });

  describe("Object Validation", () => {
    it("should validate all fields in object", () => {
      const input = {
        url: "http://valid.com",
        nested: {
          url: "https://test.com",
        },
      };
      expect(pipe.transform(input)).toEqual(input);
    });

    it("should throw when object contains invalid URL", () => {
      const input = {
        url: "http://valid.com",
        nested: {
          url: "http://invalid url",
        },
      };
      expect(() => pipe.transform(input)).toThrow(BadRequestException);
    });
  });

  describe("Configuration Options", () => {
    describe("Specific Fields Validation", () => {
      let fieldsPipe: ValidateSourcePipe;

      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            {
              provide: ValidateSourcePipe,
              useFactory: (validator: IUrlValidator, options: any) => {
                return new ValidateSourcePipe(validator, options);
              },
              inject: [URL_VALIDATOR_TOKEN, VALIDATE_SOURCE_PIPE_OPTIONS],
            },
            {
              provide: URL_VALIDATOR_TOKEN,
              useClass: DefaultUrlValidator,
            },
            {
              provide: VALIDATE_SOURCE_PIPE_OPTIONS,
              useValue: { fieldsToValidate: ["url", "nested.url"] },
            },
          ],
        }).compile();

        fieldsPipe = module.get<ValidateSourcePipe>(ValidateSourcePipe);
      });

      it("should only validate specified fields", () => {
        const input = {
          url: "http://valid.com",
          other: "http://invalid url", // won't be validated
          nested: {
            url: "https://valid.com",
            other: "invalid", // won't be validated
          },
        };
        expect(fieldsPipe.transform(input)).toEqual(input);
      });
    });

    describe("Custom Validator", () => {
      class CustomUrlValidator implements IUrlValidator {
        isValid(url: string): boolean {
          return url.startsWith("https://");
        }
      }

      let customPipe: ValidateSourcePipe;

      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            {
              provide: ValidateSourcePipe,
              useFactory: (validator: IUrlValidator, options: any) => {
                return new ValidateSourcePipe(validator, options);
              },
              inject: [URL_VALIDATOR_TOKEN, VALIDATE_SOURCE_PIPE_OPTIONS],
            },
            {
              provide: URL_VALIDATOR_TOKEN,
              useClass: CustomUrlValidator,
            },
            {
              provide: VALIDATE_SOURCE_PIPE_OPTIONS,
              useValue: {},
            },
          ],
        }).compile();

        customPipe = module.get<ValidateSourcePipe>(ValidateSourcePipe);
      });

      it("should use custom validation logic", () => {
        expect(customPipe.transform("https://valid.com")).toBe(
          "https://valid.com",
        );
        expect(() => customPipe.transform("http://invalid.com")).toThrow(
          BadRequestException,
        );
      });
    });
  });
});
