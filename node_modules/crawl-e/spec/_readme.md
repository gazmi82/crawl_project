# Generated Schemas

This folder contains schema generated from TypeScript interfaces via the `typescript-json-schema` command line tool. 

The schema are sym-linked to the parent folder and should not be edited manually. 

When updating the schemas please double check before git commiting. 


## Updating the schemas 

### Models 

- execute `yarn run generate:model-schemas` to update schema after making changes to on of the model interfaces. 

### Context

! `Context` seems to be a reserved keyword or sth. so it does not work. Hence the interface Name needs to be temporarly renamed for the schema generation.  

- rename `interface Context` to `interface Foo`
- execute `yarn run generate:context-schema`
- discard the interface renaming in git
- discard the following changes in `spec/_from_typescript/context-schema.json`
  - `"definitions": { … }` object
  - `"$ref"` for cinema 
  - `"$ref"` for movie




