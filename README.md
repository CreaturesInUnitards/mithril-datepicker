# mithril-datepicker
Pick a date! But only if you're using Mithril.

Displays a date (defaults to today if none is supplied). Click the display to show/hide the calendar/picker. Making a choice will also do the hiding.

## Usage
Include ```picker.js```, then just use it as a component:

```
var DatePicker = require('path_to_picker.js')
var myDate = new Date(someSpecialDateYouHaveInMind)

m(DatePicker, {
  date: myDate,
  commit: function(chosenDate){
    // chosenDate is the date that got chosen. Or 'picked', if you will.
    // this is where we do what we need to do with it.
  }
})
```

Of course, you can change the appearance easily by editing ```style.css```.
