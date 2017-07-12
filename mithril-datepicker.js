;(function () {
	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	var longMonths = [0, 2, 4, 6, 7, 9, 11]

	function classForDateBox(props, date) {
		if (props.year !== props.date.getFullYear() || props.month !== props.date.getMonth()) {
			// TODO: if the chosen date is visible but in 'other' month, it should still get the 'chosen' class
			return ''
		}

		return (props.date.getDate() === date) ? 'chosen' : ''
	}

	function chooseDate(vnode, e) {
		var box = e.target
		var date = parseInt(box.textContent)
		
		var props = vnode.attrs.props

		if (box.classList.contains('not-this-month')) {
			stepMonth(props, date > 6 ? -1 : 1) // 6 === max days to display from prev or next month
		}

		props.date.setFullYear(props.year, props.month, date)

		if (vnode.attrs.commit) vnode.attrs.commit(props.date)

		props.active = false
	}

	function classForMonthBox(props, month) {
		return (props.date.getMonth() === month && props.date.getFullYear() === props.year) ? 'chosen' : ''
	}

	function defaultDate() {
		var now = new Date()
		now.setHours(0, 0, 0, 0)
		return now
	}
	
	function stepMonth(props, delta) {
		var obj = adjustedProps(props, delta)
		props.month = obj.month
		props.year = obj.year
	}

	function stepYear(props, delta) {
		props.year += delta
	}
	
	var fadeComponent = function(){
		return {
			oncreate: function (vnode) {
				requestAnimationFrame(function () { vnode.dom.classList.remove('incoming') })
			},
			onbeforeremove: function (vnode) {
				vnode.dom.classList.add('incoming')
				return new Promise(function (done) {
					setTimeout(done, 2000)
				})
			}
		}
	}

	function adjustedProps(props, delta) {
		var month = props.month, year = props.year
		month += delta

		var over = month > 11
		var under = month < 0
		
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

	function displayDate(date) {
		return days[date.getDay()].substring(0, 3) + ' ' + months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear()
	}

	var DatePicker = {
		oninit: function (vnode) {
			var date = vnode.attrs.date || defaultDate()
			vnode.state.props = {
				date: date,
				month: date.getMonth(),
				year: date.getFullYear(),
				active: false,
				yearView: false
			}
		},
		view: function (vnode) {
			var props = vnode.state.props
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
						? props.yearView
							? m(YearView, { props: props })
							: m(MonthView, { props: props, commit: vnode.attrs.commit })
						: null
				)
			)
		}
	}
	
	var Header = {
		view: function (vnode) {
			var props = vnode.attrs.props
			return m('header'
				, props.yearView ? m('button.prev10', { onclick: stepYear.bind(null, props, -10) } ) : null
				, m('button.prev'
					, { onclick: vnode.attrs.stepFn.bind(null, props, -1) }
				)
				, m('button.month-year'
					, { onclick: function(){ props.yearView = !props.yearView } }
					, vnode.attrs.text
				)
				, m('button.next'
					, { onclick: vnode.attrs.stepFn.bind(null, props, 1) }
				)
				, props.yearView ? m('button.next10', { onclick: stepYear.bind(null, props, 10) } ) : null
			)
		}
	}
	
	var YearView = fadeComponent()
	YearView.view = function (vnode) {
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
								props.yearView = false

							}
						}
						, m('.number', month.substring(0, 3))
					)
				})
			)
		)
	}

	var MonthView = fadeComponent()
	MonthView.view = function (vnode) {
		var props = vnode.attrs.props
		return m('.calendar.incoming'
			, m(Header, { props: props, stepFn: stepMonth, text: months[props.month] + ' ' + props.year })
			, m('.weekdays'
				, days.map(function (day) {
					return m('.day.dummy', day.substring(0, 1))
				})
			)
			, m('.weekdays'
				, { onclick: chooseDate.bind(null, vnode) }
				, daysFromLastMonth(props).map(function (date) {
					return m('button.day.not-this-month', date)
				})
				, daysFromThisMonth(props).map(function (date) {
					return m('button.day'
						, { class: classForDateBox(props, date) }
						, m('.number', date)
					)
				})
				, daysFromNextMonth(props).map(function (date) {
					return m('button.day.not-this-month', date)
				})
			)
		)
	}

	if (typeof module === 'object') module.exports = DatePicker
	else window.DatePicker = DatePicker	
})()