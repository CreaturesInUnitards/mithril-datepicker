;(function () {
	var m = (typeof global !== 'undefined') 
		? (global.m || require('mithril'))
		: window.m

	if (!m) throw ("mithril-datepicker can't find Mithril.js")
	
	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	var prevNextTitles = ['1 Mo', '1 Yr', '10 Yr']
	var weekStart = 0
	var locale = 'en-us'
	var formatOptions = null

	/***************************************
	 *
	 * actions
	 *
	 ***************************************/

	function chooseDate(props, e) {
		var box = e.target
		var selectedDate = parseInt(box.textContent)
		var dateObj = props.date
		if (box.classList.contains('other-scope')) {
			dateObj.setFullYear(dateObj.getFullYear(), dateObj.getMonth() + (selectedDate > 6 ? -1 : 1), selectedDate)
		} else {
			dateObj.setDate(selectedDate)
		}
	}

	function dismissAndCommit(props, onchange) {
		props.view = 0
		props.active = false
		if (onchange) onchange(props.date)
	}
	
	function prevNext(props, delta){
		var newDate = new Date(props.date)
		switch (props.view) {
			case 0:
				newDate.setMonth(newDate.getMonth() + delta)
				break
			case 1:
				newDate.setFullYear(newDate.getFullYear() + delta)
				break
			default:
				newDate.setFullYear(newDate.getFullYear() + (delta * 10))
		}
		props.date = pushToLastDay(props.date, newDate)
	}

	/***************************************
	 *
	 * utility
	 *
	 ***************************************/

	function adjustedProps(date, delta) {
		var month = date.getMonth() + delta, year = date.getFullYear()
		var over = month > 11, under = month < 0
		return {
			month: over ? 0 : under ? 11 : month,
			year: over ? year + 1 : under ? year - 1 : year
		}
	}

	function lastDateInMonth(date, delta) {
		var obj = adjustedProps(date, delta)
		if ([0, 2, 4, 6, 7, 9, 11].indexOf(obj.month) > -1) return 31 // array of 31-day props.months
		if (obj.month === 1) { // February
			if (!(obj.year % 400)) return 29
			if (!(obj.year % 100)) return 28
			return (obj.year % 4) ? 28 : 29
		}
		return 30
	}

	function pushToLastDay(oldDate, newDate) {
		if (oldDate.getDate() !== newDate.getDate()) {
			newDate.setMonth(newDate.getMonth() - 1, lastDateInMonth(newDate, -1))
		}
		return newDate
	}

  // Removes extra LTR and RTL characters added by toLocaleDateString function in IE11
	// https://stackoverflow.com/questions/36225603/internet-explorer-returning-wrong-length-of-string
	function sanitizeLocaleDateString(str) {
		return str.replace(/[^ -~]/g, '')
	}

	function stringsForLocale(locale) {
		var date = new Date('jan 1 2017'), _months = [], _days = [] // 1/1/2017 was month:0 and weekday:0, so perfect
		while (_days.length < 7) {
			_days.push(sanitizeLocaleDateString(date.toLocaleDateString(locale, { weekday: 'long' })))
			date.setDate(date.getDate() + 1)
		}
		while (_months.length < 12) {
			_months.push(sanitizeLocaleDateString(date.toLocaleDateString(locale, { month: 'long' })))
			date.setMonth(date.getMonth() + 1)
		}
		return { days: _days, months: _months }
	}

	function wrapAround(idx, array) {
		var len = array.length
		var n = idx >= len ? idx - len : idx
		return array[n]
	}

	/***************************************
	 *
	 * generators
	 *
	 ***************************************/

	function daysFromLastMonth(props){
		var month = props.date.getMonth(), year = props.date.getFullYear()
		var firstDay = (new Date(year, month, 1)).getDay() - props.weekStart
		if (firstDay < 0) firstDay += 7
		var array = []
		var lastDate = lastDateInMonth(props.date, -1)
		var offsetStart = lastDate - firstDay + 1
		for (var i=offsetStart; i<=lastDate; i++) { array.push(i) }
		return array
	}

	function daysFromThisMonth(props) {
		var max = lastDateInMonth(props.date, 0)
		var array = []
		for (var i=1; i<=max; i++) {
			array.push(i)
		}
		return array
	}

	function daysFromNextMonth(prev, these) {
		var soFar = prev.concat(these)
		var mod = soFar.length % 7
		var array = []
		if (mod > 0) {
			var n = 7 - mod
			for (var i=1; i<=n; i++) { array.push(i) }
		}
		return array
	}

	function defaultDate() {
		var now = new Date()
		now.setHours(0, 0, 0, 0)
		return now
	}

	function yearsForDecade(date) {
		var year = date.getFullYear()
		var start = year - (year % 10)
		var array = []
		for (var i=start; i<start+10; i++) { array.push(i) }
		return array
	}

	/***************************************
	 *
	 * view helpers
	 *
	 ***************************************/

	function classForBox(a, b) { return a === b ? 'chosen' : '' }

	function displayDate(props) {
		return sanitizeLocaleDateString(props.date
			.toLocaleDateString(props.locale, props.formatOptions || {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			}))
	}

	/***************************************
	 *
	 * components
	 *
	 ***************************************/
	
	var Header = {
		view: function (vnode) {
			var props = vnode.attrs.props
			var date = props.date
			var theseMonths = props.months || months
			return m('.header'
				, m('.button-bg', { class: 'v' + props.view })
				, m('.fake-border')
				, m('button.prev'
					, {
						onclick: prevNext.bind(null, props, -1),
						type: 'button'
					}
					, prevNextTitles[props.view]
				)
				, m('button.segment', {
						onclick: function () { props.view = 0 },
          	type: 'button'
					}, date.getDate())
				, m('button.segment', {
						onclick: function () { props.view = 1 },
          	type: 'button'
					}, theseMonths[date.getMonth()].substr(0, 3))
				, m('button.segment', {
						onclick: function () { props.view = 2 },
          	type: 'button'
					}, date.getFullYear())
				, m('button.next'
					, {
						onclick: prevNext.bind(null, props, 1),
            type: 'button'
					}
					, prevNextTitles[props.view]
				)
			)
		}
	}

	var MonthView = {
		view: function (vnode) {
			var props = vnode.attrs.props
			var prevDates = daysFromLastMonth(props)
			var theseDates = daysFromThisMonth(props)
			var nextDates = daysFromNextMonth(prevDates, theseDates)
			var theseWeekdays = props.days || days
			return m('.calendar'
				, m('.weekdays'
					, theseWeekdays.map(function (_, idx) {
						var day = wrapAround(idx + props.weekStart, theseWeekdays)
						return m('.day.dummy', day.substring(0, 2))
					})
				)
				, m('.weekdays'
					, {
						onclick: function(e){
							chooseDate(props, e)
							dismissAndCommit(props, vnode.attrs.onchange)
						}
					}
					, prevDates.map(function (date) {
						return m('button.day.other-scope', {
              type: 'button'
						}, date)
					})
					, theseDates.map(function (date) {
						return m('button.day'
							, {
								class: classForBox(props.date.getDate(), date),
                type: 'button'
							}
							, m('.number', date)
						)
					})
					, nextDates.map(function (date) {
						return m('button.day.other-scope', {
              type: 'button'
            }, date)
					})
				)
			)
			
		}
	}
	
	var YearView = {
		view: function (vnode) {
			var props = vnode.attrs.props
			var theseMonths = props.months || months
			return m('.calendar'
				, m('.months'
					, theseMonths.map(function (month, idx) {
						return m('button.month'
							, {
								class: classForBox(props.date.getMonth(), idx),
								onclick: function () {
									var newDate = new Date(props.date)
									newDate.setMonth(idx)
									props.date = pushToLastDay(props.date, newDate)
									props.view = 0
								},
								type: 'button'
							}
							, m('.number', month.substring(0, 3))
						)
					})
				)
			)
		}
	}
	
	var DecadeView = {
		view: function (vnode) {
			var props = vnode.attrs.props
			var decade = yearsForDecade(props.date)
			return m('.calendar'
				, m('.years'
					, decade.map(function (year) {
						return m('button.year'
							, {
								class: classForBox(props.date.getFullYear(), year),
								onclick: function () {
									var newDate = new Date(props.date)
									newDate.setFullYear(year)
									props.date = pushToLastDay(props.date, newDate)
									props.view = 1
								},
								type: 'button'
							}
							, m('.number', year)
						)
					})
				)
			)
		}
	}

	var Editor = {
		oncreate: function (vnode) {
			requestAnimationFrame(function () { vnode.dom.classList.add('active') })
		},
		onbeforeremove: function (vnode) {
			vnode.dom.classList.remove('active')
			return new Promise(function (done) { setTimeout(done, 200) })
		},
		view: function (vnode) {
			var props = vnode.attrs.props
			return m('.editor'
				, m(Header, { props: props })
				, m('.sled'
					, { class: 'p' + props.view }
					, m(MonthView, { props: props, onchange: vnode.attrs.onchange })
					, m(YearView, { props: props })
					, m(DecadeView, {props: props })
				)
			)
		}
	}

	var DatePicker = {
		localize: function (loc) {
			if (loc) {
				prevNextTitles = loc.prevNextTitles || prevNextTitles
				locale = loc.locale || locale
				formatOptions = loc.formatOptions || formatOptions
				weekStart = typeof loc.weekStart === 'number'
					? loc.weekStart
					: weekStart
				
				var strings = stringsForLocale(locale)
				days = strings.days
				months = strings.months
			}
		},
		oninit: function (vnode) {
			var attrs = vnode.attrs
			var props = {
				date: new Date(attrs.date || defaultDate()),
				active: false,
				view: 0
			}

			props.prevNextTitles = attrs.prevNextTitles || prevNextTitles
			props.locale = attrs.locale || locale
			props.formatOptions = attrs.formatOptions || formatOptions
			props.weekStart = typeof attrs.weekStart === 'number' ? attrs.weekStart : weekStart

			if (attrs.locale && attrs.locale !== locale) {
				var strings = stringsForLocale(props.locale)
				props.days = strings.days
				props.months = strings.months
			}

			vnode.state.props = props
		},
		view: function(vnode){
			var props = vnode.state.props
			var displayText = displayDate(props)
			return m('.mithril-date-picker-container'
				, { class: props.active ? 'active' : '' }
				, m('.mithril-date-picker'
					, m('.button.current-date'
						, {
							onclick: function(){
								if (props.active) props.view = 0
								props.active = !props.active
							}
						}
						, displayText
					)
					, props.active && m('.overlay', { onclick: dismissAndCommit.bind(null, props, vnode.attrs.onchange) })
					, props.active && m(Editor, { props: props, onchange: vnode.attrs.onchange })
				)
			)
		}
	}
	
	if (typeof module === 'object') module.exports = DatePicker
	else if (typeof window !== 'undefined') window.DatePicker = DatePicker
	else global.DatePicker = DatePicker
})()
