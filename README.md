# yvr-core

`yvr-core` is a utility package for Node.js that simplifies the process of loading Mongoose models in your project. It allows you to define a global path for your models directory and easily import models wherever you need them.

## Installation

To install the package, use npm:

```bash
npm install yvr-core

```
## How To Use
To use `yvr-core` in your project, follow these steps:

1. Import the package into your file:

```javascript
// app.js
const { setModelsPath } = require('yvr-core');

// Set the path to your models directory
setModelsPath('./src/models');

// Now the models path is globally available for the entire project
```

2. Set the global path for your models directory:

```javascript
// In any other file, e.g., routes.js
const { loadModels } = require('yvr-core');

// Load the models
const { Collection, User, Product } = loadModels();

// Now you can use your models as needed
// Example: Fetch all users from the database
async function getAllUsers(req, res) {
    const users = await User.find({});
    res.json(users);
}
```
## Configuration

To configure `yvr-core`, create a `yvr-core.config.js` file in the root of your project:

```javascript
// yvr-core.config.js
module.exports = {
  modelsPath: './src/models',  // Path to your models directory
};
