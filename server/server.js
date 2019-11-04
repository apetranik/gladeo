const express = require('express')
const app = express();
const { port, apiKey, airtableID } = require('../config');

const Airtable = require('airtable')
var base = new Airtable({ apiKey: apiKey }).base(airtableID);

app.listen(port);
console.log('App is listening on port ' + port);

// API call to get Airtable data
// EXAMPLE
app.get('/api/get/company_codes', (req, res) => {
  let companies = [];
  base('Company Codes').select({
    // Selecting the first 3 records in Grid view:
    maxRecords: 3,
    view: "Grid view"
  }).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.
    records.forEach(function (record) {
      const company = {
        company: record.get('company'),
        code: record.get('code')
      }
      companies.push(company)
      console.log('Retrieved', company);
    });
    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();
  },
    // Callback function
    function done(err) {
      // Failure
      if (err) {
        console.error(err); return;
      }
      // SUCCESS
      return res.json(companies);
    });
})