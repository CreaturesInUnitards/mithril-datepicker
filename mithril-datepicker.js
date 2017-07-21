;(function () {
	var m = (typeof require !== 'undefined') ? require('mithril') : window.m
	if (!m) throw ("Mithril doesn't seem to be showing up anywhere. You should probably get that figured out.")
	
	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	var prevNextTitles = ['1 Mo', '1 Yr', '10 Yr']

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
		props.date = pushTolastDay(props.date, newDate)
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

	function pushTolastDay(oldDate, newDate) {
		if (oldDate.getDate() !== newDate.getDate()) {
			newDate.setMonth(newDate.getMonth() - 1, lastDateInMonth(newDate, -1))
		}
		return newDate
	}

	function wrapAround(idx, array) {
		var len = array.length
		var n = idx >= len ? idx - len : idx
		return array[n]
	}

	/***************************************
	 *
	 * view helpers
	 * 
	 ***************************************/

	function classForBox(a, b) { return a === b ? 'chosen' : '' }

	function displayDate(props) {
		var date = props.date
		return props.days[date.getDay()].substring(0, 3) + ' ' + props.months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear()
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
	 * components
	 *
	 ***************************************/
	
	var Header = {
		view: function (vnode) {
			var props = vnode.attrs.props
			var date = props.date
			return m('.header'
				, m('.button-bg', { class: 'v' + props.view })
				, m('.fake-border')
				, m('button.prev'
					, { onclick: prevNext.bind(null, props, -1) }
					, prevNextTitles[props.view]
				)
				, m('button.segment', { onclick: function () { props.view = 0 } }, date.getDate())
				, m('button.segment', { onclick: function () { props.view = 1 } }, props.months[date.getMonth()].substr(0, 3))
				, m('button.segment', { onclick: function () { props.view = 2 } }, date.getFullYear())
				, m('button.next'
					, { onclick: prevNext.bind(null, props, 1) }
					, prevNextTitles[props.view]
				)
			)
		}
	}

	var MonthView = {
		view: function (vnode) {
			var props = vnode.attrs.props
			var prevDays = daysFromLastMonth(props)
			var theseDays = daysFromThisMonth(props)
			var nextDays = daysFromNextMonth(prevDays, theseDays)
			return m('.calendar'
				, m('.weekdays'
					, props.days.map(function (_, idx) {
						var day = wrapAround(idx + props.weekStart, props.days)
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
					, prevDays.map(function (date) {
						return m('button.day.other-scope', date)
					})
					, theseDays.map(function (date) {
						return m('button.day'
							, { class: classForBox(props.date.getDate(), date) }
							, m('.number', date)
						)
					})
					, nextDays.map(function (date) {
						return m('button.day.other-scope', date)
					})
				)
			)
			
		}
	}
	
	var YearView = {
		view: function (vnode) {
			var props = vnode.attrs.props
			return m('.calendar'
				, m('.months'
					, props.months.map(function (month, idx) {
						return m('button.month'
							, {
								class: classForBox(props.date.getMonth(), idx),
								onclick: function () {
									var newDate = new Date(props.date)
									newDate.setMonth(idx)
									props.date = pushTolastDay(props.date, newDate)
									props.view = 0
								}
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
									props.date = pushTolastDay(props.date, newDate)
									props.view = 1
								}
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
				days = loc.days || days
				months = loc.months || months
				prevNextTitles = loc.prevNextTitles || prevNextTitles
			}
		},
		oninit: function (vnode) {
			var localeData = vnode.attrs.localeData
			vnode.state.props = {
				date: new Date(vnode.attrs.date || defaultDate()),
				active: false,
				view: 0,
				days: localeData && localeData.days ? localeData.days : days,
				months: localeData && localeData.months ? localeData.months : months,
				prevNextTitles: localeData && localeData.prevNextTitles ? localeData.prevNextTitles : prevNextTitles,
				weekStart: localeData && localeData.weekStart ? localeData.weekStart: 0
			}
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

					, props.active
						? m('.overlay', { onclick: dismissAndCommit.bind(null, props, vnode.attrs.onchange) })
						: null
					, props.active
						? m(Editor, { props: props, onchange: vnode.attrs.onchange })
						: null
				)
			)
		}
	}
	
	if (typeof module === 'object') module.exports = DatePicker
	else window.DatePicker = DatePicker	
})()