function is_space_committee(committee) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Blank Matrix");
    var committee_col_num = 0;
    var found = sheet.getRange("B1:L116").getValues()[0].some((cell, index) => { if (cell == committee) { return true } });
    for (var i = 0; i < 12; i++) {
      if (sheet.getRange("B1:L116").getValues()[0][i] === committee) {
        // console.log("found");
        // console.log(sheet.getRange("B1:L116").getValues()[0][i]);
        // console.log(committee);
        committee_col_num = i;
      }
    }
    // console.log(committee_col_num);
    // console.log(String.fromCharCode(committee_col_num + 66) + "118");
    if (parseInt(sheet.getRange(String.fromCharCode(committee_col_num + 66) + "118").getValue()) > 0) {
      return true;
    } else {
      return false;
    }
  }
  
  function is_space_country(country) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Blank Matrix");
    var country_row = 0;
    for (var i = 0; i < 115; i++) {
      if (sheet.getRange("A1:L116").getValues()[i][0] === country) {
        country_row = i + 1;
      }
    }
    if (sheet.getRange("B" + country_row + ":L" + country_row).getValues()[0].some(cell => cell == '' || cell == null)) {
      return true;
    } else {
      return false;
    }
  
  }
  
  function random_assignment_country(attended) {
    // TODO: modify larger countries list according to Sterling's desires. Will this list be able to accomodate everyone who has attended before.
    var larger_countries = ["France", "Germany", "Italy", "Japan", "China", "Canada", "United States of America", "India", "United Kingdom"];
    console.log("random_assignment_country");
    var countries = [];
    // loop through rows (countries) to add them to the options list
    for (var i = 1; i <= 116; i++) {
      countries.push(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Blank Matrix").getRange("A" + i.toString()).getValue());
    }
    while (true) {
      if (attended) {
        var chosen_country = larger_countries[Math.floor(Math.random() * larger_countries.length)];
        if (is_space_country(chosen_country)) {
          return chosen_country
        }
      } else {
        var chosen_country = countries[Math.floor(Math.random() * countries.length)];
        if (is_space_country(chosen_country)) {
          return chosen_country
        }
      }
    }
  
  }
  
  // helper function for placing value in their appropriate spot
  function place_value(country, committee, school) {
    const numRows = 116;
    // because of unicode
    const numCols = "L".charCodeAt(0);
  
    var country_row = 0;
    var committee_col = 0;
  
    // loop through rows (countries)
    for (var i = 1; i <= numRows; i++) {
      var value = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Blank Matrix").getRange("A" + i.toString()).getValue();
      if (value == country) {
        country_row = i;
      }
    }
    // loop through columns
    for (let i = 66; i <= numCols; i++) {
      var value = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Blank Matrix").getRange(String.fromCharCode(i) + "1").getValue();
      if (value == committee) {
        committee_col = i;
      }
    }
    if (country_row != 0 && committee_col != 0) {
      // console.log("charcode: " + String.fromCharCode(committee_col) + country_row.toString());
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Blank Matrix").getRange(String.fromCharCode(committee_col) + country_row.toString()).setValue(school);
    } else {
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Blank Matrix").getRange("P1").setValue("error: school or committee not found");
    }
  
  }
  var assignments = [];
  // run per school
  function assign(school, num_attendees, attended) {
    // storing where this school starts in the assignments array so that we can start placing from that value later on
    initial_assignments_index = assignments.length;
    attended = attended == "Yes" ? true : false;
    // TODO: retrieve values from normal registration sheet
    var preferences = ["GA1", "GA2"];
    var committees = [];
    // putting all committee options in a list
    for (var i = 66; i <= "L".charCodeAt(0); i++) {
      committees.push(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Blank Matrix").getRange(String.fromCharCode(i) + "1").getValue());
    }
    var count = {};
    for (var i = 0; i < committees.length; i++) {
      count[committees[i]] = 0;
    }
    
    for (var i = 0; i < num_attendees; i++) {
      if (i < preferences.length) {
        if (is_space_committee(preferences[i])) {
          while (true) {
            var rand_choice = Math.floor(Math.random() * preferences.length);
            var assigned_country = random_assignment_country(attended);
            var previously_assigned = false;
            previously_assigned = assignments.some(assignment => assignment["country"] == assigned_country && assignment["committee"] == committees[rand_choice]);
            if (!previously_assigned) {
              assignments.push(
                {
                  "country": assigned_country,
                  "committee": preferences[i],
                  "school": school
                }
              );
              count[committees[rand_choice]] += 1;
              console.log("assignment_pushed");
              break;
            } else {
              console.log("previous assignment found in:" + assigned_country + ", " + committees[rand_choice]);
            }
          }
          
        }
      } else {
        while (true) {
          var rand_choice = Math.floor(Math.random() * committees.length);
          if (count[committees[rand_choice]] < 3 && is_space_committee(committees[rand_choice])) {
            console.log("from random committee loop:")
            var assigned_country = random_assignment_country(attended);
            var previously_assigned = false;
            previously_assigned = assignments.some(assignment => assignment["country"] === assigned_country && assignment["committee"] === committees[rand_choice]);
            if (!previously_assigned) {
              assignments.push(
                {
                  "country": assigned_country,
                  "committee": committees[rand_choice],
                  "school": school
                }
              );
              count[committees[rand_choice]] += 1;
              console.log("assignment_pushed");
              break;
            } else {
              console.log("previous assignment found in:" + assigned_country + ", " + committees[rand_choice]);
            }
          }
        }
  
      }
  
    }
    // console.log(assignments);
    // console.log(count);
    for (var i = initial_assignments_index; i < assignments.length; i++) {
      place_value(assignments[i]["country"], assignments[i]["committee"], assignments[i]["school"]);
    }
  }
  
  function main() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Normal Registration");
    var num_schools = 13; // TODO: remove hardcoded
    var schools = [];
    for (var i = 7; i < 7 + num_schools; i++) {
      schools.push(sheet.getRange("O" + i.toString()).getValue())
    }
    var num_attendees = [];
    for (var i = 7; i < 7 + num_schools; i++) {
      num_attendees.push(sheet.getRange("W" + i.toString()).getValue())
    }
    var attendeds = [];
    for (var i = 7; i < 7 + num_schools; i++) {
      attendeds.push(sheet.getRange("AA" + i.toString()).getValue())
    }
  
    for (var i = 0; i < num_schools; i++) {
      assign(schools[i], num_attendees[i], attendeds[i]);
    }
  
  }
  