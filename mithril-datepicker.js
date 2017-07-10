;(function (window) {
	if (typeof window.require === 'function') require('./style.sass')

	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	var longMonths = [0, 2, 4, 6, 7, 9, 11]
	
	var State = {
		date: null,
		viewObj: {},
		active: false,
		yearView: false,
		chooseDate: function (vnode, e) {
			var box = e.target
			var date = parseInt(box.textContent)

			if (box.classList.contains('not-this-month')) {
				State.stepMonth(otherMonthIsPrev(date) ? -1 : 1)
			}

			State.date.setFullYear(State.viewObj.year, State.viewObj.month, date)

			if (vnode.attrs.commit) vnode.attrs.commit(State.date)

			State.active = false
		},
		jumpToMonth: function (month) {
			State.viewObj.month = month
			State.yearView = false
		},
		stepMonth: function(delta) {
			State.viewObj = adjustedViewObj(State.viewObj, delta)
		},
		stepYear: function (delta) {
			State.viewObj.year += delta
		}
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

	function adjustedViewObj(viewObj, delta) {
		var month = viewObj.month, year = viewObj.year
		month += delta

		var over = month > 11
		var under = month < 0

		return {
			month: over ? 0 : under ? 11 : month,
			year: over ? year + 1 : under ? year - 1 : year
		}
	}

	function lastDateInMonth(viewObj, delta) {
		var obj = adjustedViewObj(viewObj, delta)
		if (longMonths.indexOf(obj.month) > -1) return 31
		if (obj.month === 1) {
			if (!(obj.year % 400)) return 29
			if (!(obj.year % 100)) return 28
			return (obj.year % 4) ? 28 : 29
		}

		return 30
	}

	function daysFromLastMonth(viewObj){
		var month = viewObj.month, year = viewObj.year
		var day = (new Date(year, month, 1)).getDay()
		var array = []
		if (day > 0) {
			var len = lastDateInMonth(viewObj, -1)
			for (var i=len-day+1; i<=len; i++) { array.push(i) }
		}
		return array
	}

	function daysFromThisMonth(viewObj) {
		var max = lastDateInMonth(viewObj, 0)
		var array = []
		for (var i=1; i<=max; i++) {
			array.push(i)
		}
		return array
	}

	function daysFromNextMonth(viewObj) {
		var month = viewObj.month, year = viewObj.year
		var lastDate = lastDateInMonth(viewObj, 0)
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

	function classForDateBox(date) {
		// TODO: if the chosen date is visible but in 'other' month, it should still get the 'chosen' class
		var viewObj = State.viewObj
		if (viewObj.year !== State.date.getFullYear() ||
			viewObj.month !== State.date.getMonth()) return ''
		
		return (State.date.getDate() === date) ? 'chosen' : ''
	}

	function classForMonthBox(month) {
		return (State.date.getMonth() === month && State.date.getFullYear() === State.viewObj.year) ? 'chosen' : ''
	}

	function defaultDate(){
		var now = new Date()
		now.setHours(0, 0, 0, 0)
		return now
	}

	function otherMonthIsPrev(n) {
		return n > 6 // 6 === max days to display from prev or next month
	}

	var DatePicker = {
		active: false,
		oninit: function (vnode) {
			State.date = vnode.attrs.date || defaultDate()
			State.viewObj = {
				month: State.date.getMonth(),
				year: State.date.getFullYear()
			}
		},
		view: function () {
			var viewObj = State.viewObj
			return m('.container'
				, m('.mithril-date-picker'

					// chosen/default date display
					, m('button.current-date'
						, {
							onclick: function () {
								State.active = !State.active
								State.yearView = false
								State.viewObj = {
									month: State.date.getMonth(),
									year: State.date.getFullYear()
								}
							}
						}
						, displayDate(State.date)
					)
					, State.active
						? State.yearView
							? m(YearView, { viewObj: viewObj }) 
							: m(MonthView, { viewObj: viewObj })
						: null
				)
			)
		}
	}
	
	var Header = {
		view: function (vnode) {
			return m('header'
				, m('button.prev'
					, { onclick: vnode.attrs.stepFn.bind(null, -1) }
				)
				, m('button.month-year'
					, { onclick: function(){ State.yearView = !State.yearView } }
					, vnode.attrs.text
				)
				, m('button.next'
					, { onclick: vnode.attrs.stepFn.bind(null, 1) }
				)
			)
		}
	}
	
	var YearView = fadeComponent()
	YearView.view = function (vnode) {
		return m('.calendar.incoming'
			, m(Header, { stepFn: State.stepYear, text: vnode.attrs.viewObj.year })
			, m('.months'
				, months.map(function (month, idx) {
					return m('button.month'
						, {
							class: classForMonthBox(idx),
							onclick: State.jumpToMonth.bind(null, idx)
						}
						, m('.number', month.substring(0, 3))
					)
				})
			)
		)
	}

	var MonthView = fadeComponent()
	MonthView.view = function (vnode) {
		var viewObj = vnode.attrs.viewObj
		return m('.calendar.incoming'
			, m(Header, { stepFn: State.stepMonth, text: months[viewObj.month] + ' ' + viewObj.year })
			, m('.weekdays'
				, days.map(function (day) {
					return m('.day.dummy', day.substring(0, 1))
				})
			)
			, m('.weekdays'
				, { onclick: State.chooseDate.bind(null, vnode) }
				, daysFromLastMonth(viewObj).map(function (date) {
					return m('button.day.not-this-month', date)
				})
				, daysFromThisMonth(viewObj).map(function (date) {
					return m('button.day'
						, { class: classForDateBox(date) }
						, m('.number', date)
					)
				})
				, daysFromNextMonth(viewObj).map(function (date) {
					return m('button.day.not-this-month', date)
				})
			)
		)
	}

	if (typeof window.module === 'object') module.exports = DatePicker
	else window.DatePicker = DatePicker	
})(window)