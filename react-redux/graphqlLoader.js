const tag = require("graphql-tag");
const { print } = require("graphql");
const fs = require("fs");

//TODO: make this configurable
const queryLookup = eval("(" + fs.readFileSync("extracted_queries.json") + ")");

module.exports = src => {
  let queryAsString = print(tag(src));

  if (!(queryAsString in queryLookup)) {
    throw `Query ${queryAsString} not found`;
  }

  return "export default " + queryLookup[queryAsString];
};
