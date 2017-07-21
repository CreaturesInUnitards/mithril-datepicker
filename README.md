# mithril-datepicker
Pick a date! But only if you're using Mithril, and only for flexbox-capable browsers.

## Demo
[mithril-datepicker at flems.io](http://tinyurl.com/yd3d3nbt)


## Usage
Works with Node.js modules, or as a standalone ES5 script. Either ```require``` it, or simply include a ```script``` tag sometime after including ```mithril```. then just use it as a component:

```js
var DatePicker = require('path/to/mithril-datepicker.js')
var myDate = new Date(someSpecialDateYouHaveInMind)

m(DatePicker, {
  date: myDate,
  onchange: function(chosenDate){
    // chosenDate is the date that got chosen. Or 'picked', if you will.
    // this is where we do what we need to do with it.
  }
})
```

## API
There are 2 optional attributes you can pass in via the component's ```attrs``` object:
- ```date```:      any valid JS ```Date``` object. Defaults to the current date.
- ```onchange```:    function to execute when a date is chosen. Receives the newly-chosen ```Date``` object as its argument.

## Theming

You can change the appearance easily by editing either ```style.css``` or ```style.sass```,
whichever fits your workflow. If you're using SASS, you have a lot of quick-change UI based on variables at the top of the document.
 
## Localization

```mithril-datepicker``` features 2 flavors of L10n: global and per-instance. In both cases, the English default names
for days of the week, months and the labels for the previous/next buttons can all be overridden, along with the week's 
starting day.

- ```weekStart```: 0-6, defaulting to 0 (Sunday)
- ```days```: array of strings for the names of the days of the week, beginning with Sunday. Defaults to English.
- ```months```: array of strings for the names of the months, beginning with January. Defaults to English.
- ```prevNextTitles```: array of strings for incrementing the view by 1 month, 1 year and 10 years. Defaults to ```['1 Mo', '1 Yr', '10 Yr']```


To globally set the language for all datepickers in your project:

```js
DatePicker.localize({
  weekStart: 1, // 
  days: ['Domingo', 'Lunes', 'Martes'...],
  months: ['Enero', 'Febrero', 'Marzo'...],
  prevNextTitles: ['1 Me', '1 Añ', '10 Añ']
})
```

To set the language for a single datepicker, overriding the default/global setting, pass a ```localeData``` object to
the component's ```attrs```:

```js
m(DatePicker, {
  date: myDate,
  onchange: myOnchangeFn,
  localeData: {
    days: ['Domingo', 'Lunes', 'Martes'...],
    months: ['Enero', 'Febrero'...],
    prevNextTitles: ['1 Me', '1 Añ', '10 Añ']
  } 
})
```

