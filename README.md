<p align="center">
<a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>
<h1 align="center">NestJS URL Validation Pipe 🔗</h1>

<p align="center">
 A pipeline for validating URLs in request payloads in NestJS applications, providing simple and powerful URL validation capabilities.
 <p align="center">
    <a href="https://www.npmjs.com/package/nestjs-url-validation-pipe" target="_blank"><img alt="npm version" src="https://img.shields.io/npm/v/nestjs-url-validation-pipe" /></a>
    <a href="https://www.npmjs.com/package/nestjs-url-validation-pipe" target="_blank"><img alt="NPM" src="https://img.shields.io/npm/l/nestjs-url-validation-pipe" /></a>
    <a href="https://www.npmjs.com/package/nestjs-url-validation-pipe" target="_blank"><img alt="npm downloads" src="https://img.shields.io/npm/dm/nestjs-url-validation-pipe" /></a>
  </p>
</p>

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Example](#example)
- [Configuration](#configuration)
- [Google Sheet Setup](#google-sheet-setup)
- [Contact and Feedback](#contact-and-feedback)
- [License](#license)

## Description

A pipeline for validating URLs in request payloads in NestJS applications, providing simple and powerful URL validation capabilities.
## Installation

Install the package using npm:

```bash
npm install nestjs-url-validation-pipe
```

## Example

Integrate <strong>nestjs-url-validation-pipe</strong> into your NestJS application:

1. Module Configuration

Import ValidateSourcePipe and its related tokens/interfaces into your AppModule or any feature module where you want to provide configuration.

```typescript
// src/app.module.ts (or your main module)
import { Module } from '@nestjs/common';
import { ValidateSourcePipe, VALIDATE_SOURCE_PIPE_OPTIONS, URL_VALIDATOR_TOKEN, DefaultUrlValidator } from 'nestjs-url-validation-pipe';

@Module({
  imports: [
    // ... other modules
  ],
  controllers: [],
  providers: [
    // 1. Make ValidateSourcePipe available in the DI container
    ValidateSourcePipe,
    // 2. Provide options for the pipe (optional)
    {
      provide: VALIDATE_SOURCE_PIPE_OPTIONS,
      useValue: {
        httpOnly: true, // Default: validate only http/https URLs
        errorMessage: 'Invalid resource URL provided', // Custom error message
        allowedDomains: [ // Enable domain whitelisting
          'example.com',
        ],
        // fieldsToValidate: ['imageUrl', 'profileUrl'], // Optional: only validate these specific fields in an object
      },
    },
    // 3. (Optional) Provide a custom URL validator if DefaultUrlValidator is not sufficient
    // {
    //   provide: URL_VALIDATOR_TOKEN,
    //   useClass: YourCustomUrlValidator, // YourCustomUrlValidator must implement IUrlValidator
    // }
  ],
})
export class AppModule {}
```

2. Global Usage

For ValidateSourcePipe to apply to all incoming requests across your application, register it as a global pipe in your main.ts file.


```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidateSourcePipe } from 'nestjs-url-validation-pipe'; // Import your pipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Retrieve the instance from the DI container
  const validateSourcePipe = app.get(ValidateSourcePipe);

  // Register as a global pipe
  app.useGlobalPipes(validateSourcePipe);

  // If you are also using NestJS built-in ValidationPipe (e.g., with class-validator),
  // you might register them like this (order matters):
  // app.useGlobalPipes(
  //   new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  //   validateSourcePipe,
  // );

  await app.listen(3000);
}
bootstrap();
```

3. Controller/Route-Specific Usage

You can also apply the pipe to specific controllers or individual routes.

```typescript
// src/some.controller.ts
import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ValidateSourcePipe } from 'nestjs-url-validation-pipe'; // Import pipe

@Controller('items')
export class ItemsController {
  @Post()
  @UsePipes(ValidateSourcePipe) // Apply pipe to this route handler
  createItem(@Body() itemDto: any) {
    // itemDto's URL fields will be validated by the pipe
    return `Item created with data: ${JSON.stringify(itemDto)}`;
  }

  @Post('update')
  @UsePipes(new ValidateSourcePipe({
    errorMessage: 'Update URL is invalid!',
    fieldsToValidate: ['avatarUrl'] // Only validate avatarUrl for this specific route
  }))
  updateItem(@Body() updateDto: any) {
    // updateDto's avatarUrl field will be validated
    return `Item updated with data: ${JSON.stringify(updateDto)}`;
  }
}
```

## Contact and Feedback

Feel free to reach out if you have any questions or suggestions.

## License

This project is licensed under the MIT License.