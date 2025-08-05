#!/bin/bash

# Example curl command to call the /execute-template endpoint
# Replace <YOUR_BACKSTAGE_TOKEN> with a valid Backstage token

# "https://github.com/AndrienkoAleksandr/shellImages"

curl -X POST http://localhost:7007/api/bulk-import/execute-template \
-H "Content-Type: application/json" \
-H "Authorization: Bearer ${token}" \
-d '{
  "templateName": "add-catalog-info",
  "repositories": [
    "github.com?repo=shellImages&owner=AndrienkoAleksandr"
  ],
  "optionalParameters": {
    "owner": "user:default/andrienkoaleksandr"
  },
  "useEnv": {
    "envParam1": "MY_ENV_VAR"
  }
}'