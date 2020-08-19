---
id: using-enums
title: Using Enums
---

Currently, the graphql-code-generator when generating the Data types replaces all enums with strings. It makes sense from a factual point - the data in a JSON format (coming from a REST call or mongodb query or most other things) will contain a string, not enum. Nonetheless, that makes testing harder, and the code less strict. 

We have a terrible hack for it, and plan to fix it in a plugin at some point.

For now - add lines like these to your top-level fix-generated.js .

```javascript
shell.sed("-i", "currency: string", "currency: Currency", path);
shell.sed("-i", "status: string", "status: EntityStatus", path);
```
