;(function () {
	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	var longMonths = [0, 2, 4, 6, 7, 9, 11]

	/***************************************
	 *
	 * actions
	 *
	 ***************************************/

	function chooseDate(vnode, e) {
		var box = e.target
		var date = parseInt(box.textContent)
		var props = vnode.attrs.props

		if (box.classList.contains('other-scope')) {
			stepMonth(props, date > 6 ? -1 : 1) // 6 === max days to display from prev or next month
		}

		props.date.setFullYear(props.year, props.month, date)
	}
	
	function stepMonth(props, delta) {
		var obj = adjustedProps(props, delta)
		props.month = obj.month
		props.year = obj.year
	}

	function stepYear(props, delta) {
		props.year += delta
	}

	function switchView(props) {
		props.view = props.view < 2 ? props.view + 1 : 0
	}


	/***************************************
	 *
	 * utility
	 *
	 ***************************************/

	function adjustedProps(props, delta) {
		var month = props.month + delta, year = props.year
		var over = month > 11, under = month < 0
		return {
			month: over ? 0 : under ? 11 : month,
			year: over ? year + 1 : under ? year - 1 : year
		}
	}

	function lastDateInMonth(props, delta) {
		var obj = adjustedProps(props, delta)
		if (longMonths.indexOf(obj.month) > -1) return 31
		if (obj.month === 1) {
			if (!(obj.year % 400)) return 29
			if (!(obj.year % 100)) return 28
			return (obj.year % 4) ? 28 : 29
		}

		return 30
	}

	/***************************************
	 *
	 * generators
	 *
	 ***************************************/

	function currentView(vnode) {
		var props = vnode.state.props 
		switch(props.view) {
			case 0: return m(MonthView, { props: props, commit: vnode.attrs.commit })
			case 1: return m(YearView, { props: props })
			case 2: return m(DecadeView, {props: props })
		}
	}

	function daysFromLastMonth(props){
		var month = props.month, year = props.year
		var day = (new Date(year, month, 1)).getDay()
		var array = []
		if (day > 0) {
			var len = lastDateInMonth(props, -1)
			for (var i=len-day+1; i<=len; i++) { array.push(i) }
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
		var month = props.month, year = props.year
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

	function decadeForYear(year) {
		var start = year - (year % 10)
		var array = []
		for (var i=start-1; i<start+11; i++) {
			array.push(i)
		}
		return array
	}

	/***************************************
	 *
	 * view helpers
	 * 
	 ***************************************/
	
	function classForDateBox(props, date) {
		if (props.year !== props.date.getFullYear() || props.month !== props.date.getMonth()) {
			// TODO: if the chosen date is visible but in 'other' month, it should still get the 'chosen' class
			return ''
		}

		return (props.date.getDate() === date) ? 'chosen' : ''
	}

	function classForMonthBox(props, month) {
		return (props.date.getMonth() === month && props.date.getFullYear() === props.year) ? 'chosen' : ''
	}

	function classForYearBox(props, year, idx) {
		if (props.date.getFullYear() === year) return 'chosen'
		if (idx === 0 || idx === 11) return 'other-scope'
		return ''
	}

	function displayDate(date) {
		return days[date.getDay()].substring(0, 3) + ' ' + months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear()
	}

	function titleForDecade(year) {
		return String(year).substring(0, 3) + '0s'
	}


	/***************************************
	 *
	 * attrs factory
	 *
	 ***************************************/

	var fadeComponent = function(view){
		return {
			oncreate: function (vnode) {
				requestAnimationFrame(function () { vnode.dom.classList.remove('incoming') })
			},
			onbeforeremove: function (vnode) {
				vnode.dom.classList.add('incoming')
				return new Promise(function (done) {
					setTimeout(done, 2000)
				})
			},
			view: view
		}
	}


	/***************************************
	 *
	 * components
	 *
	 ***************************************/
	
	var DatePicker = {
		oninit: function (vnode) {
			var date = vnode.attrs.date || defaultDate()
			var year = date.getFullYear()
			vnode.state.props = {
				date: date,
				month: date.getMonth(),
				year: year,
				active: false,
				view: 0
			}
		},
		view: function (vnode) {
			var props = vnode.state.props
			var _currentView = currentView(vnode)
			return m('.mithril-date-picker-container'
				, { class: props.active ? 'active' : '' }
				, m('.mithril-date-picker'
					, props.active ? m('.overlay', { onclick: function () { props.active = false } }) : null
						, m('button.current-date'
						, {
							onclick: function () {
								props.active = !props.active
								props.yearView = false
								props.month = props.date.getMonth()
								props.year = props.date.getFullYear()
							}
						}
						, displayDate(props.date)
					)
					, props.active
						? _currentView
						: null
				)
			)
		}
	}
	
	var Header = {
		view: function (vnode) {
			var props = vnode.attrs.props
			var step = props.view === 2 ? 10 : 1
			return m('header'
				, m('button.prev'
					, { onclick: vnode.attrs.stepFn.bind(null, props, -step) }
				)
				, m('button.month-year'
					, { onclick: switchView.bind(null, props) }
					, vnode.attrs.text
				)
				, m('button.next'
					, { onclick: vnode.attrs.stepFn.bind(null, props, step) }
				)
			)
		}
	}

	var MonthView = fadeComponent(function (vnode) {
		var props = vnode.attrs.props
		return m('.calendar.incoming'
			, m(Header, { props: props, stepFn: stepMonth, text: months[props.month] + ' ' + props.year })
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
						props.active = false
					} 
				}
				, daysFromLastMonth(props).map(function (date) {
					return m('button.day.other-scope', date)
				})
				, daysFromThisMonth(props).map(function (date) {
					return m('button.day'
						, { class: classForDateBox(props, date) }
						, m('.number', date)
					)
				})
				, daysFromNextMonth(props).map(function (date) {
					return m('button.day.other-scope', date)
				})
			)
		)
	})

	var YearView = fadeComponent(function (vnode) {
		var props = vnode.attrs.props
		return m('.calendar.incoming'
			, m(Header, { props: props, stepFn: stepYear, text: props.year })
			, m('.months'
				, months.map(function (month, idx) {
					return m('button.month'
						, {
							class: classForMonthBox(props, idx),
							onclick: function () {
								props.month = idx
								props.view--
							}
						}
						, m('.number', month.substring(0, 3))
					)
				})
			)
		)
	})
	
	var DecadeView = fadeComponent(function (vnode) {
		var props = vnode.attrs.props
		var decade = decadeForYear(vnode.attrs.props.year)
		return m('.calendar.incoming'
			, m(Header, { props: props, stepFn: stepYear, text: titleForDecade(props.year) })
			, m('.years'
				, decade.map(function (year, idx) {
					return m('button.month'
						, {
							class: classForYearBox(props, year, idx),
							onclick: function () {
								props.year = year
								props.view--
							}
						}
						, m('.number', year)
					)
				})
			)
		)
	})
	
	if (typeof module === 'object') module.exports = DatePicker
	else window.DatePicker = DatePicker	
})()