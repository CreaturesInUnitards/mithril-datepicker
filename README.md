# mithril-datepicker
Pick a date! But only if you're using Mithril, and only for flexbox-capable browsers.

Displays a date (defaults to today if none is supplied). 
Click the display to show/hide the calendar in month/date view.
Making a choice will hide the calendar.

With the calendar visible, click the month/year heading to toggle year/month view.
Making a choice will return to month/date view.

## Demo
[mithril-datepicker at flems.io](http://tinyurl.com/y7cje3tb)


## Usage
Works with Node.js modules, or as a standalone ES5 script. Either ```require``` it, or simply include a ```script``` tag sometime after including ```mithril```. then just use it as a component:

```
var DatePicker = require('path/to/mithril-datepicker.js')
var myDate = new Date(someSpecialDateYouHaveInMind)

m(DatePicker, {
  date: myDate,
  commit: function(chosenDate){
    // chosenDate is the date that got chosen. Or 'picked', if you will.
    // this is where we do what we need to do with it.
  }
})
```

## API
There are 2 optional attributes you can pass in via the component's ```attrs``` object:
1. ```date```:      any valid JS ```Date``` object
2. ```commit```:    function to execute when a date is chosen. Receives the newly-chosen ```Date``` object as its argument.

## Theming

If you're not using Node.js modules, put the following line in the ```head``` of your document:
 
```
<link rel="stylesheet" href="path/to/style.css" />
```

You can change the appearance easily by editing either ```style.css``` or ```style.sass```,
whichever fits your workflow. If you're using SASS, you have a lot of quick-change UI based on variables at the top of the document.
  
#### Firefox Problem:
Firefox doesn't render correctly if the ```$picker-width``` isn't an even multiple of 7. Isn't that silly?
 
