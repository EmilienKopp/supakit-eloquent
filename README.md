![npm](https://img.shields.io/npm/v/supakit-eloquent)
![npm](https://img.shields.io/npm/dy/:packageName)



# Project Name

A niche ORM for Supabase inspired by [Laravel Eloquent](https://laravel.com/docs/10.x/eloquent).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Model Class](#model-class)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

```bash
npm install supakit-eloquent
```

## Usage

## Initialization

1. SvelteKit

```typescript
// src/hooks.ts
import { Model } from 'supakit-eloquent';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createSupabaseServerClient({
        supabaseUrl: supabaseURL,
        supabaseKey: supabaseAnonKey,
        event,
    })
    Model.setConnection({client: event.locals.supabase});
    // or
    Model.setConnection({
        supabaseUrl: supabaseURL,
        supabaseKey: supabaseAnonKey,
    });
}
```

2. Other frameworks / vanilla JS

Yet to be tested. Use `Model.setConnection()` to set the connection to supabase wherever you
need to make sure it runs on startup / on every request.

```typescript
import { Model } from 'supakit-eloquent';

Model.setConnection({client: event.locals.supabase});
// or
Model.setConnection({
    supabaseUrl: supabaseURL,
    supabaseKey: supabaseAnonKey,
});

```

Alternatively, you can set the client in the extended model classes.

```typescript
import { Model } from 'supakit-eloquent';
import { createClient } from '@supabase/supabase-js';

export class User extends Model {
    protected static _connector = createClient({
        supabaseUrl: supabaseURL,
        supabaseKey: supabaseAnonKey,
    });
}

// or with the supabase client instance, anyway you usually get it

const client = useSupabaseClient();

export class User extends Model {
    protected static _connector = client;
}

```

### Extending the Model Class

The `Model` class is a core component of this project. It provides an abstraction for interacting with supabase. To use the `Model` class, follow these steps:

1. Create a class that extends the `Model` class.
The `User` class will inherit all the methods of the `Model` class. 
The table name will be automatically inferred from the class name if the class name is in `PascalCase`.

```typescript
import { Model } from 'supakit-eloquent';

export class User extends Model {
    // the table name will be inferred as "users"
}

export class UserProfile extends Model {
    // the table name will be inferred as "user_profiles"
}

export class BusinessPerson extends Model {
    // the table name will be inferred as "business_people"
}
```

2. Customize the primary key column and the table name. 

The table's id column will be inferred as `id` if not specified.
If the table name and/or the primary key are different from the inferred values, you can specify them in the class definition.

```typescript
import { Model } from 'supakit-eloquent';

// Simple primary key & custom table name
export class User extends Model {
    protected static _table = 'app_users';
    protected static _idColumn = 'user_id';
}

// Composite primary key & custom table name
export class BookmarkedPost extends Model {
    protected static _table = 'liked_posts';
    protected static _idColumn = ['user_id', 'post_id'];
}
```

3. Instance Methods

```typescript
import { User } from './lib/models/User'; // example

const user = new User({name: 'John Smith', email: 'smith@example.com'});

// Save the user as it currently is in the database
await user.save();

// Delete the user from the database
await user.delete();

// Update the user in the database. The user instance will be updated with the new data.
await user.update({name: 'Amy Pond'}); 

// Refresh the user's data from the database (in case it might have been updated by another process/source)
await user.refresh();

// Duplicate the user in the database
const duplicateUser = await user.duplicate();
```

4. Static Methods

```typescript

// Create a new user in the database
const user = await User.create({name: 'River Song', email: 'doctor.song@tardis.net'});

// Find a user by id
const user = await User.find(1);

// Delete a user by id (or any other primary key column)


## Contributing

Contributions are always welcome! I am yet to define guidelines for contributing to this project. In the meantime, feel free to open an issue or a pull request.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## Contact

Through my [website] (https://one-in-emilien.com) or on GitHub.