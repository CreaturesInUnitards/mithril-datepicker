# mithril-datepicker
Pick a date! But only if you're using Mithril, and only for flexbox-capable browsers.

## Demo
[mithril-datepicker at flems.io](https://tinyurl.com/ycugf85y)

## Installation

via npm:

```npm install mithril-datepicker```

You'll want to bring in either ```src/style.sass``` or ```src/style.css```, depending on your workflow. 
  
## Usage

```js
var DatePicker = require('path/to/mithril-datepicker.js')
var myDate = new Date(someSpecialDateYouHaveInMind)

m(DatePicker, {
  date: myDate,
  onchange: function(chosenDate){
    // do your magic with your shiny new Date
  }
})
```

## API
There are 2 optional attributes you can pass in via the component's ```attrs``` object:
- ```date```:      a valid JS ```Date``` object. Defaults to the current date.
- ```onchange```:    function to execute when a date is chosen. Receives the newly-chosen ```Date``` object as its argument.

## Theming

You can change the appearance easily by editing either ```style.css``` or ```style.sass```,
whichever fits your workflow. If you're using SASS, you have a lot of quick-change UI based on variables at the top of the document.
 
## Localization

```mithril-datepicker``` features 2 flavors of L10n: global and per-instance. In both cases, the English default names
for days of the week, months and the labels for the previous/next buttons can all be overridden, along with the week's 
starting day.

| ATTRIBUTE            | TYPE     | DESCRIPTION              |
| :------------------- | :------  | :----------------------- |
| ```locale```         | String   | BCP 47 language tag, eg. ```"fr"``` or ```"es"```. Defaults to ```"en-us"``` |
| ```weekStart```      | Int      | 0-based weekday to present first, defaulting to 0 (Sunday) |
| ```prevNextTitles``` | [String] | Array of string labels for the prev/next increment buttons. Defaults to  ```["1 Mo", "1 Yr", "10 Yr"]``` |
| ```formatOptions```  | Object   | hash for the  components of the formatted date for output to the display. The tested options are ```weekDay```, ```day```, ```month```, ```year```. [See the MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString) for the possible values. |



To globally set the language for all datepickers in your project:

```js
var myOptions = {
	weekday: 'short',
	day: '2-digit',
	month: 'short',
	year: 'numeric'
}

DatePicker.localize({
  weekStart: 1, // Monday 
  locale: 'es',
  prevNextTitles: ['1 Me', '1 Añ', '10 Añ'],
  formatOptions: myOptions
})
```

To set the language for a single datepicker, overriding the default/global setting, pass ```attrs``` to the component:  
```js
m(DatePicker, {
  date: myDate,
  onchange: myOnchangeFn,
  weekStart: 0, // override the global we set above
  locale: 'fr',
  formatOptions: myOptions 
})
```
