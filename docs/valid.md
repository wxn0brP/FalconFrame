# Validation Engine

The validation engine provides a schema-based approach to validate data with a rich set of rules and convenient aliases.

## Basic Usage

```typescript
import { validate } from "@wxn0brp/falcon-frame";

const schema = {
  email: "required|email",
  age: "required|number|min:18",
  username: "required|string|min:3|max:20"
};

const data = {
  email: "user@example.com",
  age: 25,
  username: "john_doe"
};

const result = validate(schema, data);

if (result.valid) {
  console.log("Validation passed");
} else {
  console.log("Validation errors:", result.validErrors);
}
```

## Regex Validation

Regex patterns are passed as a separate parameter to avoid conflicts with the `|` and `:` separators used in schema rules:

```typescript
const schema = {
  website: "required|string",
  code: "required|string"
};

const regexRules = {
  website: /^https?:\/\/.+/,
  code: "^[A-Z]{3}-[0-9]{4}$"
};

const result = validate(schema, data, regexRules);
```

Both `RegExp` objects and string patterns are supported.

## Schema Format

Schemas are defined as objects where keys are field names and values are pipe-separated rule strings:

```typescript
const schema = {
  fieldName: "rule1|rule2:param|rule3"
};
```

Parameters are passed using the `:` separator.

## Optional Fields

Fields marked with `optional`, `nullable`, or `opt` skip all validation rules when the value is `null` or `undefined`:

```typescript
const schema = {
  email: "optional|email"
};

validate(schema, { email: null }); // Valid
validate(schema, { email: undefined }); // Valid
validate(schema, { email: "invalid" }); // Invalid - email format error
validate(schema, { email: "valid@example.com" }); // Valid
```

## Validation Rules

### Type Checking

| Rule | Aliases | Description |
|------|---------|-------------|
| `required` | `r` | Field must be present and not empty (except `0`) |
| `string` | `str`, `s` | Value must be a string |
| `number` | `num`, `n` | Value must be a number |
| `integer` | `int`, `i` | Value must be an integer |
| `boolean` | `bool`, `b` | Value must be a boolean |
| `array` | `arr`, `a` | Value must be an array |
| `object` | `obj`, `o` | Value must be an object (not array, not null) |

### String Length & Number Range

| Rule | Description |
|------|-------------|
| `min:N` | String length >= N, number value >= N, or array length >= N |
| `max:N` | String length <= N, number value <= N, or array length <= N |
| `between:min,max` | String length or number value between min and max (inclusive) |

### Value Constraints

| Rule | Description |
|------|-------------|
| `in:val1,val2,val3` | Value must be one of the specified values |
| `not_in:val1,val2,val3` | Value must not be one of the specified values |
| `same:field` | Value must equal another field's value |
| `diff:field` or `different:field` | Value must differ from another field's value |

### Format Validation

| Rule | Description |
|------|-------------|
| `email` | Must be a valid email format |

## Examples

### User Registration

```typescript
const schema = {
  username: "required|string|min:3|max:20",
  email: "required|email",
  password: "required|string|min:8",
  confirmPassword: "required|same:password",
  age: "required|number|min:18|max:120"
};
```

### Product Validation

```typescript
const schema = {
  name: "required|string|max:100",
  price: "required|number|min:0",
  category: "required|in:electronics,clothing,books,other",
  tags: "optional|array|max:5",
  description: "optional|string|max:1000"
};
```

### API Request Validation

```typescript
const schema = {
  action: "required|in:create,update,delete",
  resourceId: "required|integer",
  metadata: "optional|object",
  notify: "optional|boolean"
};
```

### Profile Update

```typescript
const schema = {
  email: "optional|email",
  bio: "optional|string|max:500",
  website: "optional|string",
  social: "optional|object"
};

const regexRules = {
  website: /^https?:\/\/.+/
};

validate(schema, data, regexRules);
```

## Middleware Usage

Use `validateBody` to validate request bodies in route handlers:

```typescript
import { validateBody } from "@wxn0brp/falcon-frame";

app.post("/register", 
  validateBody({
    email: "required|email",
    password: "required|string|min:8"
  }),
  (req, res) => {
    // Validation passed, proceed with registration
    res.json({ success: true });
  }
);
```

With regex validation:

```typescript
app.post("/profile",
  validateBody(
    {
      website: "optional|string",
      phone: "required|string"
    },
    {
      website: /^https?:\/\/.+/,
      phone: "^\\+?[0-9]{9,15}$"
    }
  ),
  (req, res) => {
    res.json({ success: true });
  }
);
```

If validation fails, the middleware automatically responds with a 400 status and error details.

## Return Value

The `validate` function returns:

```typescript
{
  valid: boolean,
  validErrors: {
    [fieldName]: string[]
  }
}
```

Example error response:

```typescript
{
  valid: false,
  validErrors: {
    email: ["email must be a valid email"],
    age: ["age must be at least 18"]
  }
}
```
