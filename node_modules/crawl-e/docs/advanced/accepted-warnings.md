# Accepted Warnings

The framework logs a number of warnings about different issues, such as no showtimes in output result or time parsing problems. This warnings are meant to hint the developers to the corresponding issues. 

In some cases, however this issues are actually acceptable due to special circumstances. There for it is possible to define a map of `acceptedWarnings` with a reason explaining why a given type of warning is okay to ignore. Each of the framework's warning comes with a code, that must be used as key for the map. 

!> This feauter shall only be used if warnings can not be avoided in the first place.

**Example:**
```javascript
let config = {
  cinemas: { /* ... */ },
  showtimes: { /* ... */ }
  acceptedWarnings: {
    7: 'Cinema is an open air location and therefore may have no showtimes during winter.'
  }
}
```

