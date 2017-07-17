;(function () {
	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	var viewTitles = ['1 Mo', '1 Yr', '10 Yr']

	/***************************************
	 *
	 * actions
	 *
	 ***************************************/

	function chooseDate(vnode, e) {
		var box = e.target
		var selectedDate = parseInt(box.textContent)
		var dateObj = vnode.attrs.props.date
		if (box.classList.contains('other-scope')) {
			dateObj.setFullYear(dateObj.getFullYear(), dateObj.getMonth() + (selectedDate > 6 ? -1 : 1), selectedDate)
		} else {
			dateObj.setDate(selectedDate)
		}
	}

	function dismiss(props) {
		props.view = 0
		props.active = false
	}
	
	function prevNext(props, delta){
		var date = props.date
		switch (props.view) {
			case 0:
				date.setMonth(date.getMonth() + delta)
				break
			case 1:
				date.setFullYear(date.getFullYear() + delta)
				break
			default:
				date.setFullYear(date.getFullYear() + (delta * 10))
		}
	}

	/***************************************
	 *
	 * utility
	 *
	 ***************************************/

	function adjustedProps(props, delta) {
		var month = props.date.getMonth() + delta, year = props.date.getFullYear() + delta
		var over = month > 11, under = month < 0
		return {
			month: over ? 0 : under ? 11 : month,
			year: over ? year + 1 : under ? year - 1 : year
		}
	}

	function lastDateInMonth(props, delta) {
		var obj = adjustedProps(props, delta)
		if ([0, 2, 4, 6, 7, 9, 11].indexOf(obj.month) > -1) return 31 // array of 31-day months
		if (obj.month === 1) { // February
			if (!(obj.year % 400)) return 29
			if (!(obj.year % 100)) return 28
			return (obj.year % 4) ? 28 : 29
		}
		return 30
	}

	/***************************************
	 *
	 * view helpers
	 * 
	 ***************************************/

	function classForBox(a, b) { return a === b ? 'chosen' : '' }

	function displayDate(date) {
		return days[date.getDay()].substring(0, 3) + ' ' + months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear()
	}

	/***************************************
	 *
	 * generators
	 *
	 ***************************************/

	function daysFromLastMonth(props){
		var month = props.date.getMonth(), year = props.date.getFullYear()
		var day = (new Date(year, month, 1)).getDay()
		var array = []
		if (day > 0) {
			var n = lastDateInMonth(props, -1)
			for (var i=n-day+1; i<=n; i++) { array.push(i) }
		}
		return array
	}

	function daysFromThisMonth(props) {
		var max = lastDateInMonth(props, 0)
		var array = []
		for (var i=1; i<=max; i++) {
			array.push(i)
		}
		return array
	}

	function daysFromNextMonth(props) {
		var month = props.date.getMonth(), year = props.date.getFullYear()
		var lastDate = lastDateInMonth(props, 0)
		var day = (new Date(year, month, lastDate)).getDay()
		var array = []
		if (day < 6) {
			for (var i=1; i<=6-day; i++) { array.push(i) }
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
					, {
						onclick: function() {
							prevNext(props, -1)
							if (vnode.attrs.commit) vnode.attrs.commit(props.date)
						}
					}
					, viewTitles[props.view]
				)
				, m('button.segment', { onclick: function () { props.view = 0 } }, date.getDate())
				, m('button.segment', { onclick: function () { props.view = 1 } }, months[date.getMonth()].substr(0, 3))
				, m('button.segment', { onclick: function () { props.view = 2 } }, date.getFullYear())
				, m('button.next'
					, {
						onclick: function() {
							prevNext(props, 1)
							if (vnode.attrs.commit) vnode.attrs.commit(props.date)
						}
					}
					, viewTitles[props.view]
				)
			)
		}
	}

	var MonthView = {
		view: function (vnode) {
			var props = vnode.attrs.props
			return m('.calendar'
				, m('.weekdays'
					, days.map(function (day) {
						return m('.day.dummy', day.substring(0, 1))
					})
				)
				, m('.weekdays'
					, {
						onclick: function(e){
							chooseDate(vnode, e)
							if (vnode.attrs.commit) vnode.attrs.commit(props.date)
							dismiss(props)
						}
					}
					, daysFromLastMonth(props).map(function (date) {
						return m('button.day.other-scope', date)
					})
					, daysFromThisMonth(props).map(function (date) {
						return m('button.day'
							, { class: classForBox(props.date.getDate(), date) }
							, m('.number', date)
						)
					})
					, daysFromNextMonth(props).map(function (date) {
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
					, months.map(function (month, idx) {
						return m('button.month'
							, {
								class: classForBox(props.date.getMonth(), idx),
								onclick: function () {
									props.date.setMonth(idx)
									props.view = 0
									if (vnode.attrs.commit) vnode.attrs.commit(props.date)
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
									props.date.setFullYear(year)
									props.view = 1
									if (vnode.attrs.commit) vnode.attrs.commit(props.date)
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
				, m(Header, { props: props, commit: vnode.attrs.commit })
				, m('.sled'
					, { class: 'p' + props.view }
					, m(MonthView, { props: props, commit: vnode.attrs.commit })
					, m(YearView, { props: props, commit: vnode.attrs.commit })
					, m(DecadeView, {props: props, commit: vnode.attrs.commit })
				)
			)
		}
	}

	var DatePicker = {
		oninit: function (vnode) {
			vnode.state.props = {
				date: new Date(vnode.attrs.date || defaultDate()),
				active: false,
				view: 0
			}
		},
		view: function(vnode){
			var props = vnode.state.props
			var displayText = displayDate(props.date)
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
						? [
							m('.overlay', { onclick: dismiss.bind(null, props) }),
							m(Editor, { props: props, commit: vnode.attrs.commit })
						]
						: null
				)
			)
		}
	}
	
	if (typeof module === 'object') module.exports = DatePicker
	else window.DatePicker = DatePicker	
})()