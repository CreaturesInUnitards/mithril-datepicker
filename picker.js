require('./style.sass')

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

var longMonths = [0, 2, 4, 6, 7, 9, 11]

function adjustedDateObj(month, year, delta) {
	month += delta

	var over = month > 11
	var under = month < 0

	return {
		month: over ? 0 : under ? 11 : month,
		year: over ? year + 1 : under ? year - 1 : year
	}
}

function lastDateInMonth(month, year, delta) {
	var obj = adjustedDateObj(month, year, delta)
	if (longMonths.indexOf(obj.month) > -1) return 31
	if (obj.month === 1) {
		if (!(obj.year % 400)) return 29
		if (!(obj.year % 100)) return 28
		return (obj.year % 4) ? 28 : 29
	}

	return 30
}

function daysFromLastMonth(dateObj){
	var month = dateObj.month, year = dateObj.year
	var newDate = new Date(year, month, 1)
	var day = newDate.getDay()
	var array = []
	if (day > 0) {
		var len = lastDateInMonth(month, year, -1)
		for (var i=len-day+1; i<=len; i++) { array.push(i) }
	}
	return array
}

function daysFromThisMonth(dateObj) {
	var max = lastDateInMonth(dateObj.month, dateObj.year, 0)
	var array = []
	for (var i=1; i<=max; i++) {
		array.push(i)
	}
	return array
}

function daysFromNextMonth(dateObj) {
	var month = dateObj.month, year = dateObj.year
	var lastDate = lastDateInMonth(month, year, 0)
	var newDate = new Date(year, month, lastDate)
	var day = newDate.getDay()
	var array = []
	if (day < 6) {
		for (var i=1; i<=6-day; i++) { array.push(i) }
	}
	return array
}

function setMonth(state, delta) {
	var obj = adjustedDateObj(state.month, state.year, delta)
	state.month = obj.month
	state.year = obj.year
}

function displayDate(date) {
	return days[date.getDay()].substring(0, 3) + ' ' + months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear()
}

function classForDateBox(vnode, date) {
	if (vnode.state.year !== vnode.state.date.getFullYear() || 
		vnode.state.month !== vnode.state.date.getMonth()) return ''
	
	return (vnode.state.date.getDate() === date) ? 'chosen' : ''
}

function chooseDate(vnode, e) {
	var box = e.target
	var date = parseInt(box.textContent)
	
	if (box.classList.contains('not-this-month')) {

		if (date > 6) { // 6 === max days to display from prev or next month
			setMonth(vnode.state, -1)
		}
		else if (date < 6) {
			setMonth(vnode.state, 1)
		}
	}
	vnode.state.date.setYear(vnode.state.year)
	vnode.state.date.setMonth(vnode.state.month)
	vnode.state.date.setDate(date)

	vnode.state.active = false

	if (vnode.attrs.commit) vnode.attrs.commit(vnode.state.date)
}

var DatePicker = {
	active: false,
	oninit: function (vnode) {
		vnode.state.date = vnode.attrs.date || new Date()
		vnode.state.month = vnode.state.date.getMonth()
		vnode.state.year = vnode.state.date.getFullYear()
	},
	view: function (vnode) {
		var dateObj = {
			month: vnode.state.month,
			year: vnode.state.year
		}
		return m('.container'
			, m('.date-picker'
				, m('.current-date'
					, {
						onclick: function () {
							vnode.state.active = !vnode.state.active
						}
					}
					, displayDate(vnode.state.date)
				)
				, vnode.state.active
					? m('.calendar'
						, m('.month-header'
							, m('button'
								, { onclick: setMonth.bind(null, vnode.state, -1) }
								, '<'
							)
							, m('h2', months[dateObj.month] + ' ' + dateObj.year)
							, m('button'
								, { onclick: setMonth.bind(null, vnode.state, 1) }
								, '>'
							)
						)
						, m('.weekdays'
							, days.map(function (day) {
								return m('.day.dummy', day.substring(0, 1))
							})
						)
						, m('.weekdays'
							, { onclick: chooseDate.bind(null, vnode) }
							, daysFromLastMonth(dateObj).map(function (date) {
								return m('.day.not-this-month', date)
							})
							, daysFromThisMonth(dateObj).map(function (date) {
								return m('.day'
									, { class: classForDateBox(vnode, date) }
									, m('.number', date)
								)
							})
							, daysFromNextMonth(dateObj).map(function (date) {
								return m('.day.not-this-month', date)
							})
						)
					)
					: null
			)
		)
	}
}

module.exports = DatePicker