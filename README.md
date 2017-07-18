# mithril-datepicker
Pick a date! But only if you're using Mithril, and only for flexbox-capable browsers.

## Demo
[mithril-datepicker at flems.io](http://tinyurl.com/ybm6uhub)


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

You can change the appearance easily by editing either ```style.css``` or ```style.sass```,
whichever fits your workflow. If you're using SASS, you have a lot of quick-change UI based on variables at the top of the document.
 
